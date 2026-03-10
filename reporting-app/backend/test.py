import pyodbc

conn = pyodbc.connect(
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=DESKTOP-6876LC6\\SQLEXPRESS;"
    "DATABASE=ReportingPOC;"
    "UID=sa;"
    "PWD=Sw@13270"
)

print("Connected successfully")