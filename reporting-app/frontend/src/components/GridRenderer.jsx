// import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
// import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
// import { ModuleRegistry, AllEnterpriseModule } from "ag-grid-enterprise";

// ModuleRegistry.registerModules([AllEnterpriseModule]);

// const AGG_FUNCS = ["sum", "avg", "min", "max", "count"];

// // ── Custom Header ─────────────────────────────────────────────────────────────
// function CustomHeader({ displayName, field, onRename, onPinToggle, pinned }) {
//   const [editing, setEditing]   = useState(false);
//   const [value, setValue]       = useState(displayName);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const btnRef    = useRef(null);
//   const menuElRef = useRef(null);

//   React.useEffect(() => setValue(displayName), [displayName]);

//   useEffect(() => {
//     const handler = (e) => {
//       if (menuElRef.current && !menuElRef.current.contains(e.target) &&
//           btnRef.current && !btnRef.current.contains(e.target)) setMenuOpen(false);
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   const commit = useCallback(() => {
//     setEditing(false);
//     if (value.trim() && value.trim() !== displayName) onRename(field, value.trim());
//     else setValue(displayName);
//   }, [value, displayName, field, onRename]);

//   const getMenuStyle = () => {
//     if (!btnRef.current) return {};
//     const rect = btnRef.current.getBoundingClientRect();
//     return { position: "fixed", top: rect.bottom + 4, left: Math.max(0, rect.left - 120), zIndex: 99999, background: "#0a1929", border: "1px solid #1e3a5f", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.8)", minWidth: 180, overflow: "hidden" };
//   };

//   if (editing) {
//     return (
//       <input autoFocus value={value}
//         onChange={(e) => setValue(e.target.value)}
//         onBlur={commit}
//         onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setValue(displayName); setEditing(false); } e.stopPropagation(); }}
//         onClick={(e) => e.stopPropagation()}
//         style={{ width: "100%", background: "#0f1e30", border: "1px solid #2d6aad", borderRadius: 4, color: "#fff", fontSize: 12, fontWeight: 700, padding: "2px 6px", outline: "none" }}
//       />
//     );
//   }

//   return (
//     <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 3, overflow: "hidden" }}>
//       {pinned && <span style={{ fontSize: 9, color: "#f0a500", flexShrink: 0 }}>📌</span>}
//       <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12, fontWeight: 600 }}>{value}</span>
//       <button ref={btnRef} onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
//         style={{ background: "none", border: "none", cursor: "pointer", color: "#4a7fa5", fontSize: 14, padding: "0 2px", lineHeight: 1, flexShrink: 0, opacity: 0.6 }}
//         onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
//         onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
//         title="Column options"
//       >⋮</button>

//       {menuOpen && (
//         <div ref={menuElRef} style={getMenuStyle()}>
//           <div onMouseDown={(e) => { e.stopPropagation(); setEditing(true); setMenuOpen(false); }}
//             style={{ padding: "9px 14px", fontSize: 12, color: "#90c8ff", cursor: "pointer", userSelect: "none" }}
//             onMouseEnter={(e) => (e.currentTarget.style.background = "#0f1e30")}
//             onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
//           >✎&nbsp; Rename column</div>
//           <div style={{ borderTop: "1px solid #1a2e45" }} />
//           <div onMouseDown={(e) => { e.stopPropagation(); onPinToggle(field, pinned ? null : "left"); setMenuOpen(false); }}
//             style={{ padding: "9px 14px", fontSize: 12, color: pinned ? "#f0a500" : "#90c8ff", cursor: "pointer", userSelect: "none" }}
//             onMouseEnter={(e) => (e.currentTarget.style.background = "#0f1e30")}
//             onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
//           >{pinned ? "📌 Unpin column" : "📌 Pin column left"}</div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Value Pill ────────────────────────────────────────────────────────────────
// function ValueFieldPill({ field, aggFunc, onChange, onRemove }) {
//   const [open, setOpen] = useState(false);
//   return (
//     <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
//       <div style={{ display: "inline-flex", alignItems: "center", background: "#1e3a5f", border: "1px solid #2d6aad", borderRadius: 6, padding: "3px 6px 3px 10px", gap: 4, fontSize: 12, color: "#90c8ff", userSelect: "none" }}>
//         <span style={{ fontWeight: 600 }}>{field}</span>
//         <button onClick={() => setOpen(v => !v)} style={{ background: "#2d6aad33", border: "1px solid #2d6aad", borderRadius: 4, color: "#7eb8f7", fontSize: 10, fontWeight: 700, padding: "1px 5px", cursor: "pointer", textTransform: "uppercase" }}>{aggFunc} ▾</button>
//         <button onClick={onRemove} style={{ background: "none", border: "none", color: "#7eb8f7", cursor: "pointer", fontSize: 13, lineHeight: 1, padding: "0 2px" }}>×</button>
//       </div>
//       {open && (
//         <>
//           <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setOpen(false)} />
//           <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 999, background: "#0f1e30", border: "1px solid #2d6aad", borderRadius: 6, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.5)", minWidth: 100 }}>
//             {AGG_FUNCS.map((fn) => (
//               <div key={fn} onClick={() => { onChange(fn); setOpen(false); }}
//                 style={{ padding: "6px 14px", fontSize: 12, color: fn === aggFunc ? "#90c8ff" : "#aac", background: fn === aggFunc ? "#1a3a5c" : "transparent", cursor: "pointer", fontWeight: fn === aggFunc ? 700 : 400, textTransform: "uppercase" }}
//                 onMouseEnter={(e) => (e.currentTarget.style.background = "#1a3a5c")}
//                 onMouseLeave={(e) => (e.currentTarget.style.background = fn === aggFunc ? "#1a3a5c" : "transparent")}
//               >{fn}</div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// // ── Helpers ───────────────────────────────────────────────────────────────────
// const toLabel = (col) => col.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

// function computeAgg(rows, field, fn) {
//   const nums = rows.map(r => Number(r[field])).filter(n => !isNaN(n));
//   switch (fn) {
//     case "sum":   return nums.reduce((a, b) => a + b, 0);
//     case "avg":   return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
//     case "min":   return nums.length ? Math.min(...nums) : 0;
//     case "max":   return nums.length ? Math.max(...nums) : 0;
//     case "count": return rows.length;
//     default:      return nums.reduce((a, b) => a + b, 0);
//   }
// }

// function aggregateData(data, rowFields, valFields, aggFuncs) {
//   if (!data?.length || !rowFields.length || !valFields.length) return data;
//   const groups = new Map();
//   for (const row of data) {
//     const key = rowFields.map(f => String(row[f])).join("||");
//     if (!groups.has(key)) { const base = {}; rowFields.forEach(f => base[f] = row[f]); groups.set(key, { _base: base, _rows: [] }); }
//     groups.get(key)._rows.push(row);
//   }
//   return Array.from(groups.values()).map(({ _base, _rows }) => {
//     const result = { ..._base };
//     for (const field of valFields) result[field] = computeAgg(_rows, field, aggFuncs[field] ?? "sum");
//     return result;
//   });
// }

// function pivotData(data, rowFields, colFields, valFields, aggFuncs) {
//   if (!data?.length || !rowFields.length || !colFields.length || !valFields.length) return { rows: [], pivotColDefs: [] };
//   const rowGroups = new Map();
//   for (const row of data) {
//     const rowKey = rowFields.map(f => String(row[f])).join("||");
//     if (!rowGroups.has(rowKey)) { const base = {}; rowFields.forEach(f => base[f] = row[f]); rowGroups.set(rowKey, { _base: base, _rows: [] }); }
//     rowGroups.get(rowKey)._rows.push(row);
//   }
//   const colValueSets = colFields.map(cf => ({ field: cf, vals: [...new Set(data.map(r => String(r[cf])))].sort() }));
//   const cartesian = (arrays) => arrays.reduce((acc, arr) => acc.flatMap(a => arr.map(b => [...a, b])), [[]]);
//   const colCombos = cartesian(colValueSets.map(cv => cv.vals));
//   const pivotColDefs = colCombos.flatMap(combo => valFields.map(vf => ({
//     colLabel: combo.join(" | ") + (valFields.length > 1 ? ` · ${toLabel(vf)}` : ""),
//     colKey: `__pivot__${combo.join("||")}__${vf}`, combo, vf,
//   })));
//   const rows = Array.from(rowGroups.values()).map(({ _base, _rows }) => {
//     const result = { ..._base };
//     for (const { colKey, combo, vf } of pivotColDefs) {
//       const matched = _rows.filter(r => colFields.every((cf, i) => String(r[cf]) === combo[i]));
//       result[colKey] = matched.length ? computeAgg(matched, vf, aggFuncs[vf] ?? "sum") : null;
//     }
//     return result;
//   });
//   return { rows, pivotColDefs };
// }

// function estimateWidth(field, data, headerLabel) {
//   const CHAR_PX = 8.5, PADDING = 36, MIN = 70, MAX = 280;
//   const headerLen = (headerLabel ?? field).length;
//   const sample = data?.slice(0, 150) ?? [];
//   const maxDataLen = sample.reduce((max, row) => Math.max(max, row[field] == null ? 0 : String(row[field]).length), 0);
//   return Math.min(MAX, Math.max(MIN, Math.ceil(Math.max(headerLen, maxDataLen) * CHAR_PX + PADDING)));
// }

// // ── Compute totals row ────────────────────────────────────────────────────────
// function buildTotalsRow(displayData, columnDefs, numericFields) {
//   if (!displayData?.length) return null;
//   const totals = { __isTotal: true };

//   columnDefs.forEach((col) => {
//     const field = col.field;
//     if (!field) return;
//     if (numericFields.includes(field)) {
//       const vals = displayData.map(r => Number(r[field])).filter(n => !isNaN(n));
//       totals[field] = vals.reduce((a, b) => a + b, 0);
//     } else {
//       totals[field] = "Total";
//     }
//   });
//   return totals;
// }

// // ── GridRenderer ──────────────────────────────────────────────────────────────
// export default function GridRenderer({ vizType, rowFields, colFields, valFields, data, loading, onRemoveValField, showTotals, hasDataset = false, hasViewFields = false }) {
//   const gridRef = useRef(null);
//   const [aggFuncs, setAggFuncs]     = useState({});
//   const [renames, setRenames]       = useState({});
//   const [pinnedCols, setPinnedCols] = useState({});

//   const handleAggChange = useCallback((f, fn) => setAggFuncs(p => ({ ...p, [f]: fn })), []);
//   const handleRename    = useCallback((f, n)  => setRenames(p => ({ ...p, [f]: n })), []);
//   const handlePinToggle = useCallback((f, p)  => setPinnedCols(prev => ({ ...prev, [f]: p })), []);

//   const getAggFunc = useCallback(
//     (f) => aggFuncs[f] ?? (data?.[0] && typeof data[0][f] === "number" ? "sum" : "count"),
//     [aggFuncs, data]
//   );
//   const getHeaderName = useCallback(
//     (f, prefix) => renames[f] ?? (prefix ? `${prefix} of ${toLabel(f)}` : toLabel(f)),
//     [renames]
//   );

//   const resolvedAggFuncs = useMemo(() => {
//     const out = {};
//     for (const f of valFields) out[f] = getAggFunc(f);
//     return out;
//   }, [valFields, getAggFunc]);

//   const { displayData, pivotColDefs } = useMemo(() => {
//     if (vizType !== "matrix") return { displayData: data, pivotColDefs: [] };
//     const hasPivot    = colFields.length > 0 && rowFields.length > 0 && valFields.length > 0;
//     const hasGroupOnly = rowFields.length > 0 && colFields.length === 0 && valFields.length > 0;
//     if (hasPivot) { const { rows, pivotColDefs } = pivotData(data, rowFields, colFields, valFields, resolvedAggFuncs); return { displayData: rows, pivotColDefs }; }
//     if (hasGroupOnly) return { displayData: aggregateData(data, rowFields, valFields, resolvedAggFuncs), pivotColDefs: [] };
//     return { displayData: data, pivotColDefs: [] };
//   }, [vizType, rowFields, colFields, valFields, data, resolvedAggFuncs]);

//   const columnDefs = useMemo(() => {
//     if (!data?.length) return [];
//     const allDataCols = Object.keys(data[0]);

//     const makeCol = (col, opts = {}) => {
//       const headerLabel = opts.headerName ?? getHeaderName(col, opts.aggPrefix);
//       const pin  = pinnedCols.hasOwnProperty(col) ? pinnedCols[col] : (opts.pinned ?? null);
//       const width = estimateWidth(col, displayData ?? data, headerLabel);
//       return {
//         field: col, headerName: headerLabel,
//         headerComponent: CustomHeader,
//         headerComponentParams: { displayName: headerLabel, field: col, onRename: handleRename, onPinToggle: handlePinToggle, pinned: pin },
//         sortable: true, filter: true, resizable: true,
//         width, minWidth: 60, pinned: pin,
//         ...(opts.valueFormatter ? { valueFormatter: opts.valueFormatter } : {}),
//         // Style totals row cells
//         cellStyle: (params) => params.data?.__isTotal
//           ? { fontWeight: 700, color: "#f0c040", background: "#0f1e30", borderTop: "2px solid #2d6aad" }
//           : null,
//       };
//     };

//     const numFmt = ({ value }) =>
//       value == null ? "" : typeof value === "number"
//         ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value;

//     if (vizType === "table") {
//       // Columns are always driven by what the user configured — query only filters ROWS, never columns.
//       // Priority: explicit drop zones > all data columns (full schema always available)
//       const visible = rowFields.length || colFields.length || valFields.length
//         ? [...rowFields, ...colFields, ...valFields]
//         : allDataCols;
//       return visible.filter(c => allDataCols.includes(c)).map(col => makeCol(col));
//     }

//     if (colFields.length > 0 && rowFields.length > 0 && valFields.length > 0) {
//       return [
//         ...rowFields.map(col => makeCol(col, { pinned: pinnedCols[col] ?? "left" })),
//         ...pivotColDefs.map(({ colLabel, colKey }) => {
//           const pin   = pinnedCols[colKey] ?? null;
//           const width = estimateWidth(colKey, displayData, colLabel);
//           return {
//             field: colKey, headerName: colLabel,
//             headerComponent: CustomHeader,
//             headerComponentParams: { displayName: colLabel, field: colKey, onRename: handleRename, onPinToggle: handlePinToggle, pinned: pin },
//             sortable: true, filter: true, resizable: true, width, minWidth: 60, pinned: pin,
//             valueFormatter: numFmt,
//             cellStyle: (params) => params.data?.__isTotal
//               ? { fontWeight: 700, color: "#f0c040", background: "#0f1e30", borderTop: "2px solid #2d6aad" }
//               : null,
//           };
//         }),
//       ];
//     }

//     if (rowFields.length > 0 && valFields.length > 0) {
//       return [
//         ...rowFields.map(col => makeCol(col, { pinned: pinnedCols[col] ?? "left" })),
//         ...valFields.map(col => makeCol(col, { aggPrefix: getAggFunc(col).toUpperCase(), valueFormatter: numFmt })),
//       ];
//     }

//     if (colFields.length > 0 && valFields.length === 0) return [];

//     const visible = rowFields.length ? rowFields.filter(c => allDataCols.includes(c)) : allDataCols;
//     return (visible.length ? visible : allDataCols).map(col => makeCol(col));
//   }, [vizType, rowFields, colFields, valFields, data, displayData, pivotColDefs, getAggFunc, getHeaderName, handleRename, handlePinToggle, pinnedCols]);

//   // ── Totals row ────────────────────────────────────────────────────────────
//   const numericFields = useMemo(() => {
//     if (!data?.length) return [];
//     return Object.keys(data[0]).filter(k => typeof data[0][k] === "number");
//   }, [data]);

//   const rowDataWithTotals = useMemo(() => {
//     if (!showTotals || !displayData?.length || !columnDefs.length) return displayData;
//     const totalsRow = buildTotalsRow(displayData, columnDefs, numericFields);
//     return totalsRow ? [...displayData, totalsRow] : displayData;
//   }, [showTotals, displayData, columnDefs, numericFields]);

//   const defaultColDef = useMemo(() => ({ sortable: true, filter: true, resizable: true }), []);

//   // ── Loading / empty ───────────────────────────────────────────────────────
//   if (loading) return (
//     <div className="grid-empty"><div className="empty-state">
//       <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
//       <h4 style={{ marginTop: 16 }}>Loading data…</h4>
//     </div></div>
//   );

//   // Dataset chosen but no fields dropped yet — guide the user
//   if (hasDataset && !hasViewFields) return (
//     <div className="grid-empty"><div className="empty-state">
//       <div className="empty-icon">📐</div>
//       <h4>Select columns to get started</h4>
//       <p>
//         Drag fields from the left panel into <strong>Columns</strong> (Table)
//         or <strong>Rows / Values</strong> (Matrix) to load your data.
//       </p>
//     </div></div>
//   );

//   if (!data || data.length === 0) return (
//     <div className="grid-empty"><div className="empty-state">
//       <div className="empty-icon">📋</div>
//       <h4>No data to display</h4>
//       <p>{hasDataset ? "No rows match the current filters." : "Select a dataset then drag fields to configure your view."}</p>
//     </div></div>
//   );

//   if (vizType === "matrix" && colFields.length > 0 && valFields.length === 0) return (
//     <div className="grid-wrapper">
//       <div className="grid-meta"><span className="grid-tag">Matrix (Pivot)</span><span className="grid-count">{data.length} rows loaded</span></div>
//       <div className="grid-empty"><div className="empty-state">
//         <div className="empty-icon">∑</div>
//         <h4>Drop a value field to pivot</h4>
//         <p>Drag a numeric field into <strong>Values</strong> to cross-tabulate by <strong>{colFields.join(", ")}</strong>.</p>
//       </div></div>
//     </div>
//   );

//   const isAggregated = vizType === "matrix" && rowFields.length > 0 && valFields.length > 0;
//   const modeLabel = vizType === "matrix" ? (colFields.length > 0 ? "Matrix (Pivot)" : "Matrix (Grouped)") : "Table";

//   return (
//     <div className="grid-wrapper">
//       <div className="grid-meta">
//         <span className="grid-tag">{modeLabel}</span>
//         <span className="grid-count">{isAggregated ? `${displayData?.length} groups` : `${data.length} rows`} loaded</span>
//         {rowFields.length || colFields.length ? (
//           <span className="grid-fields-info">
//             {rowFields.length > 0 && <span>Rows: <strong>{rowFields.join(", ")}</strong></span>}
//             {colFields.length > 0 && <span style={{ marginLeft: 8 }}>Cols: <strong>{colFields.join(", ")}</strong></span>}
//           </span>
//         ) : <span className="grid-hint">← Drag fields to configure</span>}
//         {showTotals && <span style={{ marginLeft: 8, fontSize: 10, color: "#f0c040", fontWeight: 700 }}>∑ Totals ON</span>}
//         <span style={{ marginLeft: "auto", fontSize: 10, color: "#2d4a6a" }}>⋮ header → pin · drag edge → resize</span>
//       </div>

//       {vizType === "matrix" && valFields.length > 0 && (
//         <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, padding: "6px 12px", background: "#0a1929", borderBottom: "1px solid #1a2e45" }}>
//           <span style={{ fontSize: 11, fontWeight: 700, color: "#4a7fa5", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 4 }}>Values:</span>
//           {valFields.map(field => (
//             <ValueFieldPill key={field} field={field} aggFunc={getAggFunc(field)} onChange={fn => handleAggChange(field, fn)} onRemove={() => onRemoveValField?.(field)} />
//           ))}
//         </div>
//       )}

//       <div className="ag-theme-alpine-dark" id="ag-grid-container">
//         <AgGridReact
//           ref={gridRef}
//           columnDefs={columnDefs}
//           rowData={rowDataWithTotals}
//           defaultColDef={defaultColDef}
//           animateRows
//           pivotMode={false}
//           pagination
//           paginationPageSize={25}
//           paginationPageSizeSelector={[10, 25, 50, 100]}
//           popupParent={document.body}
//           alwaysShowHorizontalScroll
//           // Style the totals row differently
//           getRowStyle={(params) => {
//             if (params.data?.__isTotal) {
//               return { background: "#0f1e30", fontWeight: 700, borderTop: "2px solid #2d6aad" };
//             }
//             return null;
//           }}
//         />
//       </div>
//     </div>
//   );
// }
import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, AllEnterpriseModule } from "ag-grid-enterprise";

ModuleRegistry.registerModules([AllEnterpriseModule]);

const AGG_FUNCS = ["sum", "avg", "min", "max", "count"];

// ── Custom Header ─────────────────────────────────────────────────────────────
function CustomHeader({ displayName, field, onRename, onPinToggle, pinned }) {
  const [editing, setEditing]   = useState(false);
  const [value, setValue]       = useState(displayName);
  const [menuOpen, setMenuOpen] = useState(false);
  const btnRef    = useRef(null);
  const menuElRef = useRef(null);

  React.useEffect(() => setValue(displayName), [displayName]);

  useEffect(() => {
    const handler = (e) => {
      if (menuElRef.current && !menuElRef.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const commit = useCallback(() => {
    setEditing(false);
    if (value.trim() && value.trim() !== displayName) onRename(field, value.trim());
    else setValue(displayName);
  }, [value, displayName, field, onRename]);

  const getMenuStyle = () => {
    if (!btnRef.current) return {};
    const rect = btnRef.current.getBoundingClientRect();
    return { position: "fixed", top: rect.bottom + 4, left: Math.max(0, rect.left - 120), zIndex: 99999, background: "#0a1929", border: "1px solid #1e3a5f", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.8)", minWidth: 180, overflow: "hidden" };
  };

  if (editing) {
    return (
      <input autoFocus value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setValue(displayName); setEditing(false); } e.stopPropagation(); }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", background: "#0f1e30", border: "1px solid #2d6aad", borderRadius: 4, color: "#fff", fontSize: 12, fontWeight: 700, padding: "2px 6px", outline: "none" }}
      />
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 3, overflow: "hidden" }}>
      {pinned && <span style={{ fontSize: 9, color: "#f0a500", flexShrink: 0 }}>📌</span>}
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12, fontWeight: 600 }}>{value}</span>
      <button ref={btnRef} onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
        style={{ background: "none", border: "none", cursor: "pointer", color: "#4a7fa5", fontSize: 14, padding: "0 2px", lineHeight: 1, flexShrink: 0, opacity: 0.6 }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
        title="Column options"
      >⋮</button>

      {menuOpen && (
        <div ref={menuElRef} style={getMenuStyle()}>
          <div onMouseDown={(e) => { e.stopPropagation(); setEditing(true); setMenuOpen(false); }}
            style={{ padding: "9px 14px", fontSize: 12, color: "#90c8ff", cursor: "pointer", userSelect: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#0f1e30")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >✎&nbsp; Rename column</div>
          <div style={{ borderTop: "1px solid #1a2e45" }} />
          <div onMouseDown={(e) => { e.stopPropagation(); onPinToggle(field, pinned ? null : "left"); setMenuOpen(false); }}
            style={{ padding: "9px 14px", fontSize: 12, color: pinned ? "#f0a500" : "#90c8ff", cursor: "pointer", userSelect: "none" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#0f1e30")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >{pinned ? "📌 Unpin column" : "📌 Pin column left"}</div>
        </div>
      )}
    </div>
  );
}

// ── Value Pill ────────────────────────────────────────────────────────────────
function ValueFieldPill({ field, aggFunc, onChange, onRemove }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <div style={{ display: "inline-flex", alignItems: "center", background: "#1e3a5f", border: "1px solid #2d6aad", borderRadius: 6, padding: "3px 6px 3px 10px", gap: 4, fontSize: 12, color: "#90c8ff", userSelect: "none" }}>
        <span style={{ fontWeight: 600 }}>{field}</span>
        <button onClick={() => setOpen(v => !v)} style={{ background: "#2d6aad33", border: "1px solid #2d6aad", borderRadius: 4, color: "#7eb8f7", fontSize: 10, fontWeight: 700, padding: "1px 5px", cursor: "pointer", textTransform: "uppercase" }}>{aggFunc} ▾</button>
        <button onClick={onRemove} style={{ background: "none", border: "none", color: "#7eb8f7", cursor: "pointer", fontSize: 13, lineHeight: 1, padding: "0 2px" }}>×</button>
      </div>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 999, background: "#0f1e30", border: "1px solid #2d6aad", borderRadius: 6, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.5)", minWidth: 100 }}>
            {AGG_FUNCS.map((fn) => (
              <div key={fn} onClick={() => { onChange(fn); setOpen(false); }}
                style={{ padding: "6px 14px", fontSize: 12, color: fn === aggFunc ? "#90c8ff" : "#aac", background: fn === aggFunc ? "#1a3a5c" : "transparent", cursor: "pointer", fontWeight: fn === aggFunc ? 700 : 400, textTransform: "uppercase" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1a3a5c")}
                onMouseLeave={(e) => (e.currentTarget.style.background = fn === aggFunc ? "#1a3a5c" : "transparent")}
              >{fn}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const toLabel = (col) => col.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

function computeAgg(rows, field, fn) {
  const nums = rows.map(r => Number(r[field])).filter(n => !isNaN(n));
  switch (fn) {
    case "sum":   return nums.reduce((a, b) => a + b, 0);
    case "avg":   return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    case "min":   return nums.length ? Math.min(...nums) : 0;
    case "max":   return nums.length ? Math.max(...nums) : 0;
    case "count": return rows.length;
    default:      return nums.reduce((a, b) => a + b, 0);
  }
}

function aggregateData(data, rowFields, valFields, aggFuncs) {
  if (!data?.length || !rowFields.length || !valFields.length) return data;
  const groups = new Map();
  for (const row of data) {
    const key = rowFields.map(f => String(row[f])).join("||");
    if (!groups.has(key)) { const base = {}; rowFields.forEach(f => base[f] = row[f]); groups.set(key, { _base: base, _rows: [] }); }
    groups.get(key)._rows.push(row);
  }
  return Array.from(groups.values()).map(({ _base, _rows }) => {
    const result = { ..._base };
    for (const field of valFields) result[field] = computeAgg(_rows, field, aggFuncs[field] ?? "sum");
    return result;
  });
}

function pivotData(data, rowFields, colFields, valFields, aggFuncs) {
  if (!data?.length || !rowFields.length || !colFields.length || !valFields.length) return { rows: [], pivotColDefs: [] };
  const rowGroups = new Map();
  for (const row of data) {
    const rowKey = rowFields.map(f => String(row[f])).join("||");
    if (!rowGroups.has(rowKey)) { const base = {}; rowFields.forEach(f => base[f] = row[f]); rowGroups.set(rowKey, { _base: base, _rows: [] }); }
    rowGroups.get(rowKey)._rows.push(row);
  }
  const colValueSets = colFields.map(cf => ({ field: cf, vals: [...new Set(data.map(r => String(r[cf])))].sort() }));
  const cartesian = (arrays) => arrays.reduce((acc, arr) => acc.flatMap(a => arr.map(b => [...a, b])), [[]]);
  const colCombos = cartesian(colValueSets.map(cv => cv.vals));
  const pivotColDefs = colCombos.flatMap(combo => valFields.map(vf => ({
    colLabel: combo.join(" | ") + (valFields.length > 1 ? ` · ${toLabel(vf)}` : ""),
    colKey: `__pivot__${combo.join("||")}__${vf}`, combo, vf,
  })));
  const rows = Array.from(rowGroups.values()).map(({ _base, _rows }) => {
    const result = { ..._base };
    for (const { colKey, combo, vf } of pivotColDefs) {
      const matched = _rows.filter(r => colFields.every((cf, i) => String(r[cf]) === combo[i]));
      result[colKey] = matched.length ? computeAgg(matched, vf, aggFuncs[vf] ?? "sum") : null;
    }
    return result;
  });
  return { rows, pivotColDefs };
}

function estimateWidth(field, data, headerLabel) {
  const CHAR_PX = 8.5, PADDING = 36, MIN = 70, MAX = 280;
  const headerLen = (headerLabel ?? field).length;
  const sample = data?.slice(0, 150) ?? [];
  const maxDataLen = sample.reduce((max, row) => Math.max(max, row[field] == null ? 0 : String(row[field]).length), 0);
  return Math.min(MAX, Math.max(MIN, Math.ceil(Math.max(headerLen, maxDataLen) * CHAR_PX + PADDING)));
}

// ── Build totals row ──────────────────────────────────────────────────────────
// Sums numeric columns across all displayed rows (post-filter, post-aggregation).
// Non-numeric columns get "Total" label. Excluded from sorting/filtering via __isTotal marker.
function buildTotalsRow(displayData, columnDefs, numericFields) {
  if (!displayData?.length) return null;
  const totals = { __isTotal: true };
  columnDefs.forEach((col) => {
    const field = col.field;
    if (!field) return;
    if (numericFields.includes(field)) {
      const vals = displayData.map(r => Number(r[field])).filter(n => !isNaN(n));
      totals[field] = vals.reduce((a, b) => a + b, 0);
    } else {
      totals[field] = "Total";
    }
  });
  return totals;
}

// ── GridRenderer ──────────────────────────────────────────────────────────────
export default function GridRenderer({
  vizType, rowFields, colFields, valFields,
  data, loading, onRemoveValField,
  showTotals, hasDataset = false, hasViewFields = false,
}) {
  const gridRef = useRef(null);
  const [aggFuncs,    setAggFuncs]    = useState({});
  const [renames,     setRenames]     = useState({});
  const [pinnedCols,  setPinnedCols]  = useState({});

  const handleAggChange = useCallback((f, fn) => setAggFuncs(p => ({ ...p, [f]: fn })), []);
  const handleRename    = useCallback((f, n)  => setRenames(p => ({ ...p, [f]: n })), []);
  const handlePinToggle = useCallback((f, p)  => setPinnedCols(prev => ({ ...prev, [f]: p })), []);

  const getAggFunc = useCallback(
    (f) => aggFuncs[f] ?? (data?.[0] && typeof data[0][f] === "number" ? "sum" : "count"),
    [aggFuncs, data]
  );
  const getHeaderName = useCallback(
    (f, prefix) => renames[f] ?? (prefix ? `${prefix} of ${toLabel(f)}` : toLabel(f)),
    [renames]
  );

  const resolvedAggFuncs = useMemo(() => {
    const out = {};
    for (const f of valFields) out[f] = getAggFunc(f);
    return out;
  }, [valFields, getAggFunc]);

  // ── Display data (pivot / aggregate for matrix) ───────────────────────────
  const { displayData, pivotColDefs } = useMemo(() => {
    if (vizType !== "matrix") return { displayData: data, pivotColDefs: [] };
    const hasPivot     = colFields.length > 0 && rowFields.length > 0 && valFields.length > 0;
    const hasGroupOnly = rowFields.length > 0 && colFields.length === 0 && valFields.length > 0;
    if (hasPivot)     { const { rows, pivotColDefs } = pivotData(data, rowFields, colFields, valFields, resolvedAggFuncs); return { displayData: rows, pivotColDefs }; }
    if (hasGroupOnly) return { displayData: aggregateData(data, rowFields, valFields, resolvedAggFuncs), pivotColDefs: [] };
    return { displayData: data, pivotColDefs: [] };
  }, [vizType, rowFields, colFields, valFields, data, resolvedAggFuncs]);

  // ── Column defs ───────────────────────────────────────────────────────────
  const columnDefs = useMemo(() => {
    if (!data?.length) return [];
    const allDataCols = Object.keys(data[0]);

    const totalsCellStyle = (params) => params.data?.__isTotal
      ? { fontWeight: 700, color: "#f0c040", background: "#0a1520", borderTop: "2px solid #2d6aad" }
      : null;

    const makeCol = (col, opts = {}) => {
      const headerLabel = opts.headerName ?? getHeaderName(col, opts.aggPrefix);
      const pin   = pinnedCols.hasOwnProperty(col) ? pinnedCols[col] : (opts.pinned ?? null);
      const width = estimateWidth(col, displayData ?? data, headerLabel);
      return {
        field: col, headerName: headerLabel,
        headerComponent: CustomHeader,
        headerComponentParams: { displayName: headerLabel, field: col, onRename: handleRename, onPinToggle: handlePinToggle, pinned: pin },
        sortable: true, filter: true, resizable: true,
        width, minWidth: 60, pinned: pin,
        cellStyle: totalsCellStyle,
        ...(opts.valueFormatter ? { valueFormatter: opts.valueFormatter } : {}),
      };
    };

    const numFmt = ({ value }) =>
      value == null ? "" : typeof value === "number"
        ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value;

    // TABLE — columns driven by drop zones or all data columns
    if (vizType === "table") {
      const visible = rowFields.length || colFields.length || valFields.length
        ? [...rowFields, ...colFields, ...valFields]
        : allDataCols;
      return visible.filter(c => allDataCols.includes(c)).map(col => makeCol(col));
    }

    // MATRIX — full pivot
    if (colFields.length > 0 && rowFields.length > 0 && valFields.length > 0) {
      return [
        ...rowFields.map(col => makeCol(col, { pinned: pinnedCols[col] ?? "left" })),
        ...pivotColDefs.map(({ colLabel, colKey }) => {
          const pin   = pinnedCols[colKey] ?? null;
          const width = estimateWidth(colKey, displayData, colLabel);
          return {
            field: colKey, headerName: colLabel,
            headerComponent: CustomHeader,
            headerComponentParams: { displayName: colLabel, field: colKey, onRename: handleRename, onPinToggle: handlePinToggle, pinned: pin },
            sortable: true, filter: true, resizable: true, width, minWidth: 60, pinned: pin,
            valueFormatter: numFmt,
            cellStyle: totalsCellStyle,
          };
        }),
      ];
    }

    // MATRIX — grouped rows + values
    if (rowFields.length > 0 && valFields.length > 0) {
      return [
        ...rowFields.map(col => makeCol(col, { pinned: pinnedCols[col] ?? "left" })),
        ...valFields.map(col => makeCol(col, { aggPrefix: getAggFunc(col).toUpperCase(), valueFormatter: numFmt })),
      ];
    }

    if (colFields.length > 0 && valFields.length === 0) return [];

    const visible = rowFields.length ? rowFields.filter(c => allDataCols.includes(c)) : allDataCols;
    return (visible.length ? visible : allDataCols).map(col => makeCol(col));
  }, [vizType, rowFields, colFields, valFields, data, displayData, pivotColDefs, getAggFunc, getHeaderName, handleRename, handlePinToggle, pinnedCols]);

  // ── Totals row ────────────────────────────────────────────────────────────
  // Detects numeric fields from the first data row.
  // For pivot columns (__pivot__...) they are always numeric.
  // Totals are computed on displayData (post-aggregation) so matrix totals are
  // grand totals of the aggregated values, not raw row counts.
  const numericFields = useMemo(() => {
    if (!displayData?.length) return [];
    const firstRow = displayData[0];
    return Object.keys(firstRow).filter(k =>
      typeof firstRow[k] === "number" || k.startsWith("__pivot__")
    );
  }, [displayData]);

  const rowDataWithTotals = useMemo(() => {
    if (!showTotals || !displayData?.length || !columnDefs.length) return displayData;
    const totalsRow = buildTotalsRow(displayData, columnDefs, numericFields);
    return totalsRow ? [...displayData, totalsRow] : displayData;
  }, [showTotals, displayData, columnDefs, numericFields]);

  const defaultColDef = useMemo(() => ({ sortable: true, filter: true, resizable: true }), []);

  // ── Empty / loading states ────────────────────────────────────────────────
  if (loading) return (
    <div className="grid-empty"><div className="empty-state">
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      <h4 style={{ marginTop: 16 }}>Loading data…</h4>
    </div></div>
  );

  if (hasDataset && !hasViewFields) return (
    <div className="grid-empty"><div className="empty-state">
      <div className="empty-icon">📐</div>
      <h4>Select columns to get started</h4>
      <p>Drag fields from the left panel into <strong>Columns</strong> (Table) or <strong>Rows / Values</strong> (Matrix) to build your view.</p>
    </div></div>
  );

  if (!data || data.length === 0) return (
    <div className="grid-empty"><div className="empty-state">
      <div className="empty-icon">📋</div>
      <h4>No data to display</h4>
      <p>{hasDataset ? "No rows match the current filters." : "Select a dataset then drag fields to configure your view."}</p>
    </div></div>
  );

  if (vizType === "matrix" && colFields.length > 0 && valFields.length === 0) return (
    <div className="grid-wrapper">
      <div className="grid-meta"><span className="grid-tag">Matrix (Pivot)</span><span className="grid-count">{data.length} rows loaded</span></div>
      <div className="grid-empty"><div className="empty-state">
        <div className="empty-icon">∑</div>
        <h4>Drop a value field to pivot</h4>
        <p>Drag a numeric field into <strong>Values</strong> to cross-tabulate by <strong>{colFields.join(", ")}</strong>.</p>
      </div></div>
    </div>
  );

  const isAggregated = vizType === "matrix" && rowFields.length > 0 && valFields.length > 0;
  const modeLabel    = vizType === "matrix" ? (colFields.length > 0 ? "Matrix (Pivot)" : "Matrix (Grouped)") : "Table";

  return (
    <div className="grid-wrapper">
      {/* Meta bar */}
      <div className="grid-meta">
        <span className="grid-tag">{modeLabel}</span>
        <span className="grid-count">
          {isAggregated ? `${displayData?.length} groups` : `${data.length} rows`} loaded
        </span>
        {rowFields.length || colFields.length ? (
          <span className="grid-fields-info">
            {rowFields.length > 0 && <span>Rows: <strong>{rowFields.join(", ")}</strong></span>}
            {colFields.length > 0 && <span style={{ marginLeft: 8 }}>Cols: <strong>{colFields.join(", ")}</strong></span>}
          </span>
        ) : <span className="grid-hint">← Drag fields to configure</span>}
        {showTotals && (
          <span style={{ marginLeft: 8, fontSize: 10, color: "#f0c040", fontWeight: 700 }}>∑ Totals</span>
        )}
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#2d4a6a" }}>
          ⋮ header → pin · drag edge → resize
        </span>
      </div>

      {/* Values strip (matrix only) */}
      {vizType === "matrix" && valFields.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, padding: "6px 12px", background: "#0a1929", borderBottom: "1px solid #1a2e45" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#4a7fa5", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 4 }}>Values:</span>
          {valFields.map(field => (
            <ValueFieldPill key={field} field={field} aggFunc={getAggFunc(field)}
              onChange={fn => handleAggChange(field, fn)}
              onRemove={() => onRemoveValField?.(field)}
            />
          ))}
        </div>
      )}

      {/* AG Grid */}
      <div className="ag-theme-alpine-dark" id="ag-grid-container">
        <AgGridReact
          ref={gridRef}
          columnDefs={columnDefs}
          rowData={rowDataWithTotals}
          defaultColDef={defaultColDef}
          animateRows
          pivotMode={false}
          pagination
          paginationPageSize={25}
          paginationPageSizeSelector={[10, 25, 50, 100]}
          popupParent={document.body}
          alwaysShowHorizontalScroll
          getRowStyle={(params) => {
            if (params.data?.__isTotal) {
              return { background: "#0a1520", fontWeight: 700, borderTop: "2px solid #2d6aad" };
            }
            return null;
          }}
        />
      </div>
    </div>
  );
}