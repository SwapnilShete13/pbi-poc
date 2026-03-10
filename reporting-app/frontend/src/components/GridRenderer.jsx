// import React, { useMemo, useRef } from "react";
// import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
// import { ModuleRegistry, AllEnterpriseModule } from "ag-grid-enterprise";

// ModuleRegistry.registerModules([AllEnterpriseModule]);

// export default function GridRenderer({
//   vizType,
//   rowFields,
//   colFields,
//   valFields,
//   data,
//   loading,
// }) {
//   const gridRef = useRef(null);

//   const { columnDefs, agProps } = useMemo(() => {
//     if (!data || data.length === 0) return { columnDefs: [], agProps: {} };

//     const allDataCols = Object.keys(data[0]);

//     // ── TABLE MODE ─────────────────────────────────────
//     if (vizType === "table") {
//       const visible =
//         rowFields.length || colFields.length || valFields.length
//           ? [...rowFields, ...colFields, ...valFields]
//           : allDataCols;

//       return {
//         columnDefs: visible
//           .filter((c) => allDataCols.includes(c))
//           .map((col) => ({
//             field: col,
//             headerName: col
//               .replace(/_/g, " ")
//               .replace(/\b\w/g, (l) => l.toUpperCase()),
//             sortable: true,
//             filter: true,
//             resizable: true,
//             flex: 1,
//             minWidth: 110,
//           })),
//         agProps: { pivotMode: false },
//       };
//     }

//     // ── MATRIX MODE ────────────────────────────────────
//     const hasPivot = colFields.length > 0;

//     const fieldSet = new Set([...rowFields, ...colFields, ...valFields]);
//     const usedFields = fieldSet.size > 0 ? [...fieldSet] : allDataCols;

//     const columnDefs = usedFields
//       .filter((c) => allDataCols.includes(c))
//       .map((col) => {
//         const isRow = rowFields.includes(col);
//         const isCol = colFields.includes(col);
//         const isVal = valFields.includes(col);

//         const sampleValue = data[0]?.[col];

//         const isNumber =
//           typeof sampleValue === "number" && !Number.isNaN(sampleValue);

//         const isIdColumn = col.toLowerCase().includes("id");

//         return {
//           field: col,
//           headerName: col
//             .replace(/_/g, " ")
//             .replace(/\b\w/g, (l) => l.toUpperCase()),

//           rowGroup: isRow,
//           pivot: isCol,
//           hide: isRow || isCol,

//           ...(isVal && isNumber && !isIdColumn
//             ? {
//               enableValue: true,
//               aggFunc: "sum",
//               allowedAggFuncs: ["sum", "avg", "min", "max", "count"],
//             }
//             : {}),

//           sortable: true,
//           resizable: true,
//           minWidth: 110,
//           flex: 1,
//         };
//       });

//     const agProps = {
//       pivotMode: hasPivot,

//       groupDisplayType: hasPivot ? undefined : "groupRows",

//       autoGroupColumnDef: {
//         headerName: rowFields.length ? rowFields.join(" › ") : "Group",
//         minWidth: 180,
//         cellRendererParams: {
//           suppressCount: false,
//         },
//         sortable: true,
//         resizable: true,
//       },

//       suppressAggFuncInHeader: false,
//     };

//     return { columnDefs, agProps };
//   }, [vizType, rowFields, colFields, valFields, data]);

//   // ── DEFAULT COLUMN SETTINGS ─────────────────────────
//   const defaultColDef = useMemo(
//     () => ({
//       sortable: true,
//       filter: true,
//       resizable: true,
//       flex: 1,
//       minWidth: 100,
//       enableValue: true,
//       allowedAggFuncs: ["sum", "avg", "min", "max", "count"],
//     }),
//     []
//   );

//   // ── LOADING STATE ───────────────────────────────────
//   if (loading) {
//     return (
//       <div className="grid-empty">
//         <div className="empty-state">
//           <div
//             className="spinner"
//             style={{ width: 36, height: 36, borderWidth: 3 }}
//           />
//           <h4 style={{ marginTop: 16 }}>Loading data…</h4>
//         </div>
//       </div>
//     );
//   }

//   // ── NO DATA STATE ───────────────────────────────────
//   if (!data || data.length === 0) {
//     return (
//       <div className="grid-empty">
//         <div className="empty-state">
//           <div className="empty-icon">📋</div>
//           <h4>No data to display</h4>
//           <p>
//             Select a dataset — data loads automatically, then drag fields to
//             configure your view.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const modeLabel =
//     vizType === "matrix"
//       ? colFields.length > 0
//         ? "Matrix (Pivot)"
//         : "Matrix (Grouped)"
//       : "Table";

