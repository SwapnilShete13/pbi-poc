// import React, { useMemo, useRef, useState, useCallback } from "react";
// import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
// import { ModuleRegistry, AllEnterpriseModule } from "ag-grid-enterprise";

// ModuleRegistry.registerModules([AllEnterpriseModule]);

// const AGG_FUNCS = ["sum", "avg", "min", "max", "count"];

// // ── Rename Header Component ───────────────────────────────────────────────────
// function RenameableHeader({ displayName, field, onRename }) {
//   const [editing, setEditing] = useState(false);
//   const [value, setValue] = useState(displayName);
//   const inputRef = useRef(null);

//   const commit = useCallback(() => {
//     setEditing(false);
//     if (value.trim() && value.trim() !== displayName) {
//       onRename(field, value.trim());
//     } else {
//       setValue(displayName);
//     }
//   }, [value, displayName, field, onRename]);

//   // Sync if parent renames
//   React.useEffect(() => setValue(displayName), [displayName]);

//   if (editing) {
//     return (
//       <input
//         ref={inputRef}
//         value={value}
//         autoFocus
//         onChange={(e) => setValue(e.target.value)}
//         onBlur={commit}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") commit();
//           if (e.key === "Escape") { setValue(displayName); setEditing(false); }
//           e.stopPropagation();
//         }}
//         onClick={(e) => e.stopPropagation()}
//         style={{
//           width: "100%",
//           background: "#0f1e30",
//           border: "1px solid #2d6aad",
//           borderRadius: 4,
//           color: "#fff",
//           fontSize: 12,
//           fontWeight: 700,
//           padding: "2px 6px",
//           outline: "none",
//           letterSpacing: "0.04em",
//         }}
//       />
//     );
//   }

//   return (
//     <div
//       style={{
//         display: "flex",
//         alignItems: "center",
//         gap: 4,
//         width: "100%",
//         cursor: "default",
//       }}
//       title="Double-click to rename"
//     >
//       <span
//         style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
//       >
//         {value}
//       </span>
//       <button
//         onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
//         onClick={(e) => { e.stopPropagation(); setEditing(true); }}
//         title="Rename column"
//         style={{
//           background: "none",
//           border: "none",
//           cursor: "pointer",
//           color: "#4a7fa5",
//           fontSize: 11,
//           padding: "0 2px",
//           lineHeight: 1,
//           opacity: 0.6,
//           flexShrink: 0,
//         }}
//         onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
//         onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
//       >
//         ✎
//       </button>
//     </div>
//   );
// }

// // ── Value pill with agg func dropdown ────────────────────────────────────────
// function ValueFieldPill({ field, aggFunc, onChange, onRemove }) {
//   const [open, setOpen] = useState(false);

//   return (
//     <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
//       <div
//         style={{
//           display: "inline-flex",
//           alignItems: "center",
//           background: "#1e3a5f",
//           border: "1px solid #2d6aad",
//           borderRadius: 6,
//           padding: "3px 6px 3px 10px",
//           gap: 4,
//           fontSize: 12,
//           color: "#90c8ff",
//           userSelect: "none",
//         }}
//       >
//         <span style={{ fontWeight: 600 }}>{field}</span>
//         <button
//           onClick={() => setOpen((v) => !v)}
//           style={{
//             background: "#2d6aad33",
//             border: "1px solid #2d6aad",
//             borderRadius: 4,
//             color: "#7eb8f7",
//             fontSize: 10,
//             fontWeight: 700,
//             padding: "1px 5px",
//             cursor: "pointer",
//             textTransform: "uppercase",
//             letterSpacing: "0.05em",
//           }}
//         >
//           {aggFunc} ▾
//         </button>
//         <button
//           onClick={onRemove}
//           style={{
//             background: "none",
//             border: "none",
//             color: "#7eb8f7",
//             cursor: "pointer",
//             fontSize: 13,
//             lineHeight: 1,
//             padding: "0 2px",
//           }}
//         >
//           ×
//         </button>
//       </div>

