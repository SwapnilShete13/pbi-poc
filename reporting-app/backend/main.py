import os
import re
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="PBI Reporting API", version="1.0.0")

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
        "http://localhost:5175", "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── DB connection ───────────────────────────────────────────────────────────────
DATABASE_URL = (
    "mssql+pyodbc://sa:Sw%4013270@DESKTOP-6876LC6\\SQLEXPRESS/ReportingPOC"
    "?driver=ODBC+Driver+17+for+SQL+Server"
)
engine = create_engine(DATABASE_URL, echo=False)

# ── Dataset / table mapping ─────────────────────────────────────────────────────
table_mapping: dict[str, dict[str, str]] = {
    "Financial": {
        "Transactions": "transactions",
        "Invoices":     "invoices",
    },
    "Vendor": {
        "Vendor Master": "vendor_master",
    },
    "HR": {
        "Employees":   "employees",
        "Departments": "departments",
    },
    "Sales": {
        "Orders":   "orders",
        "Products": "products",
    },
    "Vendors": {
       "VendorMaster": "vendor_master_new",
    },
    
}


def _resolve_table(category: str, subcategory: str) -> str:
    cat = table_mapping.get(category)
    if cat is None:
        raise HTTPException(status_code=404, detail=f"Category '{category}' not found.")
    table = cat.get(subcategory)
    if table is None:
        raise HTTPException(
            status_code=404,
            detail=f"Subcategory '{subcategory}' not found in category '{category}'.",
        )
    return table


# ── Safety check — blocks write/admin SQL, allows SELECT only ──────────────────
BLOCKED_PATTERNS = re.compile(
    r"\b(DROP|DELETE|INSERT|UPDATE|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE|"
    r"XP_|SP_|OPENROWSET|OPENDATASOURCE|BULK|MERGE|GRANT|REVOKE|DENY|"
    r"SHUTDOWN|BACKUP|RESTORE)\b",
    re.IGNORECASE,
)

def _validate_sql(sql: str) -> None:
    if BLOCKED_PATTERNS.search(sql):
        raise HTTPException(
            status_code=400,
            detail="Query contains disallowed keywords. Only SELECT queries are permitted.",
        )
    if "--" in sql or "/*" in sql:
        raise HTTPException(
            status_code=400,
            detail="SQL comments are not allowed.",
        )
    if not re.match(r"^\s*SELECT\b", sql, re.IGNORECASE):
        raise HTTPException(
            status_code=400,
            detail="Only SELECT queries are allowed.",
        )


# ── Endpoints ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "PBI Reporting API is running."}


@app.get("/categories")
def get_categories():
    return table_mapping


@app.get("/dataset-schema")
def get_dataset_schema(
    category: str = Query(...),
    subcategory: str = Query(...),
):
    table = _resolve_table(category, subcategory)
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text(
                    "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS "
                    "WHERE TABLE_NAME = :table ORDER BY ORDINAL_POSITION"
                ),
                {"table": table},
            )
            columns = [row[0] for row in result]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"DB error: {exc}")

    if not columns:
        raise HTTPException(
            status_code=404,
            detail=f"Table '{table}' not found or has no columns.",
        )
    return {"table": table, "columns": columns}


@app.get("/dataset-data")
def get_dataset_data(
    category: str = Query(...),
    subcategory: str = Query(...),
):
    """Return ALL rows from the resolved table — no row limit."""
    table = _resolve_table(category, subcategory)
    try:
        with engine.connect() as conn:
            result = conn.execute(text(f"SELECT * FROM [{table}]"))
            keys = list(result.keys())
            rows = [dict(zip(keys, row)) for row in result]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"DB error: {exc}")

    return {"table": table, "count": len(rows), "data": rows}


@app.post("/run-query")
def run_query(payload: dict):
    """
    Execute a full SSMS-style SELECT query provided by the user.

    Request body:  { "sql": "SELECT ... FROM ... WHERE ..." }
    Response:      { "count": N, "columns": [...], "data": [...] }

    Supports any valid SELECT — JOINs, aggregations, CTEs, subqueries,
    date functions, CASE expressions, etc.
    Only SELECT is permitted; write/admin operations are blocked.
    """
    sql: str = payload.get("sql", "").strip()

    if not sql:
        raise HTTPException(status_code=400, detail="No SQL query provided.")

    _validate_sql(sql)

    try:
        with engine.connect() as conn:
            result = conn.execute(text(sql))
            keys = list(result.keys())
            rows = [dict(zip(keys, row)) for row in result]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"DB error: {str(exc)}")

    return {"count": len(rows), "columns": keys, "data": rows}