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
  // ── Dataset ───────────────────────────────────────────────────────────────
  const [categories,          setCategories]          = useState({});
  const [selectedCategory,    setSelectedCategory]    = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [columns,             setColumns]             = useState([]); // full schema — left panel only
  const [tableName,           setTableName]           = useState("");
  const [schemaLoading,       setSchemaLoading]       = useState(false);
  const [schemaError,         setSchemaError]         = useState("");

  // ── Drop zones ────────────────────────────────────────────────────────────
  const [rowFields, setRowFields] = useState([]);
  const [colFields, setColFields] = useState([]);
  const [valFields, setValFields] = useState([]);

  // ── Viz & data ────────────────────────────────────────────────────────────
  const [vizType,     setVizType]     = useState("table");
  const [fullData,    setFullData]    = useState([]);
  const [ruleData,    setRuleData]    = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError,   setDataError]   = useState("");

  // ── Rule / query ──────────────────────────────────────────────────────────
  const [query,        setQuery]        = useState("");
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError,   setQueryError]   = useState("");
  const [queryActive,  setQueryActive]  = useState(false);

  // ── Slicers ───────────────────────────────────────────────────────────────
  const [slicers, setSlicers] = useState({});

  // ── Drag overlay ──────────────────────────────────────────────────────────
  const [activeId, setActiveId] = useState(null);

  // ── Derived: reportData ───────────────────────────────────────────────────
  // fullData is always the complete table. When a rule is active, ruleData holds
  // the filtered rows (possibly fewer columns). reportData merges them — every
  // matching full row from fullData is returned so all columns are always available.
  // Set is a lookup index only (O(1) key check), not for deduplication.
  // Filtering fullData preserves every duplicate row exactly as it exists.
  const reportData = useMemo(() => {
    if (!queryActive || ruleData.length === 0) return fullData;
    if (fullData.length === 0) return ruleData;

    const ruleKeys   = Object.keys(ruleData[0]);
    const ruleKeySet = new Set(
      ruleData.map(row => ruleKeys.map(k => String(row[k] ?? "")).join("||"))
    );

    return fullData.filter(row =>
      ruleKeySet.has(ruleKeys.map(k => String(row[k] ?? "")).join("||"))
    );
  }, [queryActive, ruleData, fullData]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const viewFields    = useMemo(() => [...new Set([...rowFields, ...colFields, ...valFields])], [rowFields, colFields, valFields]);
  const hasViewFields = viewFields.length > 0;

  // ── Load categories on mount ──────────────────────────────────────────────
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setSchemaError("Failed to load categories from backend."));
  }, []);

  // ── Dataset change: fetch schema + ALL data together ─────────────────────
  // Data loads silently in the background. Grid stays empty until user drops
  // columns — the data is just waiting in memory, not rendered.
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
    setFullData([]);
    setRuleData([]);
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
        setFullData(dataRes.data);
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

  // ── Manual refresh: reload full table, clear rule ─────────────────────────
  const handleRefreshData = useCallback(() => {
    if (!selectedCategory || !selectedSubcategory) return;
    setDataLoading(true);
    setDataError("");
    setQueryActive(false);
    setQueryError("");
    setRuleData([]);
    fetchData(selectedCategory, selectedSubcategory)
      .then((res) => setFullData(res.data))
      .catch((err) => setDataError(err?.response?.data?.detail || "Failed to fetch data."))
      .finally(() => setDataLoading(false));
  }, [selectedCategory, selectedSubcategory]);

  // ── Run / clear a rule ────────────────────────────────────────────────────
  // Rule replaces reportData with filtered rows from SQL Server.
  // Clearing a rule reloads the full table.
  // Drop zones and slicers are preserved — query only changes the row set.
  const handleRunQuery = useCallback((sql) => {
    if (!sql?.trim()) {
      setQueryActive(false);
      setQueryError("");
      setRuleData([]);
      handleRefreshData();
      return;
    }
    setQueryLoading(true);
    setQueryError("");
    runQuery(sql)
      .then((res) => {
        setRuleData(res.data);   // store rule result separately — fullData untouched
        setQueryActive(true);
        setQueryError("");
      })
      .catch((err) => setQueryError(err?.response?.data?.detail || "Query failed."))
      .finally(() => setQueryLoading(false));
  }, [handleRefreshData]);

  // ── Slicer-filtered display data ──────────────────────────────────────────
  const filteredData = useMemo(() => {
    let result = reportData;
    for (const [field, selected] of Object.entries(slicers)) {
      if (selected.size === 0) continue;
      if (selected.has("__NONE__")) return [];
      result = result.filter(row => selected.has(String(row[field] ?? "")));
    }
    return result;
  }, [reportData, slicers]);

  // ── Active filter count ───────────────────────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let count = queryActive ? 1 : 0;
    for (const sel of Object.values(slicers)) if (sel.size > 0) count++;
    return count;
  }, [queryActive, slicers]);

  // ── Slicer handlers ───────────────────────────────────────────────────────
  const handleAddSlicer    = useCallback((f) => setSlicers(p => ({ ...p, [f]: new Set() })), []);
  const handleSlicerChange = useCallback((f, v) => setSlicers(p => ({ ...p, [f]: v })), []);
  const handleRemoveSlicer = useCallback((f) => setSlicers(p => { const n = { ...p }; delete n[f]; return n; }), []);

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e) => setActiveId(e.active.id), []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const fieldId = active.id;
    const zone    = over.id;
    const remove  = (arr) => arr.filter((f) => f !== fieldId);

    let newRows = remove(rowFields);
    let newCols = remove(colFields);
    let newVals = remove(valFields);

    if      (zone === "rows")    newRows = [...newRows, fieldId];
    else if (zone === "columns") newCols = [...newCols, fieldId];
    else if (zone === "values")  newVals = [...newVals, fieldId];

    setRowFields(newRows);
    setColFields(newCols);
    setValFields(newVals);
    // No fetch needed — data already in memory, GridRenderer just shows the new column
  }, [rowFields, colFields, valFields]);

  const handleRemoveField = useCallback((zone, field) => {
    if (zone === "rows")    setRowFields(p => p.filter(f => f !== field));
    if (zone === "columns") setColFields(p => p.filter(f => f !== field));
    if (zone === "values")  setValFields(p => p.filter(f => f !== field));
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">PowerReport</span>
        </div>
        <div className="topbar-subtitle">Interactive Reporting Studio</div>
        {(dataLoading || queryLoading) && (
          <div className="topbar-loading">
            <span className="spinner-sm" />
            {queryLoading ? "Running query…" : "Loading data…"}
          </div>
        )}
      </header>

      <div className="app-layout">
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
              hasViewFields={hasViewFields}
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
              hasDataset={!!selectedSubcategory}
              hasViewFields={hasViewFields}
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