//       {open && (
//         <>
//           <div
//             style={{ position: "fixed", inset: 0, zIndex: 998 }}
//             onClick={() => setOpen(false)}
//           />
//           <div
//             style={{
//               position: "absolute",
//               top: "calc(100% + 4px)",
//               left: 0,
//               zIndex: 999,
//               background: "#0f1e30",
//               border: "1px solid #2d6aad",
//               borderRadius: 6,
//               overflow: "hidden",
//               boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
//               minWidth: 100,
//             }}
//           >
//             {AGG_FUNCS.map((fn) => (
//               <div
//                 key={fn}
//                 onClick={() => { onChange(fn); setOpen(false); }}
//                 style={{
//                   padding: "6px 14px",
//                   fontSize: 12,
//                   color: fn === aggFunc ? "#90c8ff" : "#aac",
//                   background: fn === aggFunc ? "#1a3a5c" : "transparent",
//                   cursor: "pointer",
//                   fontWeight: fn === aggFunc ? 700 : 400,
//                   textTransform: "uppercase",
//                   letterSpacing: "0.04em",
//                 }}
//                 onMouseEnter={(e) => (e.currentTarget.style.background = "#1a3a5c")}
//                 onMouseLeave={(e) =>
//                   (e.currentTarget.style.background =
//                     fn === aggFunc ? "#1a3a5c" : "transparent")
//                 }
//               >
//                 {fn}
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// // ── Pure JS aggregation ───────────────────────────────────────────────────────
// function aggregateData(data, rowFields, valFields, aggFuncs) {
//   if (!data?.length || !rowFields.length || !valFields.length) return data;

//   const groups = new Map();
//   for (const row of data) {
//     const key = rowFields.map((f) => String(row[f])).join("||");
//     if (!groups.has(key)) {
//       const base = {};
//       rowFields.forEach((f) => (base[f] = row[f]));
//       groups.set(key, { _base: base, _rows: [] });
//     }
//     groups.get(key)._rows.push(row);
//   }

//   return Array.from(groups.values()).map(({ _base, _rows }) => {
//     const result = { ..._base };
//     for (const field of valFields) {
//       const fn = aggFuncs[field] ?? "sum";
//       const nums = _rows.map((r) => Number(r[field])).filter((n) => !isNaN(n));
//       switch (fn) {
//         case "sum":   result[field] = nums.reduce((a, b) => a + b, 0); break;
//         case "avg":   result[field] = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0; break;
//         case "min":   result[field] = nums.length ? Math.min(...nums) : 0; break;
//         case "max":   result[field] = nums.length ? Math.max(...nums) : 0; break;
//         case "count": result[field] = _rows.length; break;
//         default:      result[field] = nums.reduce((a, b) => a + b, 0);
//       }
//     }
//     return result;
//   });
// }

// // ── Default header name helper ────────────────────────────────────────────────
// const toLabel = (col) =>
//   col.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

// // ── GridRenderer ──────────────────────────────────────────────────────────────
// export default function GridRenderer({
//   vizType,
//   rowFields,
//   colFields,
//   valFields,
//   data,
//   loading,
//   onRemoveValField,
// }) {
//   const gridRef = useRef(null);

//   // Agg funcs per value field
//   const [aggFuncs, setAggFuncs] = useState({});
//   // Custom column renames: { [field]: "Custom Name" }
//   const [renames, setRenames] = useState({});

//   const handleAggChange = useCallback((field, fn) => {
//     setAggFuncs((prev) => ({ ...prev, [field]: fn }));
//   }, []);

//   const handleRename = useCallback((field, newName) => {
//     setRenames((prev) => ({ ...prev, [field]: newName }));
//   }, []);

//   const getAggFunc = useCallback(
//     (field) =>
//       aggFuncs[field] ??
//       (data?.[0] && typeof data[0][field] === "number" ? "sum" : "count"),
//     [aggFuncs, data]
//   );

//   // Header name: custom rename > default label
//   const getHeaderName = useCallback(
//     (field, prefix) => {
//       if (renames[field]) return renames[field];
//       return prefix ? `${prefix} of ${toLabel(field)}` : toLabel(field);
//     },
//     [renames]
//   );

//   // ── Pre-aggregate for matrix+values ──────────────────────────────────────
//   const resolvedAggFuncs = useMemo(() => {
//     const out = {};
//     for (const f of valFields) out[f] = getAggFunc(f);
//     return out;
//   }, [valFields, getAggFunc]);

