import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry, AllEnterpriseModule } from "ag-grid-enterprise";

ModuleRegistry.registerModules([AllEnterpriseModule]);

const AGG_FUNCS = ["sum", "avg", "min", "max", "count"];

// ── Custom Header: rename + pin toggle ───────────────────────────────────────
function CustomHeader({ displayName, field, onRename, onPinToggle, pinned }) {
  const [editing, setEditing]   = useState(false);
  const [value, setValue]       = useState(displayName);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const btnRef  = useRef(null);
  const menuElRef = useRef(null);

  React.useEffect(() => setValue(displayName), [displayName]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuElRef.current && !menuElRef.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const commit = useCallback(() => {
    setEditing(false);
    if (value.trim() && value.trim() !== displayName) onRename(field, value.trim());
    else setValue(displayName);
  }, [value, displayName, field, onRename]);

  const openMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(v => !v);
  };

  // Compute menu position based on button
  const getMenuStyle = () => {
    if (!btnRef.current) return {};
    const rect = btnRef.current.getBoundingClientRect();
    return {
      position: "fixed",
      top: rect.bottom + 4,
      left: Math.max(0, rect.left - 120),
      zIndex: 99999,
      background: "#0a1929",
      border: "1px solid #1e3a5f",
      borderRadius: 8,
      boxShadow: "0 8px 24px rgba(0,0,0,0.8)",
      minWidth: 180,
      overflow: "hidden",
    };
  };

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setValue(displayName); setEditing(false); }
          e.stopPropagation();
        }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", background: "#0f1e30", border: "1px solid #2d6aad",
          borderRadius: 4, color: "#fff", fontSize: 12, fontWeight: 700,
          padding: "2px 6px", outline: "none",
        }}
      />
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 3, overflow: "hidden" }}>
      {pinned && (
        <span style={{ fontSize: 9, color: "#f0a500", flexShrink: 0 }} title="Pinned left">📌</span>
      )}

      <span style={{
        flex: 1, overflow: "hidden", textOverflow: "ellipsis",
        whiteSpace: "nowrap", fontSize: 12, fontWeight: 600,
      }}>
        {value}
      </span>

      {/* ⋮ options button */}
      <button
        ref={btnRef}
        onClick={openMenu}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#4a7fa5", fontSize: 14, padding: "0 2px",
          lineHeight: 1, flexShrink: 0, opacity: 0.6,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
        title="Column options"
      >
        ⋮
      </button>

      {/* Dropdown menu rendered via portal-style fixed positioning */}
      {menuOpen && (
        <div ref={menuElRef} style={getMenuStyle()}>
          <div
            onMouseDown={(e) => { e.stopPropagation(); setEditing(true); setMenuOpen(false); }}
            style={menuItemStyle("#90c8ff")}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#0f1e30")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            ✎&nbsp; Rename column
          </div>
          <div style={{ borderTop: "1px solid #1a2e45" }} />
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              onPinToggle(field, pinned ? null : "left");
              setMenuOpen(false);
            }}
            style={menuItemStyle(pinned ? "#f0a500" : "#90c8ff")}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#0f1e30")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {pinned ? "📌 Unpin column" : "📌 Pin column left"}
          </div>
        </div>
      )}
    </div>
  );
}

const menuItemStyle = (color = "#90c8ff") => ({
  padding: "9px 14px",
  fontSize: 12,
  color,
  cursor: "pointer",
  background: "transparent",
  userSelect: "none",
  transition: "background 0.1s",
});

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
        <button onClick={() => setOpen(v => !v)} style={{
          background: "#2d6aad33", border: "1px solid #2d6aad",
          borderRadius: 4, color: "#7eb8f7", fontSize: 10,
          fontWeight: 700, padding: "1px 5px", cursor: "pointer", textTransform: "uppercase",
        }}>
          {aggFunc} ▾
        </button>
        <button onClick={onRemove} style={{
          background: "none", border: "none", color: "#7eb8f7",
          cursor: "pointer", fontSize: 13, lineHeight: 1, padding: "0 2px",
        }}>×</button>
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
              <div key={fn} onClick={() => { onChange(fn); setOpen(false); }}
                style={{
                  padding: "6px 14px", fontSize: 12,
                  color: fn === aggFunc ? "#90c8ff" : "#aac",
                  background: fn === aggFunc ? "#1a3a5c" : "transparent",
                  cursor: "pointer", fontWeight: fn === aggFunc ? 700 : 400, textTransform: "uppercase",
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const toLabel = (col) =>
  col.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

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
    for (const field of valFields) result[field] = computeAgg(_rows, field, aggFuncs[field] ?? "sum");
    return result;
  });
}

