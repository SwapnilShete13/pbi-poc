import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";

// ── SQL-like query evaluator ──────────────────────────────────────────────────
// Supports: =, !=, >, <, >=, <=, LIKE, IN, AND, OR, NOT, IS NULL, IS NOT NULL
export function evaluateQuery(data, query) {
  if (!query.trim()) return data;
  try {
    const filtered = data.filter((row) => evalExpr(query.trim(), row));
    return filtered;
  } catch {
    return null; // parse error
  }
}

function evalExpr(expr, row) {
  expr = expr.trim();

  // Strip outer parens
  if (expr.startsWith("(") && matchingParen(expr) === expr.length - 1) {
    expr = expr.slice(1, -1).trim();
  }

  // OR (lowest precedence)
  const orIdx = findLogicalOp(expr, "OR");
  if (orIdx !== -1) {
    return evalExpr(expr.slice(0, orIdx).trim(), row) ||
           evalExpr(expr.slice(orIdx + 2).trim(), row);
  }

  // AND
  const andIdx = findLogicalOp(expr, "AND");
  if (andIdx !== -1) {
    return evalExpr(expr.slice(0, andIdx).trim(), row) &&
           evalExpr(expr.slice(andIdx + 3).trim(), row);
  }

  // NOT
  if (/^NOT\s+/i.test(expr)) {
    return !evalExpr(expr.replace(/^NOT\s+/i, "").trim(), row);
  }

  // IS NULL / IS NOT NULL
  const isNullMatch = expr.match(/^(\w+)\s+IS\s+(NOT\s+)?NULL$/i);
  if (isNullMatch) {
    const val = row[isNullMatch[1]];
    const isNull = val === null || val === undefined || val === "";
    return isNullMatch[2] ? !isNull : isNull;
  }

  // IN (val1, val2, ...)
  const inMatch = expr.match(/^(\w+)\s+(NOT\s+)?IN\s*\((.+)\)$/i);
  if (inMatch) {
    const field = inMatch[1];
    const negate = !!inMatch[2];
    const vals = inMatch[3].split(",").map((v) =>
      v.trim().replace(/^['"]|['"]$/g, "").toLowerCase()
    );
    const rowVal = String(row[field] ?? "").toLowerCase();
    const found = vals.includes(rowVal);
    return negate ? !found : found;
  }

  // LIKE
  const likeMatch = expr.match(/^(\w+)\s+(NOT\s+)?LIKE\s+['"](.+)['"]/i);
  if (likeMatch) {
    const field = likeMatch[1];
    const negate = !!likeMatch[2];
    const pattern = likeMatch[3].replace(/%/g, ".*").replace(/_/g, ".");
    const re = new RegExp(`^${pattern}$`, "i");
    const found = re.test(String(row[field] ?? ""));
    return negate ? !found : found;
  }

  // Comparison: field OP value
  const cmpMatch = expr.match(/^(\w+)\s*(>=|<=|!=|<>|>|<|=)\s*(.+)$/i);
  if (cmpMatch) {
    const field = cmpMatch[1];
    const op = cmpMatch[2];
    let rhs = cmpMatch[3].trim().replace(/^['"]|['"]$/g, "");
    let lhs = row[field];

    // Try numeric comparison
    const rhsNum = Number(rhs);
    const lhsNum = Number(lhs);
    if (!isNaN(rhsNum) && !isNaN(lhsNum)) {
      lhs = lhsNum; rhs = rhsNum;
    } else {
      lhs = String(lhs ?? "").toLowerCase();
      rhs = rhs.toLowerCase();
    }

    switch (op) {
      case "=":  return lhs == rhs;
      case "!=":
      case "<>": return lhs != rhs;
      case ">":  return lhs > rhs;
      case "<":  return lhs < rhs;
      case ">=": return lhs >= rhs;
      case "<=": return lhs <= rhs;
    }
  }

  return true;
}

function findLogicalOp(expr, op) {
  let depth = 0;
  const upper = expr.toUpperCase();
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === "(") depth++;
    else if (expr[i] === ")") depth--;
    else if (depth === 0 && upper.startsWith(op, i)) {
      const before = i === 0 || /\s/.test(expr[i - 1]);
      const after = /\s/.test(expr[i + op.length]);
      if (before && after) return i;
    }
  }
  return -1;
}

function matchingParen(expr) {
  let depth = 0;
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === "(") depth++;
    else if (expr[i] === ")") { depth--; if (depth === 0) return i; }
  }
  return -1;
}

// ── Slicer component ──────────────────────────────────────────────────────────
function Slicer({ field, allValues, selected, onChange, onRemove }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const allSelected = selected.size === 0 || selected.size === allValues.length;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleVal = (v) => {
    const next = new Set(selected);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    onChange(next);
  };

  const toggleAll = () => {
    onChange(allSelected ? new Set(allValues) : new Set());
  };

  const label = allSelected
    ? "All"
    : selected.size === 1
    ? [...selected][0]
    : `${selected.size} selected`;

  return (
    <div ref={ref} style={{ position: "relative", minWidth: 160 }}>
      {/* Header */}
      <div style={{
        fontSize: 10, fontWeight: 700, color: "#4a7fa5",
        textTransform: "uppercase", letterSpacing: "0.06em",
        marginBottom: 4,
      }}>
        {field.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
        <button
          onClick={onRemove}
          style={{
            float: "right", background: "none", border: "none",
            color: "#4a7fa5", cursor: "pointer", fontSize: 13, lineHeight: 1,
          }}
          title="Remove slicer"
        >×</button>
      </div>

      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          justifyContent: "space-between",
          background: "#0f1e30", border: "1px solid #1e3a5f",
          borderRadius: 6, padding: "6px 10px",
          color: allSelected ? "#4a7fa5" : "#90c8ff",
          fontSize: 12, cursor: "pointer",
          fontWeight: allSelected ? 400 : 600,
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </span>
        <span style={{ marginLeft: 6, fontSize: 10, flexShrink: 0 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0,
          zIndex: 1000, background: "#0a1929",
          border: "1px solid #1e3a5f", borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          minWidth: "100%", maxHeight: 220, overflowY: "auto",
          padding: "4px 0",
        }}>
          {/* Select All */}
          <label style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 12px", cursor: "pointer",
            borderBottom: "1px solid #1a2e45",
            fontSize: 12, color: "#7eb8f7", fontWeight: 700,
          }}>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              style={{ accentColor: "#2d6aad", width: 14, height: 14 }}
            />
            Select All
          </label>

          {/* Values */}
          {allValues.map((v) => {
            const checked = allSelected ? true : selected.has(v);
            return (
              <label
                key={v}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 12px", cursor: "pointer",
                  fontSize: 12,
                  color: checked ? "#c8e0ff" : "#5a7a9a",
                  background: "transparent",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#0f1e30")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleVal(v)}
                  style={{ accentColor: "#2d6aad", width: 14, height: 14 }}
                />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {v}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Query input with autocomplete ─────────────────────────────────────────────
function QueryInput({ value, onChange, columns, error }) {
  const [suggestions, setSuggestions] = useState([]);
  const [sugIdx, setSugIdx] = useState(-1);
  const inputRef = useRef(null);

  const KEYWORDS = ["AND", "OR", "NOT", "IN", "LIKE", "IS NULL", "IS NOT NULL", "NULL"];
  const OPERATORS = ["=", "!=", ">", "<", ">=", "<="];

  const updateSuggestions = useCallback((val) => {
    const lastToken = val.split(/\s+/).pop();
    if (!lastToken) { setSuggestions([]); return; }

    const upper = lastToken.toUpperCase();
    const colMatches = columns.filter(c => c.toUpperCase().startsWith(upper) && c !== lastToken);
    const kwMatches = KEYWORDS.filter(k => k.startsWith(upper) && k !== upper);
    const all = [...colMatches, ...kwMatches].slice(0, 8);
    setSuggestions(all);
    setSugIdx(-1);
  }, [columns]);

  const applySuggestion = (sug) => {
    const parts = value.split(/\s+/);
    parts[parts.length - 1] = sug;
    onChange(parts.join(" ") + " ");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => { onChange(e.target.value); updateSuggestions(e.target.value); }}
          onKeyDown={(e) => {
            if (!suggestions.length) return;
            if (e.key === "ArrowDown") { e.preventDefault(); setSugIdx(i => Math.min(i + 1, suggestions.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setSugIdx(i => Math.max(i - 1, -1)); }
            else if (e.key === "Enter" && sugIdx >= 0) { e.preventDefault(); applySuggestion(suggestions[sugIdx]); }
            else if (e.key === "Escape") setSuggestions([]);
            else if (e.key === "Tab" && suggestions.length) { e.preventDefault(); applySuggestion(suggestions[Math.max(sugIdx, 0)]); }
          }}
          onBlur={() => setTimeout(() => setSuggestions([]), 150)}
          placeholder='e.g.  status = "paid"  AND  total_amount > 1000'
          spellCheck={false}
          style={{
            width: "100%",
            background: "#0a1929",
            border: `1px solid ${error ? "#e05555" : value.trim() ? "#2d6aad" : "#1a2e45"}`,
            borderRadius: 8,
            color: "#c8e0ff",
            fontSize: 13,
            fontFamily: "'Fira Code', 'Cascadia Code', monospace",
            padding: "9px 36px 9px 12px",
            outline: "none",
            letterSpacing: "0.02em",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
        />
        {value && (
          <button
            onClick={() => { onChange(""); setSuggestions([]); }}
            style={{
              position: "absolute", right: 8, top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none",
              color: "#4a7fa5", cursor: "pointer", fontSize: 16,
            }}
          >×</button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0,
          zIndex: 1001, background: "#0a1929",
          border: "1px solid #1e3a5f", borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}>
          {suggestions.map((s, i) => (
            <div
              key={s}
              onMouseDown={() => applySuggestion(s)}
              style={{
                padding: "7px 14px", fontSize: 12,
                color: i === sugIdx ? "#90c8ff" : "#7eb8f7",
                background: i === sugIdx ? "#0f1e30" : "transparent",
                cursor: "pointer",
                fontFamily: "'Fira Code', monospace",
                display: "flex", alignItems: "center", gap: 8,
              }}
              onMouseEnter={() => setSugIdx(i)}
            >
              <span style={{
                fontSize: 10, color: "#4a7fa5",
                background: "#0f1e30", borderRadius: 3,
                padding: "1px 5px", flexShrink: 0,
              }}>
                {columns.includes(s) ? "col" : "kw"}
              </span>
              {s}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ marginTop: 4, fontSize: 11, color: "#e05555" }}>
          ⚠ {error}
        </div>
      )}

      {/* Hint */}
      {!error && (
        <div style={{ marginTop: 4, fontSize: 10, color: "#2d4a6a" }}>
          Supports: = != &gt; &lt; &gt;= &lt;= LIKE IN AND OR NOT IS NULL · Tab to autocomplete
        </div>
      )}
    </div>
  );
}

// ── FilterPanel ───────────────────────────────────────────────────────────────
export default function FilterPanel({
  columns,
  data,
  query,
  onQueryChange,
  slicers,           // { [field]: Set<string> }
  onSlicerChange,    // (field, Set) => void
  onAddSlicer,       // (field) => void
  onRemoveSlicer,    // (field) => void
  activeFilterCount,
  hasDataset,
}) {
  const [open, setOpen] = useState(false);
  const [queryError, setQueryError] = useState("");
  const [addSlicerField, setAddSlicerField] = useState("");

  // Validate query live
  useEffect(() => {
    if (!query.trim() || !data?.length) { setQueryError(""); return; }
    const result = evaluateQuery(data, query);
    setQueryError(result === null ? "Invalid expression — check syntax" : "");
  }, [query, data]);

  // Unique values per slicer field
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
      margin: "0 0 0 0",
      border: "1px solid #1a2e45",
      borderRadius: 10,
      background: "#07111e",
      overflow: "visible",
    }}>
      {/* ── Toggle header ── */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          gap: 10, padding: "10px 16px",
          background: "none", border: "none", cursor: "pointer",
          borderRadius: open ? "10px 10px 0 0" : 10,
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
            background: "#2d6aad", color: "#fff",
            borderRadius: 10, fontSize: 10, fontWeight: 700,
            padding: "1px 7px", marginLeft: 2,
          }}>
            {activeFilterCount} active
          </span>
        )}

        <span style={{ marginLeft: "auto", color: "#4a7fa5", fontSize: 12 }}>
          {open ? "▲ Collapse" : "▼ Expand"}
        </span>
      </button>

      {/* ── Panel body ── */}
      {open && (
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Query box */}
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "#4a7fa5",
              textTransform: "uppercase", letterSpacing: "0.07em",
              marginBottom: 8, display: "flex", alignItems: "center", gap: 6,
            }}>
              <span>⌨</span> Query Filter
            </div>
            <QueryInput
              value={query}
              onChange={onQueryChange}
              columns={columns}
              error={queryError}
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
              <span>⧉ Slicers</span>
              {/* Add slicer dropdown */}
              {availableForSlicer.length > 0 && (
                <select
                  value=""
                  onChange={(e) => { if (e.target.value) { onAddSlicer(e.target.value); setAddSlicerField(""); } }}
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
                No slicers added. Use "+ Add slicer…" above to add one.
              </p>
            ) : (
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 12,
              }}>
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
                  Object.keys(slicers).forEach(f => onSlicerChange(f, new Set()));
                }}
                style={{
                  background: "none", border: "1px solid #3a2020",
                  borderRadius: 6, color: "#e05555", fontSize: 11,
                  padding: "5px 14px", cursor: "pointer",
                  fontWeight: 600,
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