//   return (
//     <div className="grid-wrapper">
//       <div className="grid-meta">
//         <span className="grid-tag">{modeLabel}</span>
//         <span className="grid-count">{data.length} rows loaded</span>

//         {rowFields.length || colFields.length || valFields.length ? (
//           <span className="grid-fields-info">
//             {rowFields.length > 0 && (
//               <span>
//                 Rows: <strong>{rowFields.join(", ")}</strong>
//               </span>
//             )}

//             {colFields.length > 0 && (
//               <span style={{ marginLeft: 8 }}>
//                 Cols: <strong>{colFields.join(", ")}</strong>
//               </span>
//             )}

//             {valFields.length > 0 && (
//               <span style={{ marginLeft: 8 }}>
//                 Values: <strong>{valFields.join(", ")}</strong>
//               </span>
//             )}
//           </span>
//         ) : (
//           <span className="grid-hint">← Drag fields to filter columns</span>
//         )}
//       </div>

//       <div className="ag-theme-alpine-dark" id="ag-grid-container">
//         <AgGridReact
//           ref={gridRef}
//           columnDefs={columnDefs}
//           rowData={data}
//           defaultColDef={defaultColDef}
//           animateRows
//           pagination
//           paginationPageSize={25}
//           paginationPageSizeSelector={[10, 25, 50, 100]}
//           {...agProps}
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

