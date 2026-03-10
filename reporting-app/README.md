# PowerReport — Power BI-Style Reporting Web Application

A full-stack reporting app that lets users build interactive **Table** and **Matrix** reports from SQL Server data using drag-and-drop fields — inspired by Power BI's report builder.

---

## Project Structure

```
reporting-app/
├── backend/         # FastAPI Python backend
│   ├── main.py
│   ├── requirements.txt
│   └── .env         # ← Update with your SQL Server credentials
└── frontend/        # React + Vite frontend
    ├── src/
    │   ├── components/
    │   │   ├── DatasetSelector.jsx
    │   │   ├── FieldsPanel.jsx
    │   │   ├── VisualizationTypeSelector.jsx
    │   │   ├── ReportCanvas.jsx
    │   │   └── GridRenderer.jsx
    │   ├── App.jsx
    │   ├── api.js
    │   ├── index.css
    │   └── main.jsx
    └── index.html
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.9+ |
| Node.js | 18+ |
| ODBC Driver | 17 or 18 for SQL Server |
| SQL Server | Any recent version |

---

## 1. Configure Database Connection

Edit `backend/.env`:

```env
DB_SERVER=YOUR_SERVER_NAME          # e.g. localhost\SQLEXPRESS or 192.168.1.10
DB_DATABASE=YOUR_DATABASE_NAME      # e.g. ReportingDB
DB_USERNAME=YOUR_USERNAME           # e.g. sa
DB_PASSWORD=YOUR_PASSWORD
DB_DRIVER=ODBC+Driver+17+for+SQL+Server
```

### Expand the Table Mapping

In `backend/main.py`, update `table_mapping` to match your actual database tables:

```python
table_mapping = {
    "Financial": {
        "Transactions": "your_transactions_table",
        "Invoices": "your_invoices_table",
    },
    "Vendor": {
        "Vendor Master": "your_vendor_master_table",
    },
    # Add more categories/subcategories as needed
}
```

---

## 2. Run the Backend

```bash
cd reporting-app/backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at: **http://localhost:8000**  
Swagger docs: **http://localhost:8000/docs**

---

## 3. Run the Frontend

Open a **new terminal**:

```bash
cd reporting-app/frontend
npm install
npm run dev
```

The app will be available at: **http://localhost:5173**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/categories` | Returns the full category → subcategory mapping |
| `GET` | `/dataset-schema?category=X&subcategory=Y` | Returns column names for the mapped table |
| `GET` | `/dataset-data?category=X&subcategory=Y` | Returns up to 100 rows of data |

---

## How to Use

1. **Select a Dataset** — Choose a Category and Subcategory from the left sidebar
2. **Fields appear** in the Fields Panel below
3. **Drag fields** from the Fields Panel into the **Rows**, **Columns**, or **Values** drop zones
4. **Choose a visualization**: Table or Matrix
5. **Click ▶ Run Report** — AG Grid renders your data

### Table Mode
Displays selected Rows + Values as flat grid columns.

### Matrix Mode
Pivots the data: Rows group the left axis, Columns pivot to headers, Values are aggregated (sum).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Drag & Drop | dnd-kit |
| Grid | AG Grid Community |
| HTTP | Axios |
| Backend | FastAPI (Python) |
| ORM | SQLAlchemy |
| DB Driver | pyodbc |
| Database | Microsoft SQL Server |