//   const displayData = useMemo(() => {
//     if (vizType === "matrix" && rowFields.length > 0 && valFields.length > 0) {
//       return aggregateData(data, rowFields, valFields, resolvedAggFuncs);
//     }
//     return data;
//   }, [vizType, rowFields, valFields, data, resolvedAggFuncs]);

//   // ── Column defs ───────────────────────────────────────────────────────────
//   const columnDefs = useMemo(() => {
//     if (!data?.length) return [];
//     const allDataCols = Object.keys(data[0]);

//     const makeCol = (col, opts = {}) => ({
//       field: col,
//       headerName: getHeaderName(col, opts.aggPrefix),
//       headerComponent: RenameableHeader,
//       headerComponentParams: {
//         displayName: getHeaderName(col, opts.aggPrefix),
//         field: col,
//         onRename: handleRename,
//       },
//       sortable: true,
//       filter: true,
//       resizable: true,
//       flex: 1,
//       minWidth: opts.minWidth ?? 110,
//       ...(opts.pinned ? { pinned: opts.pinned } : {}),
//       ...(opts.valueFormatter ? { valueFormatter: opts.valueFormatter } : {}),
//     });

//     const numFormatter = ({ value }) =>
//       value == null
//         ? ""
//         : typeof value === "number"
//         ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
//         : value;

//     // ── TABLE MODE ──────────────────────────────────────────────────────────
//     if (vizType === "table") {
//       const visible =
//         rowFields.length || colFields.length || valFields.length
//           ? [...rowFields, ...colFields, ...valFields]
//           : allDataCols;
//       return visible
//         .filter((c) => allDataCols.includes(c))
//         .map((col) => makeCol(col));
//     }

//     // ── MATRIX MODE ─────────────────────────────────────────────────────────

//     // Case 1: Rows + Values → flat aggregated
//     if (rowFields.length > 0 && valFields.length > 0) {
//       return [
//         ...rowFields.map((col) => makeCol(col, { minWidth: 130, pinned: "left" })),
//         ...valFields.map((col) =>
//           makeCol(col, {
//             aggPrefix: getAggFunc(col).toUpperCase(),
//             minWidth: 150,
//             valueFormatter: numFormatter,
//           })
//         ),
//       ];
//     }

//     // Case 2: ColFields but no values → empty (handled below in JSX)
//     if (colFields.length > 0 && valFields.length === 0) return [];

//     // Case 3: Only rows or nothing → flat raw table
//     const visible = rowFields.length
//       ? rowFields.filter((c) => allDataCols.includes(c))
//       : allDataCols;
//     return (visible.length ? visible : allDataCols).map((col) => makeCol(col));
//   }, [
//     vizType, rowFields, colFields, valFields,
//     data, getAggFunc, getHeaderName, handleRename,
//   ]);

//   const defaultColDef = useMemo(
//     () => ({ sortable: true, filter: true, resizable: true, flex: 1, minWidth: 100 }),
//     []
//   );

//   // ── Loading / empty states ────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="grid-empty">
//         <div className="empty-state">
//           <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
//           <h4 style={{ marginTop: 16 }}>Loading data…</h4>
//         </div>
//       </div>
//     );
//   }

//   if (!data || data.length === 0) {
//     return (
//       <div className="grid-empty">
//         <div className="empty-state">
//           <div className="empty-icon">📋</div>
//           <h4>No data to display</h4>
//           <p>Select a dataset then drag fields to configure your view.</p>
//         </div>
//       </div>
//     );
//   }

//   // Pivot needs values prompt
//   if (vizType === "matrix" && colFields.length > 0 && valFields.length === 0) {
//     return (
//       <div className="grid-wrapper">
//         <div className="grid-meta">
//           <span className="grid-tag">Matrix (Pivot)</span>
//           <span className="grid-count">{data.length} rows loaded</span>
//           <span className="grid-fields-info">
//             Cols: <strong>{colFields.join(", ")}</strong>
//           </span>
//         </div>
//         <div className="grid-empty">
//           <div className="empty-state">
//             <div className="empty-icon">∑</div>
//             <h4>Drop a value field to pivot</h4>
//             <p>
//               Drag a numeric field into <strong>Values</strong> to
//               cross-tabulate by <strong>{colFields.join(", ")}</strong>.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const isAggregated = vizType === "matrix" && rowFields.length > 0 && valFields.length > 0;
//   const modeLabel =
//     vizType === "matrix"
//       ? colFields.length > 0 ? "Matrix (Pivot)" : "Matrix (Grouped)"
//       : "Table";