// ── Value Field Pill with agg func selector ──────────────────────────────────
function ValueFieldPill({ field, aggFunc, onChange, onRemove }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          background: "#1e3a5f",
          border: "1px solid #2d6aad",
          borderRadius: 6,
          padding: "3px 6px 3px 10px",
          gap: 4,
          fontSize: 12,
          color: "#90c8ff",
          cursor: "default",
          userSelect: "none",
        }}
      >
        <span style={{ fontWeight: 600 }}>{field}</span>

        {/* Agg func badge — click to open picker */}
        <button
          onClick={() => setOpen((v) => !v)}
          title="Change aggregate function"
          style={{
            background: "#2d6aad33",
            border: "1px solid #2d6aad",
            borderRadius: 4,
            color: "#7eb8f7",
            fontSize: 10,
            fontWeight: 700,
            padding: "1px 5px",
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {aggFunc} ▾
        </button>

        {/* Remove pill */}
        <button
          onClick={onRemove}
          style={{
            background: "none",
            border: "none",
            color: "#7eb8f7",
            cursor: "pointer",
            fontSize: 13,
            lineHeight: 1,
            padding: "0 2px",
          }}
        >
          ×
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 999,
            background: "#0f1e30",
            border: "1px solid #2d6aad",
            borderRadius: 6,
            overflow: "hidden",
            boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            minWidth: 100,
          }}
        >
          {AGG_FUNCS.map((fn) => (
            <div
              key={fn}
              onClick={() => { onChange(fn); setOpen(false); }}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                color: fn === aggFunc ? "#90c8ff" : "#aac",
                background: fn === aggFunc ? "#1a3a5c" : "transparent",
                cursor: "pointer",
                fontWeight: fn === aggFunc ? 700 : 400,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#1a3a5c"}
              onMouseLeave={(e) => e.currentTarget.style.background = fn === aggFunc ? "#1a3a5c" : "transparent"}
            >
              {fn}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GridRenderer({
  vizType,
  rowFields,
  colFields,
  valFields,
  data,
  loading,
  // Optional: lift agg state up. If not provided, managed internally.
  aggFuncs: aggFuncsProp,
  onAggFuncChange,
  onRemoveValField,
}) {
  const gridRef = useRef(null);

  // ── Internal agg func state (per value field) ────────────────────────────
  const [internalAggFuncs, setInternalAggFuncs] = useState({});

  const aggFuncs = aggFuncsProp ?? internalAggFuncs;

  const handleAggChange = useCallback((field, fn) => {
    if (onAggFuncChange) {
      onAggFuncChange(field, fn);
    } else {
      setInternalAggFuncs((prev) => ({ ...prev, [field]: fn }));
    }
  }, [onAggFuncChange]);

  // ── Column defs ──────────────────────────────────────────────────────────
  const { columnDefs, agProps } = useMemo(() => {
    if (!data || data.length === 0) return { columnDefs: [], agProps: {} };

    const allDataCols = Object.keys(data[0]);

    // ── TABLE MODE ─────────────────────────────────────────────────────────
    if (vizType === "table") {
      const visible =
        rowFields.length || colFields.length || valFields.length
          ? [...rowFields, ...colFields, ...valFields]
          : allDataCols;

      return {
        columnDefs: visible
          .filter((c) => allDataCols.includes(c))
          .map((col) => ({
            field: col,
            headerName: col.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            sortable: true,
            filter: true,
            resizable: true,
            flex: 1,
            minWidth: 110,
          })),
        agProps: { pivotMode: false },
      };
    }

    // ── MATRIX MODE ────────────────────────────────────────────────────────
    // KEY FIX: If NO colFields/valFields are configured, show flat table.
    // Only group when it makes sense (user intentionally picked non-ID row fields).
    const hasPivot = colFields.length > 0;
    const hasGrouping = rowFields.length > 0;

    // When nothing is configured, fall back to flat table view
    if (!hasGrouping && !hasPivot && valFields.length === 0) {
      return {
        columnDefs: allDataCols.map((col) => ({
          field: col,
          headerName: col.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          sortable: true,
          filter: true,
          resizable: true,
          flex: 1,
          minWidth: 110,
        })),
        agProps: { pivotMode: false },
      };
    }

    const fieldSet = new Set([...rowFields, ...colFields, ...valFields]);
    const usedFields = fieldSet.size > 0 ? [...fieldSet] : allDataCols;

    const columnDefs = usedFields
      .filter((c) => allDataCols.includes(c))
      .map((col) => {
        const isRow = rowFields.includes(col);
        const isCol = colFields.includes(col);
        const isVal = valFields.includes(col);
        const sampleValue = data[0]?.[col];
        const isNumber = typeof sampleValue === "number" && !Number.isNaN(sampleValue);

        // Per-field agg func (default: sum for numbers, count otherwise)
        const resolvedAgg = aggFuncs[col] ?? (isNumber ? "sum" : "count");

        return {
          field: col,
          headerName: col.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          rowGroup: isRow,
          pivot: isCol,
          // FIX: only hide source col when it's used as a group/pivot axis
          hide: isRow || isCol,
          ...(isVal
            ? {
              enableValue: true,
              aggFunc: resolvedAgg,
              allowedAggFuncs: AGG_FUNCS,
            }
            : {}),
          sortable: true,
          resizable: true,
          minWidth: 110,
          flex: 1,
        };
      });

    const agProps = {
      pivotMode: hasPivot,
      groupDisplayType: hasPivot ? undefined : "groupRows",
      autoGroupColumnDef: {
        headerName: rowFields.length ? rowFields.join(" › ") : "Group",
        minWidth: 200,
        cellRendererParams: { suppressCount: true }, // FIX: hide "(1)" count
        sortable: true,
        resizable: true,
      },
      suppressAggFuncInHeader: false,
    };

    return { columnDefs, agProps };
  }, [vizType, rowFields, colFields, valFields, data, aggFuncs]);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
      enableValue: true,
      allowedAggFuncs: AGG_FUNCS,
    }),
    []
  );

  // ── Loading ───────────────────────────────────────────────────────────────
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
          <p>Select a dataset — data loads automatically, then drag fields to configure your view.</p>
        </div>
      </div>
    );
  }

  const modeLabel =
    vizType === "matrix"
      ? colFields.length > 0
        ? "Matrix (Pivot)"
        : "Matrix (Grouped)"
      : "Table";

  return (
    <div className="grid-wrapper">
      {/* ── Meta bar ── */}
      <div className="grid-meta">
        <span className="grid-tag">{modeLabel}</span>
        <span className="grid-count">{data.length} rows loaded</span>

        {rowFields.length || colFields.length || valFields.length ? (
          <span className="grid-fields-info">
            {rowFields.length > 0 && (
              <span>Rows: <strong>{rowFields.join(", ")}</strong></span>
            )}
            {colFields.length > 0 && (
              <span style={{ marginLeft: 8 }}>Cols: <strong>{colFields.join(", ")}</strong></span>
            )}
          </span>
        ) : (
          <span className="grid-hint">← Drag fields to filter columns</span>
        )}
      </div>

      {/* ── Values strip with agg func pills ── */}
      {valFields.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 6,
            padding: "6px 12px",
            background: "#0a1929",
            borderBottom: "1px solid #1a2e45",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#4a7fa5",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginRight: 4,
            }}
          >
            Values:
          </span>
          {valFields.map((field) => (
            <ValueFieldPill
              key={field}
              field={field}
              aggFunc={aggFuncs[field] ?? (typeof data[0]?.[field] === "number" ? "sum" : "count")}
              onChange={(fn) => handleAggChange(field, fn)}
              onRemove={() => onRemoveValField?.(field)}
            />
          ))}
        </div>
      )}

      {/* ── AG Grid ── */}
      <div className="ag-theme-alpine-dark" id="ag-grid-container">
        <AgGridReact
          ref={gridRef}
          columnDefs={columnDefs}
          rowData={data}
          defaultColDef={defaultColDef}
          animateRows
          pagination
          paginationPageSize={25}
          paginationPageSizeSelector={[10, 25, 50, 100]}
          {...agProps}
        />
      </div>
    </div>
  );
}