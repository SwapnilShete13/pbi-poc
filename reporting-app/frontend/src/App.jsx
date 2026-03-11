// import React, { useState, useEffect, useCallback } from "react";
// import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
// import DatasetSelector from "./components/DatasetSelector";
// import FieldsPanel from "./components/FieldsPanel";
// import VisualizationTypeSelector from "./components/VisualizationTypeSelector";
// import ReportCanvas from "./components/ReportCanvas";
// import GridRenderer from "./components/GridRenderer";
// import { fetchCategories, fetchSchema, fetchData } from "./api";

// export default function App() {
//   // ── Dataset state ────────────────────────────────────────────────────────────
//   const [categories, setCategories] = useState({});
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [selectedSubcategory, setSelectedSubcategory] = useState("");
//   const [columns, setColumns] = useState([]);
//   const [schemaLoading, setSchemaLoading] = useState(false);
//   const [schemaError, setSchemaError] = useState("");

//   // ── Drop zone state ──────────────────────────────────────────────────────────
//   const [rowFields, setRowFields] = useState([]);
//   const [colFields, setColFields] = useState([]);
//   const [valFields, setValFields] = useState([]);

//   // ── Viz & data state ─────────────────────────────────────────────────────────
//   const [vizType, setVizType] = useState("table");
//   const [reportData, setReportData] = useState([]);   // all data fetched from API
//   const [dataLoading, setDataLoading] = useState(false);
//   const [dataError, setDataError] = useState("");

//   // ── Drag overlay label ───────────────────────────────────────────────────────
//   const [activeId, setActiveId] = useState(null);

//   // ── Load categories on mount ─────────────────────────────────────────────────
//   useEffect(() => {
//     fetchCategories()
//       .then(setCategories)
//       .catch(() => setSchemaError("Failed to load categories from backend."));
//   }, []);

//   // ── When subcategory changes: fetch schema + ALL data immediately ─────────────
//   // The grid re-renders reactively as the user drags fields — no button needed.
//   useEffect(() => {
//     if (!selectedCategory || !selectedSubcategory) return;

//     setSchemaLoading(true);
//     setDataLoading(true);
//     setSchemaError("");
//     setDataError("");
//     setColumns([]);
//     setRowFields([]);
//     setColFields([]);
//     setValFields([]);
//     setReportData([]);

//     // Fetch schema and data in parallel
//     Promise.all([
//       fetchSchema(selectedCategory, selectedSubcategory),
//       fetchData(selectedCategory, selectedSubcategory),
//     ])
//       .then(([schemaRes, dataRes]) => {
//         setColumns(schemaRes.columns);
//         setReportData(dataRes.data);
//       })
//       .catch((err) => {
//         const msg = err?.response?.data?.detail || "Failed to load dataset.";
//         setSchemaError(msg);
//       })
//       .finally(() => {
//         setSchemaLoading(false);
//         setDataLoading(false);
//       });
//   }, [selectedCategory, selectedSubcategory]);

//   // ── Manual refresh (re-fetch data, e.g. after backend data changes) ───────────
//   const handleRefreshData = useCallback(() => {
//     if (!selectedCategory || !selectedSubcategory) return;
//     setDataLoading(true);
//     setDataError("");
//     fetchData(selectedCategory, selectedSubcategory)
//       .then((res) => setReportData(res.data))
//       .catch((err) =>
//         setDataError(err?.response?.data?.detail || "Failed to fetch data.")
//       )
//       .finally(() => setDataLoading(false));
//   }, [selectedCategory, selectedSubcategory]);

//   // ── Drag handlers ─────────────────────────────────────────────────────────────
//   const handleDragStart = useCallback((event) => {
//     setActiveId(event.active.id);
//   }, []);

//   const handleDragEnd = useCallback(
//     (event) => {
//       const { active, over } = event;
//       setActiveId(null);
//       if (!over) return;

//       const fieldId = active.id;
//       const zone = over.id; // "rows" | "columns" | "values"

//       // Remove from all zones first (prevent duplicates across zones)
//       const remove = (arr) => arr.filter((f) => f !== fieldId);
//       let newRows = remove(rowFields);
//       let newCols = remove(colFields);
//       let newVals = remove(valFields);

//       if (zone === "rows") newRows = [...newRows, fieldId];
//       else if (zone === "columns") newCols = [...newCols, fieldId];
//       else if (zone === "values") newVals = [...newVals, fieldId];