function pivotData(data, rowFields, colFields, valFields, aggFuncs) {
  if (!data?.length || !rowFields.length || !colFields.length || !valFields.length)
    return { rows: [], pivotColDefs: [] };

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

  const colValueSets = colFields.map((cf) => ({
    field: cf,
    vals: [...new Set(data.map((r) => String(r[cf])))].sort(),
  }));

  const cartesian = (arrays) =>
    arrays.reduce((acc, arr) => acc.flatMap((a) => arr.map((b) => [...a, b])), [[]]);
  const colCombos = cartesian(colValueSets.map((cv) => cv.vals));

  const pivotColDefs = colCombos.flatMap((combo) =>
    valFields.map((vf) => ({
      colLabel: combo.join(" | ") + (valFields.length > 1 ? ` · ${toLabel(vf)}` : ""),
      colKey: `__pivot__${combo.join("||")}__${vf}`,
      combo, vf,
    }))
  );

  const rows = Array.from(rowGroups.values()).map(({ _base, _rows }) => {
    const result = { ..._base };
    for (const { colKey, combo, vf } of pivotColDefs) {
      const matched = _rows.filter((r) => colFields.every((cf, i) => String(r[cf]) === combo[i]));
      result[colKey] = matched.length ? computeAgg(matched, vf, aggFuncs[vf] ?? "sum") : null;
    }
    return result;
  });

  return { rows, pivotColDefs };
}