//   return (
//     <div className="grid-wrapper">
//       {/* Meta bar */}
//       <div className="grid-meta">
//         <span className="grid-tag">{modeLabel}</span>
//         <span className="grid-count">
//           {isAggregated ? `${displayData?.length} groups` : `${data.length} rows`} loaded
//         </span>
//         {rowFields.length || colFields.length ? (
//           <span className="grid-fields-info">
//             {rowFields.length > 0 && (
//               <span>Rows: <strong>{rowFields.join(", ")}</strong></span>
//             )}
//             {colFields.length > 0 && (
//               <span style={{ marginLeft: 8 }}>
//                 Cols: <strong>{colFields.join(", ")}</strong>
//               </span>
//             )}
//           </span>
//         ) : (
//           <span className="grid-hint">← Drag fields to configure</span>
//         )}
//       </div>

//       {/* Values strip */}
//       {vizType === "matrix" && valFields.length > 0 && (
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             flexWrap: "wrap",
//             gap: 6,
//             padding: "6px 12px",
//             background: "#0a1929",
//             borderBottom: "1px solid #1a2e45",
//           }}
//         >
//           <span
//             style={{
//               fontSize: 11,
//               fontWeight: 700,
//               color: "#4a7fa5",
//               textTransform: "uppercase",
//               letterSpacing: "0.06em",
//               marginRight: 4,
//             }}
//           >
//             Values:
//           </span>
//           {valFields.map((field) => (
//             <ValueFieldPill
//               key={field}
//               field={field}
//               aggFunc={getAggFunc(field)}
//               onChange={(fn) => handleAggChange(field, fn)}
//               onRemove={() => onRemoveValField?.(field)}
//             />
//           ))}
//         </div>
//       )}

//       {/* AG Grid */}
//       <div className="ag-theme-alpine-dark" id="ag-grid-container">
//         <AgGridReact
//           ref={gridRef}
//           columnDefs={columnDefs}
//           rowData={displayData}
//           defaultColDef={defaultColDef}
//           animateRows
//           pivotMode={false}
//           pagination
//           paginationPageSize={25}
//           paginationPageSizeSelector={[10, 25, 50, 100]}
//           popupParent={document.body}
//         />
//       </div>
//     </div>
//   );
// }
import React, { useMemo, useRef, useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, AllEnterpriseModule } from "ag-grid-enterprise";

ModuleRegistry.registerModules([AllEnterpriseModule]);

const AGG_FUNCS = ["sum", "avg", "min", "max", "count"];

// ── Rename Header Component ───────────────────────────────────────────────────
function RenameableHeader({ displayName, field, onRename }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(displayName);
  const inputRef = useRef(null);

  const commit = useCallback(() => {
    setEditing(false);
    if (value.trim() && value.trim() !== displayName) {
      onRename(field, value.trim());
    } else {
      setValue(displayName);
    }
  }, [value, displayName, field, onRename]);

  React.useEffect(() => setValue(displayName), [displayName]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        autoFocus
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setValue(displayName); setEditing(false); }
          e.stopPropagation();
        }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          background: "#0f1e30",
          border: "1px solid #2d6aad",
          borderRadius: 4,
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          padding: "2px 6px",
          outline: "none",
          letterSpacing: "0.04em",
        }}
      />
    );
  }

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 4, width: "100%", cursor: "default" }}
      title="Click to rename"
    >
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {value}
      </span>
      <button
        onClick={(e) => { e.stopPropagation(); setEditing(true); }}
        title="Rename column"
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#4a7fa5", fontSize: 11, padding: "0 2px",
          lineHeight: 1, opacity: 0.6, flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
      >
        ✎
      </button>
    </div>
  );
}

