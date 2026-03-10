import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="PBI Reporting API", version="1.0.0")

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173",
                   "http://localhost:5174", "http://127.0.0.1:5174",
                   "http://localhost:5175", "http://127.0.0.1:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── DB connection ───────────────────────────────────────────────────────────────
DB_SERVER   = os.getenv("DB_SERVER", "DESKTOP-6876LC6\\SQLEXPRESS")
DB_DATABASE = os.getenv("DB_DATABASE", "ReportingPOC")
DB_USERNAME = os.getenv("DB_USERNAME", "sa")
DB_PASSWORD = os.getenv("DB_PASSWORD", "Sw@13270")
DB_DRIVER   = os.getenv("DB_DRIVER", "ODBC+Driver+17+for+SQL+Server")

# DATABASE_URL = (
#     f"mssql+pyodbc://{DB_USERNAME}:{DB_PASSWORD}@{DB_SERVER}/{DB_DATABASE}"
#     f"?driver={DB_DRIVER}"
# )

DATABASE_URL = (
    "mssql+pyodbc://sa:Sw%4013270@DESKTOP-6876LC6\\SQLEXPRESS/ReportingPOC"
    "?driver=ODBC+Driver+17+for+SQL+Server"
)
engine = create_engine(DATABASE_URL, echo=False)

# ── Dataset / table mapping ─────────────────────────────────────────────────────
table_mapping: dict[str, dict[str, str]] = {
    "Financial": {
        "Transactions": "transactions",
        "Invoices": "invoices",
    },
    "Vendor": {
        "Vendor Master": "vendor_master",
    },
    "HR": {
        "Employees": "employees",
        "Departments": "departments",
    },
    "Sales": {
        "Orders": "orders",
        "Products": "products",
    },
}


def _resolve_table(category: str, subcategory: str) -> str:
    """Return the SQL table name for a given category + subcategory pair."""
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


# ── Endpoints ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "PBI Reporting API is running."}


@app.get("/categories")
def get_categories():
    """Return the full category → subcategory mapping for the UI dropdown."""
    return table_mapping


@app.get("/dataset-schema")
def get_dataset_schema(
    category: str = Query(..., description="Dataset category"),
    subcategory: str = Query(..., description="Dataset subcategory"),
):
    """Return column names for the resolved SQL Server table."""
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
    category: str = Query(..., description="Dataset category"),
    subcategory: str = Query(..., description="Dataset subcategory"),
    limit: int = Query(100, ge=1, le=1000, description="Max rows to fetch"),
):
    """Return up to `limit` rows from the resolved SQL Server table."""
    table = _resolve_table(category, subcategory)
    try:
        with engine.connect() as conn:
            # SQL Server does NOT support bound parameters in the TOP clause.
            # `limit` is safe to inline — it is validated as int in range [1, 1000]
            # by FastAPI's Query(..., ge=1, le=1000) before reaching here.
            result = conn.execute(
                text(f"SELECT TOP {limit} * FROM [{table}]")
            )
            keys = list(result.keys())
            rows = [dict(zip(keys, row)) for row in result]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"DB error: {exc}")

    return {"table": table, "count": len(rows), "data": rows}
