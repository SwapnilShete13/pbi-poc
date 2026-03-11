import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import DatasetSelector from "./components/DatasetSelector";
import FieldsPanel from "./components/FieldsPanel";
import VisualizationTypeSelector from "./components/VisualizationTypeSelector";
import ReportCanvas from "./components/ReportCanvas";
import GridRenderer from "./components/GridRenderer";
import FilterPanel from "./components/FilterPanel";
import { fetchCategories, fetchSchema, fetchData, runQuery } from "./api";

export default function App() {
  // ── Dataset state ─────────────────────────────────────────────────────────
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [columns, setColumns] = useState([]);
  const [tableName, setTableName] = useState("");
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState("");

  // ── Drop zone state ───────────────────────────────────────────────────────
  const [rowFields, setRowFields] = useState([]);
  const [colFields, setColFields] = useState([]);
  const [valFields, setValFields] = useState([]);

  // ── Viz & data state ──────────────────────────────────────────────────────
  const [vizType, setVizType] = useState("table");
  const [reportData, setReportData] = useState([]);   // base data (full table or query result)
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  // ── Filter state ──────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState("");
  const [queryActive, setQueryActive] = useState(false); // true when grid shows query results

  // slicers: { [fieldName]: Set<string> }
  //   empty Set       = no filter (all rows pass)
  //   Set{"__NONE__"} = user explicitly deselected all (zero rows pass)
  //   Set{...values}  = only rows matching these values pass
  const [slicers, setSlicers] = useState({});

  // ── Drag overlay ──────────────────────────────────────────────────────────
  const [activeId, setActiveId] = useState(null);

  // ── Load categories on mount ──────────────────────────────────────────────
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setSchemaError("Failed to load categories from backend."));
  }, []);

  // ── When subcategory changes: fetch schema + ALL data ─────────────────────
  useEffect(() => {
    if (!selectedCategory || !selectedSubcategory) return;

    setSchemaLoading(true);
    setDataLoading(true);
    setSchemaError("");
    setDataError("");
    setColumns([]);
    setTableName("");
    setRowFields([]);
    setColFields([]);
    setValFields([]);
    setReportData([]);
    setQuery("");
    setQueryError("");
    setQueryActive(false);
    setSlicers({});

    Promise.all([
      fetchSchema(selectedCategory, selectedSubcategory),
      fetchData(selectedCategory, selectedSubcategory),
    ])
      .then(([schemaRes, dataRes]) => {
        setColumns(schemaRes.columns);
        setTableName(schemaRes.table);
        setReportData(dataRes.data);
      })
      .catch((err) => {
        const msg = err?.response?.data?.detail || "Failed to load dataset.";
        setSchemaError(msg);
      })
      .finally(() => {
        setSchemaLoading(false);
        setDataLoading(false);
      });
  }, [selectedCategory, selectedSubcategory]);

  // ── Manual refresh (reloads full table, clears query) ─────────────────────
  const handleRefreshData = useCallback(() => {
    if (!selectedCategory || !selectedSubcategory) return;
    setDataLoading(true);
    setDataError("");
    setQueryActive(false);
    setQueryError("");
    fetchData(selectedCategory, selectedSubcategory)
      .then((res) => setReportData(res.data))
      .catch((err) =>
        setDataError(err?.response?.data?.detail || "Failed to fetch data.")
      )
      .finally(() => setDataLoading(false));
  }, [selectedCategory, selectedSubcategory]);

  // ── Run custom SQL query ──────────────────────────────────────────────────
  const handleRunQuery = useCallback((sql) => {
    if (!sql?.trim()) {
      handleRefreshData();
      setQueryActive(false);
      setQueryError("");
      return;
    }
    setQueryLoading(true);
    setQueryError("");
    runQuery(sql)
      .then((res) => {
        setReportData(res.data);
        if (res.columns?.length) setColumns(res.columns);
        setQueryActive(true);
        setQueryError("");
        setRowFields([]);
        setColFields([]);
        setValFields([]);
        setSlicers({});
      })
      .catch((err) => {
        const msg = err?.response?.data?.detail || "Query failed.";
        setQueryError(msg);
      })
      .finally(() => setQueryLoading(false));
  }, [handleRefreshData]);

  // ── Slicer-filtered data ──────────────────────────────────────────────────
  // Handles three slicer states:
  //   empty Set       → no filter (all rows pass)
  //   Set{"__NONE__"} → user deselected everything (zero rows)
  //   Set{...values}  → keep only rows whose field value is in the set
  const filteredData = useMemo(() => {
    let result = reportData;
    for (const [field, selected] of Object.entries(slicers)) {
      if (selected.size === 0) continue;                          // all pass
      if (selected.has("__NONE__")) return [];                    // deselect all
      result = result.filter(row => selected.has(String(row[field] ?? "")));
    }
    return result;
  }, [reportData, slicers]);

  // ── Active filter count ───────────────────────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let count = queryActive ? 1 : 0;
    for (const selected of Object.values(slicers)) {
      if (selected.size > 0) count++;
    }
    return count;
  }, [queryActive, slicers]);

  // ── Slicer handlers ───────────────────────────────────────────────────────
  const handleAddSlicer    = useCallback((field) => setSlicers(p => ({ ...p, [field]: new Set() })), []);
  const handleSlicerChange = useCallback((field, next) => setSlicers(p => ({ ...p, [field]: next })), []);
  const handleRemoveSlicer = useCallback((field) => setSlicers(p => { const n = { ...p }; delete n[field]; return n; }), []);

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e) => setActiveId(e.active.id), []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const fieldId = active.id;
    const zone = over.id;
    const remove = (arr) => arr.filter((f) => f !== fieldId);
    let newRows = remove(rowFields);
    let newCols = remove(colFields);
    let newVals = remove(valFields);

    if (zone === "rows") newRows = [...newRows, fieldId];
    else if (zone === "columns") newCols = [...newCols, fieldId];
    else if (zone === "values") newVals = [...newVals, fieldId];

    setRowFields(newRows);
    setColFields(newCols);
    setValFields(newVals);
  }, [rowFields, colFields, valFields]);

  const handleRemoveField = useCallback((zone, field) => {
    if (zone === "rows")    setRowFields(p => p.filter(f => f !== field));
    if (zone === "columns") setColFields(p => p.filter(f => f !== field));
    if (zone === "values")  setValFields(p => p.filter(f => f !== field));
  }, []);

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* Top bar */}
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">PowerReport</span>
        </div>
        <div className="topbar-subtitle">Interactive Reporting Studio</div>
        {(dataLoading || queryLoading) && (
          <div className="topbar-loading">
            <span className="spinner-sm" /> {queryLoading ? "Running query…" : "Loading data…"}
          </div>
        )}
      </header>

      <div className="app-layout">
        {/* Left sidebar */}
        <aside className="sidebar">
          <DatasetSelector
            categories={categories}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategoryChange={(cat) => { setSelectedCategory(cat); setSelectedSubcategory(""); }}
            onSubcategoryChange={setSelectedSubcategory}
          />
          <div className="sidebar-divider" />
          <VisualizationTypeSelector vizType={vizType} onChange={setVizType} />
          <div className="sidebar-divider" />
          {schemaError && <div className="error-banner">{schemaError}</div>}
          <FieldsPanel columns={columns} loading={schemaLoading} />
        </aside>

        {/* Main content */}
        <main className="main-content">
          <ReportCanvas
            vizType={vizType}
            rowFields={rowFields}
            colFields={colFields}
            valFields={valFields}
            onRemoveField={handleRemoveField}
            onRefresh={handleRefreshData}
            loading={dataLoading}
            hasDataset={!!selectedSubcategory}
          />

          {/* Filter & Slicer panel */}
          <div style={{ margin: "8px 0" }}>
            <FilterPanel
              columns={columns}
              tableName={tableName}
              data={reportData}
              query={query}
              onQueryChange={setQuery}
              onRunQuery={handleRunQuery}
              slicers={slicers}
              onSlicerChange={handleSlicerChange}
              onAddSlicer={handleAddSlicer}
              onRemoveSlicer={handleRemoveSlicer}
              activeFilterCount={activeFilterCount}
              hasDataset={!!selectedSubcategory}
              queryLoading={queryLoading}
              queryError={queryError}
            />
          </div>

          {dataError && (
            <div className="error-banner" style={{ margin: "0 0 8px 0" }}>{dataError}</div>
          )}

          <div className="grid-area">
            <GridRenderer
              vizType={vizType}
              rowFields={rowFields}
              colFields={colFields}
              valFields={valFields}
              data={filteredData}
              loading={dataLoading}
            />
          </div>
        </main>
      </div>

      <DragOverlay>
        {activeId ? <div className="field-chip dragging-overlay">{activeId}</div> : null}
      </DragOverlay>
    </DndContext>
  );
}