// ── Value pill with agg func dropdown ────────────────────────────────────────
function ValueFieldPill({ field, aggFunc, onChange, onRemove }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <div style={{
        display: "inline-flex", alignItems: "center",
        background: "#1e3a5f", border: "1px solid #2d6aad",
        borderRadius: 6, padding: "3px 6px 3px 10px",
        gap: 4, fontSize: 12, color: "#90c8ff", userSelect: "none",
      }}>
        <span style={{ fontWeight: 600 }}>{field}</span>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            background: "#2d6aad33", border: "1px solid #2d6aad",
            borderRadius: 4, color: "#7eb8f7", fontSize: 10,
            fontWeight: 700, padding: "1px 5px", cursor: "pointer",
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}
        >
          {aggFunc} ▾
        </button>
        <button
          onClick={onRemove}
          style={{ background: "none", border: "none", color: "#7eb8f7", cursor: "pointer", fontSize: 13, lineHeight: 1, padding: "0 2px" }}
        >
          ×
        </button>
      </div>

      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 999,
            background: "#0f1e30", border: "1px solid #2d6aad", borderRadius: 6,
            overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.5)", minWidth: 100,
          }}>
            {AGG_FUNCS.map((fn) => (
              <div
                key={fn}
                onClick={() => { onChange(fn); setOpen(false); }}
                style={{
                  padding: "6px 14px", fontSize: 12,
                  color: fn === aggFunc ? "#90c8ff" : "#aac",
                  background: fn === aggFunc ? "#1a3a5c" : "transparent",
                  cursor: "pointer", fontWeight: fn === aggFunc ? 700 : 400,
                  textTransform: "uppercase", letterSpacing: "0.04em",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#1a3a5c")}
                onMouseLeave={(e) => (e.currentTarget.style.background = fn === aggFunc ? "#1a3a5c" : "transparent")}
              >
                {fn}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Default header name helper ────────────────────────────────────────────────
const toLabel = (col) =>
  col.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

// ── Compute a single aggregated value ────────────────────────────────────────
function computeAgg(rows, field, fn) {
  const nums = rows.map((r) => Number(r[field])).filter((n) => !isNaN(n));
  switch (fn) {
    case "sum":   return nums.reduce((a, b) => a + b, 0);
    case "avg":   return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    case "min":   return nums.length ? Math.min(...nums) : 0;
    case "max":   return nums.length ? Math.max(...nums) : 0;
    case "count": return rows.length;
    default:      return nums.reduce((a, b) => a + b, 0);
  }
}

// ── Grouped aggregation (no pivot columns) ────────────────────────────────────
function aggregateData(data, rowFields, valFields, aggFuncs) {
  if (!data?.length || !rowFields.length || !valFields.length) return data;

  const groups = new Map();
  for (const row of data) {
    const key = rowFields.map((f) => String(row[f])).join("||");
    if (!groups.has(key)) {
      const base = {};
      rowFields.forEach((f) => (base[f] = row[f]));
      groups.set(key, { _base: base, _rows: [] });
    }
    groups.get(key)._rows.push(row);
  }

  return Array.from(groups.values()).map(({ _base, _rows }) => {
    const result = { ..._base };
    for (const field of valFields) {
      result[field] = computeAgg(_rows, field, aggFuncs[field] ?? "sum");
    }
    return result;
  });
}

// ── Pivot aggregation (rows × columns) ───────────────────────────────────────
function pivotData(data, rowFields, colFields, valFields, aggFuncs) {
  if (!data?.length || !rowFields.length || !colFields.length || !valFields.length)
    return { rows: [], pivotColDefs: [] };

  // 1. Group data by row key
  const rowGroups = new Map();
  for (const row of data) {
    const rowKey = rowFields.map((f) => String(row[f])).join("||");
    if (!rowGroups.has(rowKey)) {
      const base = {};
      rowFields.forEach((f) => (base[f] = row[f]));
      rowGroups.set(rowKey, { _base: base, _rows: [] });
    }
    rowGroups.get(rowKey)._rows.push(row);
  }

  // 2. Collect unique values per column pivot field
  const colValueSets = colFields.map((cf) => ({
    field: cf,
    vals: [...new Set(data.map((r) => String(r[cf])))].sort(),
  }));

  // 3. Cartesian product of column pivot values
  function cartesian(arrays) {
    return arrays.reduce(
      (acc, arr) => acc.flatMap((a) => arr.map((b) => [...a, b])),
      [[]]
    );
  }
  const colCombos = cartesian(colValueSets.map((cv) => cv.vals));

  // 4. Build pivot column descriptors
  const pivotColDefs = colCombos.flatMap((combo) =>
    valFields.map((vf) => {
      const colLabel =
        combo.join(" | ") + (valFields.length > 1 ? ` · ${toLabel(vf)}` : "");
      const colKey = `__pivot__${combo.join("||")}__${vf}`;
      return { colLabel, colKey, combo, vf };
    })
  );

  // 5. Build result rows
  const rows = Array.from(rowGroups.values()).map(({ _base, _rows }) => {
    const result = { ..._base };
    for (const { colKey, combo, vf } of pivotColDefs) {
      const matched = _rows.filter((r) =>
        colFields.every((cf, i) => String(r[cf]) === combo[i])
      );
      result[colKey] = matched.length
        ? computeAgg(matched, vf, aggFuncs[vf] ?? "sum")
        : null;
    }
    return result;
  });

  return { rows, pivotColDefs };
}

// ── GridRenderer ──────────────────────────────────────────────────────────────
export default function GridRenderer({
  vizType,
  rowFields,
  colFields,
  valFields,
  data,
  loading,
  onRemoveValField,
}) {
  const gridRef = useRef(null);
  const [aggFuncs, setAggFuncs] = useState({});
  const [renames, setRenames] = useState({});

  const handleAggChange = useCallback((field, fn) => {
    setAggFuncs((prev) => ({ ...prev, [field]: fn }));
  }, []);

  const handleRename = useCallback((field, newName) => {
    setRenames((prev) => ({ ...prev, [field]: newName }));
  }, []);

  const getAggFunc = useCallback(
    (field) =>
      aggFuncs[field] ??
      (data?.[0] && typeof data[0][field] === "number" ? "sum" : "count"),
    [aggFuncs, data]
  );

  const getHeaderName = useCallback(
    (field, prefix) => {
      if (renames[field]) return renames[field];
      return prefix ? `${prefix} of ${toLabel(field)}` : toLabel(field);
    },
    [renames]
  );

  const resolvedAggFuncs = useMemo(() => {
    const out = {};
    for (const f of valFields) out[f] = getAggFunc(f);
    return out;
  }, [valFields, getAggFunc]);

  // ── Compute display data + pivot col defs ─────────────────────────────────
  const { displayData, pivotColDefs } = useMemo(() => {
    if (vizType !== "matrix") return { displayData: data, pivotColDefs: [] };

    const hasPivot = colFields.length > 0 && rowFields.length > 0 && valFields.length > 0;
    const hasGroupOnly = rowFields.length > 0 && colFields.length === 0 && valFields.length > 0;

    if (hasPivot) {
      const { rows, pivotColDefs } = pivotData(data, rowFields, colFields, valFields, resolvedAggFuncs);
      return { displayData: rows, pivotColDefs };
    }
    if (hasGroupOnly) {
      return { displayData: aggregateData(data, rowFields, valFields, resolvedAggFuncs), pivotColDefs: [] };
    }
    return { displayData: data, pivotColDefs: [] };
  }, [vizType, rowFields, colFields, valFields, data, resolvedAggFuncs]);

  // ── Column defs ───────────────────────────────────────────────────────────
  const columnDefs = useMemo(() => {
    if (!data?.length) return [];
    const allDataCols = Object.keys(data[0]);

    const makeCol = (col, opts = {}) => ({
      field: col,
      headerName: opts.headerName ?? getHeaderName(col, opts.aggPrefix),
      headerComponent: RenameableHeader,
      headerComponentParams: {
        displayName: opts.headerName ?? getHeaderName(col, opts.aggPrefix),
        field: col,
        onRename: handleRename,
      },
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: opts.minWidth ?? 110,
      ...(opts.pinned ? { pinned: opts.pinned } : {}),
      ...(opts.valueFormatter ? { valueFormatter: opts.valueFormatter } : {}),
    });

    const numFormatter = ({ value }) =>
      value == null
        ? ""
        : typeof value === "number"
        ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : value;

    // ── TABLE MODE ──────────────────────────────────────────────────────────
    if (vizType === "table") {
      const visible =
        rowFields.length || colFields.length || valFields.length
          ? [...rowFields, ...colFields, ...valFields]
          : allDataCols;
      return visible
        .filter((c) => allDataCols.includes(c))
        .map((col) => makeCol(col));
    }

    // ── MATRIX: Pivot (rows × columns × values) ─────────────────────────────
    if (colFields.length > 0 && rowFields.length > 0 && valFields.length > 0) {
      return [
        // Row dimension columns (pinned left)
        ...rowFields.map((col) => makeCol(col, { minWidth: 130, pinned: "left" })),
        // Pivot value columns
        ...pivotColDefs.map(({ colLabel, colKey }) => ({
          field: colKey,
          headerName: colLabel,
          headerComponent: RenameableHeader,
          headerComponentParams: {
            displayName: colLabel,
            field: colKey,
            onRename: handleRename,
          },
          sortable: true,
          filter: true,
          resizable: true,
          flex: 1,
          minWidth: 130,
          valueFormatter: numFormatter,
        })),
      ];
    }

    // ── MATRIX: Grouped (rows + values, no columns) ─────────────────────────
    if (rowFields.length > 0 && valFields.length > 0) {
      return [
        ...rowFields.map((col) => makeCol(col, { minWidth: 130, pinned: "left" })),
        ...valFields.map((col) =>
          makeCol(col, {
            aggPrefix: getAggFunc(col).toUpperCase(),
            minWidth: 150,
            valueFormatter: numFormatter,
          })
        ),
      ];
    }

    // ── MATRIX: Columns only but no values yet ──────────────────────────────
    if (colFields.length > 0 && valFields.length === 0) return [];

    // ── MATRIX: Only rows or nothing → flat raw table ───────────────────────
    const visible = rowFields.length
      ? rowFields.filter((c) => allDataCols.includes(c))
      : allDataCols;
    return (visible.length ? visible : allDataCols).map((col) => makeCol(col));
  }, [
    vizType, rowFields, colFields, valFields,
    data, pivotColDefs, getAggFunc, getHeaderName, handleRename,
  ]);

  const defaultColDef = useMemo(
    () => ({ sortable: true, filter: true, resizable: true, flex: 1, minWidth: 100 }),
    []
  );

  // ── Loading / empty states ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid-empty">
        <div className="empty-state">
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
          <h4 style={{ marginTop: 16 }}>Loading data…</h4>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="grid-empty">
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h4>No data to display</h4>
          <p>Select a dataset then drag fields to configure your view.</p>
        </div>
      </div>
    );
  }

  // Prompt to add values when columns are set but no values yet
  if (vizType === "matrix" && colFields.length > 0 && valFields.length === 0) {
    return (
      <div className="grid-wrapper">
        <div className="grid-meta">
          <span className="grid-tag">Matrix (Pivot)</span>
          <span className="grid-count">{data.length} rows loaded</span>
          <span className="grid-fields-info">
            Cols: <strong>{colFields.join(", ")}</strong>
          </span>
        </div>
        <div className="grid-empty">
          <div className="empty-state">
            <div className="empty-icon">∑</div>
            <h4>Drop a value field to pivot</h4>
            <p>
              Drag a numeric field into <strong>Values</strong> to
              cross-tabulate by <strong>{colFields.join(", ")}</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isAggregated = vizType === "matrix" && rowFields.length > 0 && valFields.length > 0;
  const modeLabel =
    vizType === "matrix"
      ? colFields.length > 0 ? "Matrix (Pivot)" : "Matrix (Grouped)"
      : "Table";

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
            {rowFields.length > 0 && (
              <span>Rows: <strong>{rowFields.join(", ")}</strong></span>
            )}
            {colFields.length > 0 && (
              <span style={{ marginLeft: 8 }}>
                Cols: <strong>{colFields.join(", ")}</strong>
              </span>
            )}
          </span>
        ) : (
          <span className="grid-hint">← Drag fields to configure</span>
        )}
      </div>

      {/* Values strip */}
      {vizType === "matrix" && valFields.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", flexWrap: "wrap",
          gap: 6, padding: "6px 12px", background: "#0a1929",
          borderBottom: "1px solid #1a2e45",
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, color: "#4a7fa5",
            textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 4,
          }}>
            Values:
          </span>
          {valFields.map((field) => (
            <ValueFieldPill
              key={field}
              field={field}
              aggFunc={getAggFunc(field)}
              onChange={(fn) => handleAggChange(field, fn)}
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
          rowData={displayData}
          defaultColDef={defaultColDef}
          animateRows
          pivotMode={false}
          pagination
          paginationPageSize={25}
          paginationPageSizeSelector={[10, 25, 50, 100]}
          popupParent={document.body}
        />
      </div>
    </div>
  );
}