// ── Estimate column width from content ────────────────────────────────────────
function estimateWidth(field, data, headerLabel) {
  const CHAR_PX = 8.5;
  const PADDING = 36;
  const MIN     = 70;
  const MAX     = 280;

  const headerLen  = (headerLabel ?? field).length;
  const sample     = data?.slice(0, 150) ?? [];
  const maxDataLen = sample.reduce((max, row) => {
    const val = row[field];
    return Math.max(max, val == null ? 0 : String(val).length);
  }, 0);

  return Math.min(MAX, Math.max(MIN, Math.ceil(Math.max(headerLen, maxDataLen) * CHAR_PX + PADDING)));
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
  const [aggFuncs, setAggFuncs]     = useState({});
  const [renames, setRenames]       = useState({});
  const [pinnedCols, setPinnedCols] = useState({});

  const handleAggChange = useCallback((field, fn)   => setAggFuncs(p => ({ ...p, [field]: fn })), []);
  const handleRename    = useCallback((field, name)  => setRenames(p => ({ ...p, [field]: name })), []);
  const handlePinToggle = useCallback((field, pin)   => setPinnedCols(p => ({ ...p, [field]: pin })), []);

  const getAggFunc = useCallback(
    (field) => aggFuncs[field] ?? (data?.[0] && typeof data[0][field] === "number" ? "sum" : "count"),
    [aggFuncs, data]
  );

  const getHeaderName = useCallback(
    (field, prefix) => renames[field] ?? (prefix ? `${prefix} of ${toLabel(field)}` : toLabel(field)),
    [renames]
  );

  const resolvedAggFuncs = useMemo(() => {
    const out = {};
    for (const f of valFields) out[f] = getAggFunc(f);
    return out;
  }, [valFields, getAggFunc]);

  // ── Display data ──────────────────────────────────────────────────────────
  const { displayData, pivotColDefs } = useMemo(() => {
    if (vizType !== "matrix") return { displayData: data, pivotColDefs: [] };
    const hasPivot    = colFields.length > 0 && rowFields.length > 0 && valFields.length > 0;
    const hasGroupOnly = rowFields.length > 0 && colFields.length === 0 && valFields.length > 0;
    if (hasPivot) {
      const { rows, pivotColDefs } = pivotData(data, rowFields, colFields, valFields, resolvedAggFuncs);
      return { displayData: rows, pivotColDefs };
    }
    if (hasGroupOnly)
      return { displayData: aggregateData(data, rowFields, valFields, resolvedAggFuncs), pivotColDefs: [] };
    return { displayData: data, pivotColDefs: [] };
  }, [vizType, rowFields, colFields, valFields, data, resolvedAggFuncs]);

  // ── Column defs ───────────────────────────────────────────────────────────
  const columnDefs = useMemo(() => {
    if (!data?.length) return [];
    const allDataCols = Object.keys(data[0]);

    const makeCol = (col, opts = {}) => {
      const headerLabel = opts.headerName ?? getHeaderName(col, opts.aggPrefix);
      const pin         = pinnedCols.hasOwnProperty(col) ? pinnedCols[col] : (opts.pinned ?? null);
      const width       = estimateWidth(col, displayData ?? data, headerLabel);
      return {
        field: col,
        headerName: headerLabel,
        headerComponent: CustomHeader,
        headerComponentParams: { displayName: headerLabel, field: col, onRename: handleRename, onPinToggle: handlePinToggle, pinned: pin },
        sortable: true, filter: true, resizable: true,
        width, minWidth: 60,
        pinned: pin,
        ...(opts.valueFormatter ? { valueFormatter: opts.valueFormatter } : {}),
      };
    };

    const numFmt = ({ value }) =>
      value == null ? "" : typeof value === "number"
        ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value;

    // TABLE
    if (vizType === "table") {
      const visible = rowFields.length || colFields.length || valFields.length
        ? [...rowFields, ...colFields, ...valFields]
        : allDataCols;
      return visible.filter((c) => allDataCols.includes(c)).map((col) => makeCol(col));
    }

    // MATRIX: Pivot
    if (colFields.length > 0 && rowFields.length > 0 && valFields.length > 0) {
      return [
        ...rowFields.map((col) => makeCol(col, { pinned: pinnedCols[col] ?? "left" })),
        ...pivotColDefs.map(({ colLabel, colKey }) => {
          const pin   = pinnedCols[colKey] ?? null;
          const width = estimateWidth(colKey, displayData, colLabel);
          return {
            field: colKey, headerName: colLabel,
            headerComponent: CustomHeader,
            headerComponentParams: { displayName: colLabel, field: colKey, onRename: handleRename, onPinToggle: handlePinToggle, pinned: pin },
            sortable: true, filter: true, resizable: true,
            width, minWidth: 60, pinned: pin,
            valueFormatter: numFmt,
          };
        }),
      ];
    }

    // MATRIX: Grouped
    if (rowFields.length > 0 && valFields.length > 0) {
      return [
        ...rowFields.map((col) => makeCol(col, { pinned: pinnedCols[col] ?? "left" })),
        ...valFields.map((col) => makeCol(col, { aggPrefix: getAggFunc(col).toUpperCase(), valueFormatter: numFmt })),
      ];
    }

    if (colFields.length > 0 && valFields.length === 0) return [];

    const visible = rowFields.length ? rowFields.filter((c) => allDataCols.includes(c)) : allDataCols;
    return (visible.length ? visible : allDataCols).map((col) => makeCol(col));
  }, [
    vizType, rowFields, colFields, valFields, data, displayData,
    pivotColDefs, getAggFunc, getHeaderName, handleRename, handlePinToggle, pinnedCols,
  ]);

  const defaultColDef = useMemo(() => ({
    sortable: true, filter: true, resizable: true,
  }), []);

  // ── Loading / empty ───────────────────────────────────────────────────────
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

  if (vizType === "matrix" && colFields.length > 0 && valFields.length === 0) {
    return (
      <div className="grid-wrapper">
        <div className="grid-meta">
          <span className="grid-tag">Matrix (Pivot)</span>
          <span className="grid-count">{data.length} rows loaded</span>
          <span className="grid-fields-info">Cols: <strong>{colFields.join(", ")}</strong></span>
        </div>
        <div className="grid-empty">
          <div className="empty-state">
            <div className="empty-icon">∑</div>
            <h4>Drop a value field to pivot</h4>
            <p>Drag a numeric field into <strong>Values</strong> to cross-tabulate by <strong>{colFields.join(", ")}</strong>.</p>
          </div>
        </div>
      </div>
    );
  }

  const isAggregated = vizType === "matrix" && rowFields.length > 0 && valFields.length > 0;
  const modeLabel = vizType === "matrix"
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
            {rowFields.length > 0 && <span>Rows: <strong>{rowFields.join(", ")}</strong></span>}
            {colFields.length > 0 && <span style={{ marginLeft: 8 }}>Cols: <strong>{colFields.join(", ")}</strong></span>}
          </span>
        ) : (
          <span className="grid-hint">← Drag fields to configure</span>
        )}
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#2d4a6a" }}>
          ⋮ header → pin column · drag edge → resize
        </span>
      </div>

      {/* Values strip */}
      {vizType === "matrix" && valFields.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", flexWrap: "wrap",
          gap: 6, padding: "6px 12px", background: "#0a1929", borderBottom: "1px solid #1a2e45",
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#4a7fa5", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 4 }}>
            Values:
          </span>
          {valFields.map((field) => (
            <ValueFieldPill key={field} field={field} aggFunc={getAggFunc(field)}
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
          alwaysShowHorizontalScroll
          suppressColumnVirtualisation={false}
        />
      </div>
    </div>
  );
}
