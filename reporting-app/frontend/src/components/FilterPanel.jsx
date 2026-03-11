import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";

// ── Cross-filtering ───────────────────────────────────────────────────────────
function getCrossFilteredValues(field, data, slicers) {
  if (!data?.length) return [];
  let filtered = data;
  for (const [f, selected] of Object.entries(slicers)) {
    if (f === field) continue;
    if (selected.size === 0) continue;
    if (selected.has("__NONE__")) return [];
    filtered = filtered.filter(row => selected.has(String(row[f] ?? "")));
  }
  return [...new Set(filtered.map(row => String(row[field] ?? "")))].sort();
}

// ── Slicer ────────────────────────────────────────────────────────────────────
function Slicer({ field, availableValues, selected, onChange, onRemove }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const noneExplicit = selected.size === 0;
  const noneSelected = selected.has("__NONE__");
  const allChecked = !noneSelected && (noneExplicit || availableValues.every(v => selected.has(v)));
  const someChecked = !allChecked && !noneSelected && availableValues.some(v => selected.has(v));

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isValueChecked = (v) => {
    if (noneSelected) return false;
    if (noneExplicit) return true;
    return selected.has(v);
  };

  const toggleVal = (v) => {
    let next;
    if (noneExplicit) {
      next = new Set(availableValues);
      next.delete(v);
    } else if (noneSelected) {
      next = new Set([v]);
    } else {
      next = new Set(selected);
      if (next.has(v)) next.delete(v);
      else next.add(v);
    }
    if (availableValues.length > 0 && availableValues.every(v2 => next.has(v2))) {
      next = new Set();
    }
    onChange(next);
  };

  const toggleAll = () => {
    if (allChecked) {
      onChange(new Set(["__NONE__"]));
    } else {
      onChange(new Set());
    }
  };

  const selectedCount = noneSelected ? 0
    : noneExplicit ? availableValues.length
    : availableValues.filter(v => selected.has(v)).length;

  const label = noneSelected
    ? "None selected"
    : allChecked
    ? `All (${availableValues.length})`
    : selectedCount === 1
    ? (availableValues.find(v => isValueChecked(v)) ?? "1 selected")
    : `${selectedCount} of ${availableValues.length}`;

  const borderColor = noneSelected ? "#8a2d2d" : allChecked ? "#1e3a5f" : "#2d6aad";
  const labelColor = noneSelected ? "#ff8080" : allChecked ? "#4a7fa5" : "#90c8ff";

  return (
    <div ref={ref} style={{ position: "relative" }}>
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

      <button onClick={() => setOpen(v => !v)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#0f1e30", border: `1px solid ${borderColor}`,
        borderRadius: 6, padding: "6px 10px",
        color: labelColor, fontSize: 12, cursor: "pointer",
        fontWeight: allChecked ? 400 : 600,
      }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        <span style={{ marginLeft: 6, fontSize: 10, flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 1000,
          background: "#0a1929", border: "1px solid #1e3a5f", borderRadius: 8,
          boxShadow: "0 8px 28px rgba(0,0,0,0.6)",
          minWidth: "100%", maxHeight: 240, overflowY: "auto", padding: "4px 0",
        }}>
          <label
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "7px 12px",
              cursor: "pointer", borderBottom: "1px solid #1a2e45",
              fontSize: 12, color: "#7eb8f7", fontWeight: 700, background: "transparent",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#0f1e30"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <input
              type="checkbox"
              checked={allChecked}
              ref={el => { if (el) el.indeterminate = someChecked; }}
              onChange={toggleAll}
              style={{ accentColor: "#2d6aad", width: 14, height: 14, cursor: "pointer" }}
            />
            {allChecked ? "Deselect All" : "Select All"}
          </label>

          {availableValues.length === 0 ? (
            <div style={{ padding: "8px 12px", fontSize: 11, color: "#2d4a6a", fontStyle: "italic" }}>
              No values match other filters
            </div>
          ) : (
            availableValues.map((v) => {
              const checked = isValueChecked(v);
              return (
                <label key={v} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "6px 12px", cursor: "pointer", fontSize: 12,
                  color: checked ? "#c8e0ff" : "#5a7a9a", background: "transparent",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#0f1e30"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <input type="checkbox" checked={checked} onChange={() => toggleVal(v)}
                    style={{ accentColor: "#2d6aad", width: 14, height: 14, cursor: "pointer" }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ── SQL autocomplete textarea ─────────────────────────────────────────────────
function SqlTextarea({ value, onChange, columns, tableName, placeholder }) {
  const [suggestions, setSuggestions] = useState([]);
  const [sugIdx, setSugIdx] = useState(-1);
  const ref = useRef(null);

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

  const getLastToken = (val, pos) => (val.slice(0, pos).match(/[\w.]+$/) || [""])[0];

  const updateSuggestions = useCallback((val, pos) => {
    const token = getLastToken(val, pos ?? val.length);
    if (!token) { setSuggestions([]); return; }
    const upper = token.toUpperCase();
    const cols = columns.filter(c => c.toUpperCase().startsWith(upper) && c.toUpperCase() !== upper);
    const kws = SQL_KEYWORDS.filter(k => k.startsWith(upper) && k !== upper);
    const tbl = tableName && tableName.toUpperCase().startsWith(upper) && tableName.toUpperCase() !== upper ? [tableName] : [];
    setSuggestions([...cols, ...tbl, ...kws].slice(0, 12));
    setSugIdx(-1);
  }, [columns, tableName]);

  const apply = (sug) => {
    const pos = ref.current?.selectionStart ?? value.length;
    const token = getLastToken(value, pos);
    const next = value.slice(0, pos - token.length) + sug + value.slice(pos);
    onChange(next);
    setSuggestions([]);
    setTimeout(() => {
      const np = pos - token.length + sug.length;
      ref.current?.setSelectionRange(np, np);
      ref.current?.focus();
    }, 0);
  };

  return (
    <div style={{ position: "relative" }}>
      <textarea
        ref={ref} value={value} rows={3}
        onChange={e => { onChange(e.target.value); updateSuggestions(e.target.value, e.target.selectionStart); }}
        onClick={e => updateSuggestions(e.target.value, e.target.selectionStart)}
        onKeyDown={e => {
          if (suggestions.length) {
            if (e.key === "ArrowDown") { e.preventDefault(); setSugIdx(i => Math.min(i + 1, suggestions.length - 1)); return; }
            if (e.key === "ArrowUp") { e.preventDefault(); setSugIdx(i => Math.max(i - 1, 0)); return; }
            if (e.key === "Tab") { e.preventDefault(); apply(suggestions[Math.max(sugIdx, 0)]); return; }
            if (e.key === "Escape") { setSuggestions([]); return; }
            if (e.key === "Enter" && sugIdx >= 0) { e.preventDefault(); apply(suggestions[sugIdx]); return; }
          }
        }}
        onBlur={() => setTimeout(() => setSuggestions([]), 200)}
        placeholder={placeholder}
        spellCheck={false}
        style={{
          width: "100%", background: "#060f1a",
          border: value.trim() ? "1px solid #2d6aad" : "1px solid #1a2e45",
          borderRadius: 8, color: "#c8e0ff", fontSize: 12,
          fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
          padding: "9px 12px", outline: "none", resize: "vertical",
          lineHeight: 1.7, boxSizing: "border-box", minHeight: 72,
        }}
      />
      {suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 2px)", left: 0, zIndex: 1002,
          background: "#080f1a", border: "1px solid #1e3a5f", borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.7)", overflow: "hidden", minWidth: 220,
        }}>
          {suggestions.map((s, i) => {
            const isCol = columns.includes(s), isTable = s === tableName;
            const tag = isCol ? "col" : isTable ? "tbl" : "sql";
            const tagColor = isCol ? "#2d6aad" : isTable ? "#2d8a4a" : "#6a4a8a";
            return (
              <div key={s} onMouseDown={() => apply(s)} onMouseEnter={() => setSugIdx(i)}
                style={{
                  padding: "7px 12px", fontSize: 12, cursor: "pointer", fontFamily: "'Fira Code', monospace",
                  color: i === sugIdx ? "#90c8ff" : "#7eb8f7", background: i === sugIdx ? "#0f1e30" : "transparent",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                <span style={{ fontSize: 9, background: tagColor, color: "#fff", borderRadius: 3, padding: "1px 5px", flexShrink: 0, fontWeight: 700, textTransform: "uppercase" }}>{tag}</span>
                {s}
              </div>
            );
          })}
          <div style={{ padding: "4px 12px", fontSize: 10, color: "#2d4a6a", borderTop: "1px solid #1a2e45" }}>
            Tab · ↑↓ · Enter to complete
          </div>
        </div>
      )}
    </div>
  );
}

// ── Create / Edit Rule form ───────────────────────────────────────────────────
function CreateRuleForm({ columns, tableName, onSave, initialName = "", initialSql = "", submitLabel = "+ Save Rule" }) {
  const [name, setName] = useState(initialName);
  const [sql, setSql] = useState(initialSql);
  const [error, setError] = useState("");

  const handleSave = () => {
    const trimName = name.trim();
    const trimSql = sql.trim();
    if (!trimName) { setError("Rule name is required."); return; }
    if (!trimSql) { setError("SQL query is required."); return; }
    setError("");
    onSave({ name: trimName, sql: trimSql });
    setName("");
    setSql("");
  };

  return (
    <div style={{
      background: "#060f1a", border: "1px solid #1e3a5f",
      borderRadius: 10, padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: 10,
    }}>
      <div>
        <label style={{ fontSize: 10, fontWeight: 700, color: "#4a7fa5", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>
          Rule Name
        </label>
        <input
          value={name}
          onChange={e => { setName(e.target.value); setError(""); }}
          placeholder='e.g. "Electronics Only" or "2024 Contracts"'
          style={{
            width: "100%", background: "#0a1929",
            border: name.trim() ? "1px solid #2d6aad" : "1px solid #1a2e45",
            borderRadius: 7, color: "#c8e0ff", fontSize: 12,
            padding: "8px 12px", outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      <div>
        <label style={{ fontSize: 10, fontWeight: 700, color: "#4a7fa5", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 5 }}>
          SQL Query
          <span style={{ fontSize: 9, color: "#2d4a6a", fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 6 }}>
            — full SELECT, runs on SQL Server · Tab to autocomplete
          </span>
        </label>
        <SqlTextarea
          value={sql} onChange={setSql}
          columns={columns} tableName={tableName}
          placeholder={tableName
            ? `SELECT *\nFROM ${tableName}\nWHERE vendor_category = 'Electronics'`
            : "SELECT * FROM your_table WHERE ..."}
        />
      </div>

      {error && <span style={{ fontSize: 11, color: "#c0392b" }}>⚠ {error}</span>}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSave}
          disabled={!name.trim() || !sql.trim()}
          style={{
            background: name.trim() && sql.trim() ? "#1a4a8a" : "#0f1e30",
            border: `1px solid ${name.trim() && sql.trim() ? "#2d6aad" : "#1a2e45"}`,
            borderRadius: 8, color: name.trim() && sql.trim() ? "#90c8ff" : "#2d4a6a",
            fontSize: 12, fontWeight: 700, padding: "8px 18px",
            cursor: name.trim() && sql.trim() ? "pointer" : "default",
          }}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
function DeleteConfirmModal({ ruleName, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "#07111e", border: "1px solid #3a2020", borderRadius: 12,
        padding: "24px 28px", maxWidth: 360, width: "90%",
        boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#e05555", marginBottom: 10 }}>
          Delete Rule?
        </div>
        <div style={{ fontSize: 13, color: "#7eb8f7", marginBottom: 22, lineHeight: 1.6 }}>
          Are you sure you want to delete <strong style={{ color: "#c8e0ff" }}>{ruleName}</strong>? This cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              background: "#0f1e30", border: "1px solid #1e3a5f", borderRadius: 7,
              color: "#4a7fa5", fontSize: 12, fontWeight: 600, padding: "8px 18px", cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: "#3a1010", border: "1px solid #8a2d2d", borderRadius: 7,
              color: "#ff8080", fontSize: 12, fontWeight: 700, padding: "8px 18px", cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Apply Rule dropdown (with inline edit + delete confirmation) ───────────────
function RulePicker({ rules, activeRuleId, onApply, onClear, onDelete, onEdit, loading }) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, name }
  const [editingId, setEditingId] = useState(null);
  const ref = useRef(null);
  const active = rules.find(r => r.id === activeRuleId);

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        if (!confirmDelete) setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [confirmDelete]);

  const handleDeleteClick = (e, rule) => {
    e.stopPropagation();
    setConfirmDelete({ id: rule.id, name: rule.name });
  };

  const handleEditClick = (e, rule) => {
    e.stopPropagation();
    setEditingId(rule.id);
  };

  const handleEditSave = (id, { name, sql }) => {
    onEdit(id, { name, sql });
    setEditingId(null);
  };

  return (
    <>
      {confirmDelete && (
        <DeleteConfirmModal
          ruleName={confirmDelete.name}
          onConfirm={() => {
            onDelete(confirmDelete.id);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div ref={ref} style={{ position: "relative", minWidth: 220 }}>
        <button onClick={() => setOpen(v => !v)} style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#0f1e30",
          border: `1px solid ${active ? "#2d6aad" : "#1e3a5f"}`,
          borderRadius: 7, padding: "8px 12px",
          color: active ? "#90c8ff" : "#4a7fa5",
          fontSize: 12, cursor: "pointer", fontWeight: active ? 600 : 400,
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7, overflow: "hidden" }}>
            {loading && (
              <span style={{
                width: 10, height: 10, border: "2px solid #2d6aad",
                borderTopColor: "transparent", borderRadius: "50%",
                display: "inline-block", animation: "spin 0.7s linear infinite", flexShrink: 0,
              }} />
            )}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {active ? `▶ ${active.name}` : "— Select a rule —"}
            </span>
          </span>
          <span style={{ marginLeft: 8, fontSize: 10, flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
        </button>

        {open && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 1000,
            background: "#0a1929", border: "1px solid #1e3a5f", borderRadius: 8,
            boxShadow: "0 8px 28px rgba(0,0,0,0.6)",
            minWidth: "100%", maxHeight: 400, overflowY: "auto", padding: "4px 0",
          }}>
            {/* No filter option */}
            <div
              onMouseDown={() => { onClear(); setOpen(false); }}
              style={{
                padding: "8px 12px", fontSize: 12, cursor: "pointer",
                color: !active ? "#7eb8f7" : "#4a7fa5",
                background: !active ? "#0f1e30" : "transparent",
                borderBottom: "1px solid #1a2e45",
                fontStyle: "italic",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#0f1e30"}
              onMouseLeave={e => e.currentTarget.style.background = !active ? "#0f1e30" : "transparent"}
            >
              ✕ No filter (show all)
            </div>

            {rules.length === 0 ? (
              <div style={{ padding: "10px 12px", fontSize: 12, color: "#2d4a6a", fontStyle: "italic" }}>
                No rules created yet. Use "+ Create Rule" above.
              </div>
            ) : (
              rules.map(rule => (
                <div key={rule.id}>
                  {/* Rule row */}
                  <div
                    style={{
                      padding: "8px 12px", fontSize: 12,
                      color: rule.id === activeRuleId ? "#90c8ff" : "#c8e0ff",
                      background: rule.id === activeRuleId ? "#0f1e30" : "transparent",
                      display: "flex", alignItems: "center", gap: 8,
                      borderBottom: editingId === rule.id ? "none" : "1px solid #0d1f30",
                    }}
                    onMouseEnter={e => { if (editingId !== rule.id) e.currentTarget.style.background = "#0f1e30"; }}
                    onMouseLeave={e => { if (editingId !== rule.id) e.currentTarget.style.background = rule.id === activeRuleId ? "#0f1e30" : "transparent"; }}
                  >
                    {/* Apply / name area */}
                    <div
                      onMouseDown={() => { rule.id === activeRuleId ? onClear() : onApply(rule); setOpen(false); }}
                      style={{ flex: 1, overflow: "hidden", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 8 }}
                    >
                      <span style={{ color: rule.id === activeRuleId ? "#2d6aad" : "#2d4a6a", fontSize: 13, marginTop: 1, flexShrink: 0 }}>▶</span>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{rule.name}</div>
                        <div style={{ fontSize: 10, color: "#2d4a6a", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'Fira Code', monospace" }}>
                          {rule.sql.replace(/\s+/g, " ").slice(0, 55)}{rule.sql.length > 55 ? "…" : ""}
                        </div>
                      </div>
                    </div>

                    {/* Edit button */}
                    <button
                      onMouseDown={e => handleEditClick(e, rule)}
                      title="Edit rule"
                      style={{
                        background: "none", border: "1px solid #1e3a5f", borderRadius: 5,
                        color: "#4a7fa5", cursor: "pointer", fontSize: 11,
                        padding: "2px 8px", flexShrink: 0, lineHeight: 1.5,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#2d6aad"; e.currentTarget.style.color = "#90c8ff"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e3a5f"; e.currentTarget.style.color = "#4a7fa5"; }}
                    >
                      ✎ Edit
                    </button>

                    {/* Delete button */}
                    <button
                      onMouseDown={e => handleDeleteClick(e, rule)}
                      title="Delete rule"
                      style={{
                        background: "none", border: "1px solid #3a2020", borderRadius: 5,
                        color: "#c05050", cursor: "pointer", fontSize: 11,
                        padding: "2px 8px", flexShrink: 0, lineHeight: 1.5,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#8a2d2d"; e.currentTarget.style.color = "#ff8080"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#3a2020"; e.currentTarget.style.color = "#c05050"; }}
                    >
                      ✕ Delete
                    </button>
                  </div>

                  {/* Inline Edit Form */}
                  {editingId === rule.id && (
                    <div style={{ padding: "0 12px 10px", borderBottom: "1px solid #1a2e45" }}>
                      <CreateRuleForm
                        columns={[]}
                        tableName=""
                        initialName={rule.name}
                        initialSql={rule.sql}
                        submitLabel="✓ Save Changes"
                        onSave={(updated) => handleEditSave(rule.id, updated)}
                      />
                      <button
                        onClick={() => setEditingId(null)}
                        style={{
                          marginTop: 6, background: "none", border: "none",
                          color: "#4a7fa5", fontSize: 11, cursor: "pointer", padding: 0,
                        }}
                      >
                        ✕ Cancel edit
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ── FilterPanel ───────────────────────────────────────────────────────────────
const RULES_STORAGE_KEY = "powerreport_rules";

export default function FilterPanel({
  columns, tableName, data, query, onQueryChange, onRunQuery,
  slicers, onSlicerChange, onAddSlicer, onRemoveSlicer,
  activeFilterCount, hasDataset, hasViewFields, queryLoading, queryError,
}) {
  const [open, setOpen] = useState(false);

  // ── Rules — persisted to localStorage so they survive page refresh ────────
  // Lazy initializer reads from storage once on mount.
  // useEffect keeps storage in sync on every change.
  // When you add role-based auth: replace the lazy init with a useEffect API fetch,
  // and replace the sync useEffect with API calls inside each handler.
  const [rules, setRules] = useState(() => {
    try {
      const saved = localStorage.getItem(RULES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeRuleId, setActiveRuleId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Sync to localStorage whenever rules change
  useEffect(() => {
    try {
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
    } catch {
      // Storage unavailable or full — silently ignore
    }
  }, [rules]);

  // Cross-filtered values for slicers
  const crossFilteredValues = useMemo(() => {
    const out = {};
    for (const field of Object.keys(slicers)) {
      out[field] = getCrossFilteredValues(field, data, slicers);
    }
    return out;
  }, [slicers, data]);

  const availableForSlicer = columns.filter(c => !slicers.hasOwnProperty(c));

  const handleSaveRule = useCallback(({ name, sql }) => {
    const id = `rule_${Date.now()}`;
    setRules(prev => [...prev, { id, name, sql }]);
    setShowCreateForm(false);
  }, []);

  const handleApplyRule = useCallback((rule) => {
    setActiveRuleId(rule.id);
    onQueryChange(rule.sql);
    onRunQuery(rule.sql);
  }, [onQueryChange, onRunQuery]);

  const handleClearRule = useCallback(() => {
    setActiveRuleId(null);
    onQueryChange("");
    onRunQuery("");
  }, [onQueryChange, onRunQuery]);

  const handleDeleteRule = useCallback((id) => {
    setRules(prev => prev.filter(r => r.id !== id));
    if (activeRuleId === id) handleClearRule();
  }, [activeRuleId, handleClearRule]);

  const handleEditRule = useCallback((id, { name, sql }) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, name, sql } : r));
    // If this rule is currently active, re-run with the updated SQL
    if (activeRuleId === id) {
      onQueryChange(sql);
      onRunQuery(sql);
    }
  }, [activeRuleId, onQueryChange, onRunQuery]);

  if (!hasDataset) return null;

  return (
    <div style={{ border: "1px solid #1a2e45", borderRadius: 10, background: "#07111e", overflow: "visible" }}>
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
        <span style={{ fontSize: 12, fontWeight: 700, color: "#7eb8f7", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Filters & Slicers
        </span>
        {activeFilterCount > 0 && (
          <span style={{ background: "#2d6aad", color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 7px" }}>
            {activeFilterCount} active
          </span>
        )}
        <span style={{ marginLeft: "auto", color: "#4a7fa5", fontSize: 12 }}>
          {open ? "▲ Collapse" : "▼ Expand"}
        </span>
      </button>

      {open && (
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* ── Query Rules ─────────────────────────────────────────────── */}
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "#4a7fa5", textTransform: "uppercase",
              letterSpacing: "0.07em", marginBottom: 10,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span>
                ⌨ Query Rules
                <span style={{ fontSize: 9, color: "#2d4a6a", fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 6 }}>
                  — save named SQL queries · apply, edit or delete from the dropdown
                </span>
              </span>
              <button
                onClick={() => setShowCreateForm(v => !v)}
                style={{
                  background: showCreateForm ? "#0f1e30" : "#1a4a8a",
                  border: `1px solid ${showCreateForm ? "#1e3a5f" : "#2d6aad"}`,
                  borderRadius: 6, color: showCreateForm ? "#4a7fa5" : "#90c8ff",
                  fontSize: 11, fontWeight: 700, padding: "4px 12px", cursor: "pointer",
                }}
              >
                {showCreateForm ? "✕ Cancel" : "+ Create Rule"}
              </button>
            </div>

            {/* Create Rule form */}
            {showCreateForm && (
              <div style={{ marginBottom: 12 }}>
                <CreateRuleForm
                  columns={columns}
                  tableName={tableName}
                  onSave={handleSaveRule}
                />
              </div>
            )}

            {/* Rule picker — dropdown with apply / edit / delete */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ flex: "1 1 260px", maxWidth: 500 }}>
                <RulePicker
                  rules={rules}
                  activeRuleId={activeRuleId}
                  onApply={handleApplyRule}
                  onClear={handleClearRule}
                  onDelete={handleDeleteRule}
                  onEdit={handleEditRule}
                  loading={queryLoading}
                />
                {queryError && (
                  <div style={{ marginTop: 6, fontSize: 11, color: "#c0392b" }}>⚠ {queryError}</div>
                )}
              </div>
            </div>
          </div>

          {/* ── Slicers — only available once columns are in the view ────── */}
          <div>
            <div style={{
              fontSize: 10, fontWeight: 700, color: "#4a7fa5", textTransform: "uppercase",
              letterSpacing: "0.07em", marginBottom: 10,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span>⧉ Slicers
                <span style={{ fontSize: 9, color: "#2d4a6a", fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 6 }}>
                  — cross-filtered · values stay in sync
                </span>
              </span>
              {hasViewFields && availableForSlicer.length > 0 && (
                <select value="" onChange={(e) => { if (e.target.value) onAddSlicer(e.target.value); }}
                  style={{ background: "#0f1e30", border: "1px solid #1e3a5f", borderRadius: 5, color: "#7eb8f7", fontSize: 11, padding: "3px 8px", cursor: "pointer" }}
                >
                  <option value="">+ Add slicer…</option>
                  {availableForSlicer.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>

            {!hasViewFields ? (
              <p style={{ fontSize: 12, color: "#2d4a6a", margin: 0, fontStyle: "italic" }}>
                Drop columns into the view first to enable slicers.
              </p>
            ) : Object.keys(slicers).length === 0 ? (
              <p style={{ fontSize: 12, color: "#2d4a6a", margin: 0 }}>No slicers added. Use "+ Add slicer…" to add one.</p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {Object.keys(slicers).map(field => (
                  <div key={field} style={{ background: "#0a1929", border: "1px solid #1a2e45", borderRadius: 8, padding: "10px 12px", minWidth: 160, flex: "1 1 160px", maxWidth: 260 }}>
                    <Slicer
                      field={field}
                      availableValues={crossFilteredValues[field] ?? []}
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
                  handleClearRule();
                  Object.keys(slicers).forEach(f => onSlicerChange(f, new Set()));
                }}
                style={{ background: "none", border: "1px solid #3a2020", borderRadius: 6, color: "#e05555", fontSize: 11, padding: "5px 14px", cursor: "pointer", fontWeight: 600 }}
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