//       setRowFields(newRows);
//       setColFields(newCols);
//       setValFields(newVals);
//       // Grid re-renders automatically via GridRenderer's useMemo — no fetch needed
//     },
//     [rowFields, colFields, valFields]
//   );

//   // ── Remove field from zone ────────────────────────────────────────────────────
//   const handleRemoveField = useCallback((zone, field) => {
//     if (zone === "rows") setRowFields((p) => p.filter((f) => f !== field));
//     else if (zone === "columns") setColFields((p) => p.filter((f) => f !== field));
//     else if (zone === "values") setValFields((p) => p.filter((f) => f !== field));
//   }, []);

//   return (
//     <DndContext
//       collisionDetection={closestCenter}
//       onDragStart={handleDragStart}
//       onDragEnd={handleDragEnd}
//     >
//       {/* ── Top bar ── */}
//       <header className="topbar">
//         <div className="topbar-brand">
//           <span className="brand-icon">⚡</span>
//           <span className="brand-name">PowerReport</span>
//         </div>
//         <div className="topbar-subtitle">Interactive Reporting Studio</div>
//         {dataLoading && (
//           <div className="topbar-loading">
//             <span className="spinner-sm" /> Loading data…
//           </div>
//         )}
//       </header>

//       <div className="app-layout">
//         {/* ── Left sidebar ── */}
//         <aside className="sidebar">
//           <DatasetSelector
//             categories={categories}
//             selectedCategory={selectedCategory}
//             selectedSubcategory={selectedSubcategory}
//             onCategoryChange={(cat) => {
//               setSelectedCategory(cat);
//               setSelectedSubcategory("");
//             }}
//             onSubcategoryChange={setSelectedSubcategory}
//           />

//           <div className="sidebar-divider" />

//           <VisualizationTypeSelector vizType={vizType} onChange={setVizType} />

//           <div className="sidebar-divider" />

//           {schemaError && <div className="error-banner">{schemaError}</div>}
//           <FieldsPanel columns={columns} loading={schemaLoading} />
//         </aside>

//         {/* ── Main content ── */}
//         <main className="main-content">
//           <ReportCanvas
//             vizType={vizType}
//             rowFields={rowFields}
//             colFields={colFields}
//             valFields={valFields}
//             onRemoveField={handleRemoveField}
//             onRefresh={handleRefreshData}
//             loading={dataLoading}
//             hasDataset={!!selectedSubcategory}
//           />

//           {dataError && (
//             <div className="error-banner" style={{ margin: "0 16px" }}>
//               {dataError}
//             </div>
//           )}

//           <div className="grid-area">
//             <GridRenderer
//               vizType={vizType}
//               rowFields={rowFields}
//               colFields={colFields}
//               valFields={valFields}
//               data={reportData}
//               loading={dataLoading}
//             />
            
//           </div>
//         </main>
//       </div>

//       {/* ── Drag Overlay ── */}
//       <DragOverlay>
//         {activeId ? (
//           <div className="field-chip dragging-overlay">{activeId}</div>
//         ) : null}
//       </DragOverlay>
//     </DndContext>
//   );
// }
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import DatasetSelector from "./components/DatasetSelector";
import FieldsPanel from "./components/FieldsPanel";
import VisualizationTypeSelector from "./components/VisualizationTypeSelector";
import ReportCanvas from "./components/ReportCanvas";
import GridRenderer from "./components/GridRenderer";
import FilterPanel, { evaluateQuery } from "./components/FilterPanel";
import { fetchCategories, fetchSchema, fetchData } from "./api";

