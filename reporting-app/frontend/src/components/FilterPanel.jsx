import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";

// ── Slicer (client-side on loaded data) ──────────────────────────────────────
function Slicer({ field, allValues, selected, onChange, onRemove }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const allSelected = selected.size === 0 || selected.size === allValues.length;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleVal = (v) => {
    const next = new Set(selected);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    onChange(next);
  };

  const toggleAll = () => onChange(allSelected ? new Set(allValues) : new Set());

  const label = allSelected
    ? "All"
    : selected.size === 1
    ? [...selected][0]
    : `${selected.size} selected`;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Field label + remove */}
      <div style={{
        fontSize: 10, fontWeight: 700, color: "#4a7fa5",
        textTransform: "uppercase", letterSpacing: "0.06em",
        marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span>{field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span>
        <button onClick={onRemove} style={{
          background: "none", border: "none", color: "#4a7fa5",
          cursor: "pointer", fontSize: 14, lineHeight: 1,
        }}>×</button>
      </div>

      {/* Trigger button */}
      <button onClick={() => setOpen(v => !v)} style={{
        width: "100%", display: "flex", alignItems: "center",
        justifyContent: "space-between",
        background: "#0f1e30", border: "1px solid #1e3a5f",
        borderRadius: 6, padding: "6px 10px",
        color: allSelected ? "#4a7fa5" : "#90c8ff",
        fontSize: 12, cursor: "pointer", fontWeight: allSelected ? 400 : 600,
      }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        <span style={{ marginLeft: 6, fontSize: 10, flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 1000,
          background: "#0a1929", border: "1px solid #1e3a5f", borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          minWidth: "100%", maxHeight: 220, overflowY: "auto", padding: "4px 0",
        }}>
          {/* Select All */}
          <label style={{
            display: "flex", alignItems: "center", gap: 8, padding: "7px 12px",
            cursor: "pointer", borderBottom: "1px solid #1a2e45",
            fontSize: 12, color: "#7eb8f7", fontWeight: 700,
          }}>
            <input type="checkbox" checked={allSelected} onChange={toggleAll}
              style={{ accentColor: "#2d6aad", width: 14, height: 14 }} />
            Select All
          </label>

          {allValues.map((v) => {
            const checked = allSelected ? true : selected.has(v);
            return (
              <label key={v} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 12px", cursor: "pointer", fontSize: 12,
                color: checked ? "#c8e0ff" : "#5a7a9a",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#0f1e30"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <input type="checkbox" checked={checked} onChange={() => toggleVal(v)}
                  style={{ accentColor: "#2d6aad", width: 14, height: 14 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── SQL Query Editor with autocomplete ───────────────────────────────────────
function QueryEditor({ value, onChange, onRun, columns, tableName, error, loading }) {
  const [suggestions, setSuggestions] = useState([]);
  const [sugIdx, setSugIdx] = useState(-1);
  const textareaRef = useRef(null);

  const SQL_KEYWORDS = [
    "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "LIKE", "IS", "NULL",
    "IS NULL", "IS NOT NULL", "BETWEEN", "GROUP BY", "ORDER BY", "HAVING",
    "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "ON", "AS", "DISTINCT",
    "TOP", "CASE", "WHEN", "THEN", "ELSE", "END",
    "SUM", "AVG", "MIN", "MAX", "COUNT",
    "CAST", "CONVERT", "YEAR", "MONTH", "DAY", "DATEPART", "DATEDIFF",
    "DATEADD", "GETDATE", "FORMAT", "ISNULL", "COALESCE",
    "UPPER", "LOWER", "LEN", "TRIM", "SUBSTRING", "REPLACE",
    "ASC", "DESC", "WITH", "CTE",
  ];

  const getLastToken = (val, cursorPos) => {
    const textUpToCursor = val.slice(0, cursorPos);
    const match = textUpToCursor.match(/[\w.]+$/);
    return match ? match[0] : "";
  };

  const updateSuggestions = useCallback((val, cursorPos) => {
    const token = getLastToken(val, cursorPos ?? val.length);
    if (!token || token.length < 1) { setSuggestions([]); return; }
    const upper = token.toUpperCase();
    const colMatches = columns.filter(c => c.toUpperCase().startsWith(upper) && c.toUpperCase() !== upper);
    const kwMatches = SQL_KEYWORDS.filter(k => k.startsWith(upper) && k !== upper);
    const tableMatch = tableName && tableName.toUpperCase().startsWith(upper) && tableName.toUpperCase() !== upper
      ? [tableName] : [];
    setSuggestions([...colMatches, ...tableMatch, ...kwMatches].slice(0, 12));
    setSugIdx(-1);
  }, [columns, tableName]);

  const applySuggestion = (sug) => {
    const pos = textareaRef.current?.selectionStart ?? value.length;
    const token = getLastToken(value, pos);
    const newVal = value.slice(0, pos - token.length) + sug + value.slice(pos);
    onChange(newVal);
    setSuggestions([]);
    setTimeout(() => {
      const newPos = pos - token.length + sug.length;
      textareaRef.current?.setSelectionRange(newPos, newPos);
      textareaRef.current?.focus();
    }, 0);
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 8 }}>
        {/* Editor */}
        <div style={{ flex: 1, position: "relative" }}>
          <textarea
            ref={textareaRef}
            value={value}
            rows={4}
            onChange={(e) => {
              onChange(e.target.value);
              updateSuggestions(e.target.value, e.target.selectionStart);
            }}
            onClick={(e) => updateSuggestions(e.target.value, e.target.selectionStart)}
            onKeyDown={(e) => {
              if (suggestions.length) {
                if (e.key === "ArrowDown") { e.preventDefault(); setSugIdx(i => Math.min(i + 1, suggestions.length - 1)); return; }
                if (e.key === "ArrowUp") { e.preventDefault(); setSugIdx(i => Math.max(i - 1, 0)); return; }
                if (e.key === "Tab") { e.preventDefault(); applySuggestion(suggestions[Math.max(sugIdx, 0)]); return; }
                if (e.key === "Escape") { setSuggestions([]); return; }
                if (e.key === "Enter" && sugIdx >= 0) { e.preventDefault(); applySuggestion(suggestions[sugIdx]); return; }
              }
              // F5 or Ctrl+Enter to run
              if (e.key === "F5" || (e.key === "Enter" && e.ctrlKey)) {
                e.preventDefault();
                onRun();
              }
            }}
            onBlur={() => setTimeout(() => setSuggestions([]), 200)}
            placeholder={
              tableName
                ? `SELECT *\nFROM ${tableName}\nWHERE vendor_category = 'Electronics'\n  AND YEAR(contract_date) = 2024`
                : "SELECT * FROM your_table WHERE ..."
            }
            spellCheck={false}
            style={{
              width: "100%",
              background: "#060f1a",
              border: `1px solid ${error ? "#c0392b" : value.trim() ? "#2d6aad" : "#1a2e45"}`,
              borderRadius: 8,
              color: "#c8e0ff",
              fontSize: 12,
              fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
              padding: "10px 12px",
              outline: "none",
              resize: "vertical",
              lineHeight: 1.7,
              boxSizing: "border-box",
              transition: "border-color 0.2s",
              minHeight: 90,
            }}
          />
        </div>

        {/* Run button */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            onClick={onRun}
            disabled={loading || !value.trim()}
            style={{
              background: value.trim() ? "#1a4a8a" : "#0f1e30",
              border: `1px solid ${value.trim() ? "#2d6aad" : "#1a2e45"}`,
              borderRadius: 8, color: value.trim() ? "#90c8ff" : "#2d4a6a",
              fontSize: 12, fontWeight: 700, padding: "10px 16px",
              cursor: value.trim() && !loading ? "pointer" : "default",
              transition: "all 0.2s", whiteSpace: "nowrap",
              display: "flex", alignItems: "center", gap: 6,
            }}
            title="Run query (F5 or Ctrl+Enter)"
          >
            {loading
              ? <><span className="spinner-sm" /> Running…</>
              : <>▶ Run</>
            }
          </button>

          {value.trim() && (
            <button
              onClick={() => onChange("")}
              style={{
                background: "none", border: "1px solid #1a2e45",
                borderRadius: 8, color: "#4a7fa5", fontSize: 11,
                padding: "6px 10px", cursor: "pointer",
              }}
              title="Clear query"
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete */}
      {suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% - 4px)", left: 0,
          zIndex: 1001, background: "#080f1a",
          border: "1px solid #1e3a5f", borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.7)",
          overflow: "hidden", minWidth: 220,
        }}>
          {suggestions.map((s, i) => {
            const isCol = columns.includes(s);
            const isTable = s === tableName;
            const tag = isCol ? "col" : isTable ? "tbl" : "sql";
            const tagColor = isCol ? "#2d6aad" : isTable ? "#2d8a4a" : "#6a4a8a";
            return (
              <div key={s} onMouseDown={() => applySuggestion(s)}
                style={{
                  padding: "7px 12px", fontSize: 12,
                  color: i === sugIdx ? "#90c8ff" : "#7eb8f7",
                  background: i === sugIdx ? "#0f1e30" : "transparent",
                  cursor: "pointer", fontFamily: "'Fira Code', monospace",
                  display: "flex", alignItems: "center", gap: 8,
                }}
                onMouseEnter={() => setSugIdx(i)}
              >
                <span style={{
                  fontSize: 9, background: tagColor, color: "#fff",
                  borderRadius: 3, padding: "1px 5px", flexShrink: 0,
                  fontWeight: 700, textTransform: "uppercase",
                }}>
                  {tag}
                </span>
                {s}
              </div>
            );
          })}
          <div style={{ padding: "4px 12px", fontSize: 10, color: "#2d4a6a", borderTop: "1px solid #1a2e45" }}>
            Tab · ↑↓ · Enter to complete
          </div>
        </div>
      )}

      {/* Status */}
      <div style={{ marginTop: 5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {error
          ? <span style={{ fontSize: 11, color: "#c0392b" }}>⚠ {error}</span>
          : <span style={{ fontSize: 10, color: "#2d4a6a" }}>
              Full SSMS-style SQL · F5 or Ctrl+Enter to run · Tab to autocomplete
            </span>
        }
      </div>
    </div>
  );
}

// ── FilterPanel ───────────────────────────────────────────────────────────────
export default function FilterPanel({
  columns,
  tableName,
  data,
  query,
  onQueryChange,
  onRunQuery,
  slicers,
  onSlicerChange,
  onAddSlicer,
  onRemoveSlicer,
  activeFilterCount,
  hasDataset,
  queryLoading,
  queryError,
}) {
  const [open, setOpen] = useState(false);

  const slicerValues = useMemo(() => {
    const out = {};
    for (const field of Object.keys(slicers)) {
      out[field] = [...new Set(data?.map(r => String(r[field] ?? "")) ?? [])].sort();
    }
    return out;
  }, [slicers, data]);

  const availableForSlicer = columns.filter(c => !slicers.hasOwnProperty(c));

  if (!hasDataset) return null;

  return (
    <div style={{
      border: "1px solid #1a2e45", borderRadius: 10,
      background: "#07111e", overflow: "visible",
    }}>
      {/* Toggle header */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "10px 16px", background: "none", border: "none", cursor: "pointer",
          borderBottom: open ? "1px solid #1a2e45" : "none",
        }}
      >
        <span style={{ fontSize: 15 }}>🔍</span>
        <span style={{
          fontSize: 12, fontWeight: 700, color: "#7eb8f7",
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          Filters & Slicers
        </span>

        {activeFilterCount > 0 && (
          <span style={{
            background: "#2d6aad", color: "#fff", borderRadius: 10,
            fontSize: 10, fontWeight: 700, padding: "1px 7px",
          }}>
            {activeFilterCount} active
          </span>
        )}

        <span style={{ marginLeft: "auto", color: "#4a7fa5", fontSize: 12 }}>
          {open ? "▲ Collapse" : "▼ Expand"}
        </span>
      </button>

      {open && (
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* SQL Query Editor */}
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "#4a7fa5",
              textTransform: "uppercase", letterSpacing: "0.07em",
              marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
            }}>
              <span>⌨</span> SQL Query
              <span style={{ fontSize: 9, color: "#2d4a6a", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                — full SELECT query, runs directly on SQL Server
              </span>
            </div>
            <QueryEditor
              value={query}
              onChange={onQueryChange}
              onRun={() => onRunQuery(query)}
              columns={columns}
              tableName={tableName}
              error={queryError}
              loading={queryLoading}
            />
          </div>

          {/* Slicers */}
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "#4a7fa5",
              textTransform: "uppercase", letterSpacing: "0.07em",
              marginBottom: 10, display: "flex", alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span>⧉ Slicers
                <span style={{ fontSize: 9, color: "#2d4a6a", fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 6 }}>
                  — filters currently loaded data
                </span>
              </span>
              {availableForSlicer.length > 0 && (
                <select
                  value=""
                  onChange={(e) => { if (e.target.value) onAddSlicer(e.target.value); }}
                  style={{
                    background: "#0f1e30", border: "1px solid #1e3a5f",
                    borderRadius: 5, color: "#7eb8f7", fontSize: 11,
                    padding: "3px 8px", cursor: "pointer",
                  }}
                >
                  <option value="">+ Add slicer…</option>
                  {availableForSlicer.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
            </div>

            {Object.keys(slicers).length === 0 ? (
              <p style={{ fontSize: 12, color: "#2d4a6a", margin: 0 }}>
                No slicers added. Use "+ Add slicer…" to add one.
              </p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {Object.keys(slicers).map(field => (
                  <div key={field} style={{
                    background: "#0a1929", border: "1px solid #1a2e45",
                    borderRadius: 8, padding: "10px 12px",
                    minWidth: 160, flex: "1 1 160px", maxWidth: 260,
                  }}>
                    <Slicer
                      field={field}
                      allValues={slicerValues[field] ?? []}
                      selected={slicers[field]}
                      onChange={(next) => onSlicerChange(field, next)}
                      onRemove={() => onRemoveSlicer(field)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  onQueryChange("");
                  onRunQuery("");
                  Object.keys(slicers).forEach(f => onSlicerChange(f, new Set()));
                }}
                style={{
                  background: "none", border: "1px solid #3a2020",
                  borderRadius: 6, color: "#e05555", fontSize: 11,
                  padding: "5px 14px", cursor: "pointer", fontWeight: 600,
                }}
              >
                ✕ Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}