export default function App() {
  // ── Dataset state ─────────────────────────────────────────────────────────
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [columns, setColumns] = useState([]);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState("");

  // ── Drop zone state ───────────────────────────────────────────────────────
  const [rowFields, setRowFields] = useState([]);
  const [colFields, setColFields] = useState([]);
  const [valFields, setValFields] = useState([]);

  // ── Viz & data state ──────────────────────────────────────────────────────
  const [vizType, setVizType] = useState("table");
  const [reportData, setReportData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  // ── Filter state ──────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  // slicers: { [fieldName]: Set<string> }  — empty Set = all selected
  const [slicers, setSlicers] = useState({});

  // ── Drag overlay ──────────────────────────────────────────────────────────
  const [activeId, setActiveId] = useState(null);

  // ── Load categories on mount ──────────────────────────────────────────────
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setSchemaError("Failed to load categories from backend."));
  }, []);

  // ── When subcategory changes: fetch schema + data ─────────────────────────
  useEffect(() => {
    if (!selectedCategory || !selectedSubcategory) return;

    setSchemaLoading(true);
    setDataLoading(true);
    setSchemaError("");
    setDataError("");
    setColumns([]);
    setRowFields([]);
    setColFields([]);
    setValFields([]);
    setReportData([]);
    setQuery("");
    setSlicers({});

    Promise.all([
      fetchSchema(selectedCategory, selectedSubcategory),
      fetchData(selectedCategory, selectedSubcategory),
    ])
      .then(([schemaRes, dataRes]) => {
        setColumns(schemaRes.columns);
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

  // ── Manual refresh ────────────────────────────────────────────────────────
  const handleRefreshData = useCallback(() => {
    if (!selectedCategory || !selectedSubcategory) return;
    setDataLoading(true);
    setDataError("");
    fetchData(selectedCategory, selectedSubcategory)
      .then((res) => setReportData(res.data))
      .catch((err) =>
        setDataError(err?.response?.data?.detail || "Failed to fetch data.")
      )
      .finally(() => setDataLoading(false));
  }, [selectedCategory, selectedSubcategory]);

  // ── Filtered data (query + slicers applied) ───────────────────────────────
  const filteredData = useMemo(() => {
    let result = reportData;

    // Apply query filter
    if (query.trim()) {
      const queried = evaluateQuery(result, query);
      if (queried !== null) result = queried;
    }

    // Apply slicers — only when a slicer has explicit selections (non-empty Set)
    for (const [field, selected] of Object.entries(slicers)) {
      if (selected.size > 0) {
        result = result.filter((row) => selected.has(String(row[field] ?? "")));
      }
    }

    return result;
  }, [reportData, query, slicers]);

  // ── Active filter count (for badge) ──────────────────────────────────────
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (query.trim()) count++;
    for (const selected of Object.values(slicers)) {
      if (selected.size > 0) count++;
    }
    return count;
  }, [query, slicers]);

  // ── Slicer handlers ───────────────────────────────────────────────────────
  const handleAddSlicer = useCallback((field) => {
    setSlicers((prev) => ({ ...prev, [field]: new Set() }));
  }, []);

  const handleSlicerChange = useCallback((field, next) => {
    setSlicers((prev) => ({ ...prev, [field]: next }));
  }, []);

  const handleRemoveSlicer = useCallback((field) => {
    setSlicers((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event) => {
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
    },
    [rowFields, colFields, valFields]
  );

  // ── Remove field from zone ────────────────────────────────────────────────
  const handleRemoveField = useCallback((zone, field) => {
    if (zone === "rows") setRowFields((p) => p.filter((f) => f !== field));
    else if (zone === "columns") setColFields((p) => p.filter((f) => f !== field));
    else if (zone === "values") setValFields((p) => p.filter((f) => f !== field));
  }, []);

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* ── Top bar ── */}
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">PowerReport</span>
        </div>
        <div className="topbar-subtitle">Interactive Reporting Studio</div>
        {dataLoading && (
          <div className="topbar-loading">
            <span className="spinner-sm" /> Loading data…
          </div>
        )}
      </header>

      <div className="app-layout">
        {/* ── Left sidebar ── */}
        <aside className="sidebar">
          <DatasetSelector
            categories={categories}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategoryChange={(cat) => {
              setSelectedCategory(cat);
              setSelectedSubcategory("");
            }}
            onSubcategoryChange={setSelectedSubcategory}
          />

          <div className="sidebar-divider" />

          <VisualizationTypeSelector vizType={vizType} onChange={setVizType} />

          <div className="sidebar-divider" />

          {schemaError && <div className="error-banner">{schemaError}</div>}
          <FieldsPanel columns={columns} loading={schemaLoading} />
        </aside>

        {/* ── Main content ── */}
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

          {/* ── Filter & Slicer panel ── */}
          <div style={{ padding: "0 0 0 0", margin: "8px 0" }}>
            <FilterPanel
              columns={columns}
              data={reportData}
              query={query}
              onQueryChange={setQuery}
              slicers={slicers}
              onSlicerChange={handleSlicerChange}
              onAddSlicer={handleAddSlicer}
              onRemoveSlicer={handleRemoveSlicer}
              activeFilterCount={activeFilterCount}
              hasDataset={!!selectedSubcategory}
            />
          </div>

          {dataError && (
            <div className="error-banner" style={{ margin: "0 16px" }}>
              {dataError}
            </div>
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

      {/* ── Drag Overlay ── */}
      <DragOverlay>
        {activeId ? (
          <div className="field-chip dragging-overlay">{activeId}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}