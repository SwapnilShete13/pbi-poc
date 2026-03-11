// import React from "react";
// import { useDroppable } from "@dnd-kit/core";

// function DropZone({ id, label, icon, items, onRemove }) {
//   const { setNodeRef, isOver } = useDroppable({ id });

//   return (
//     <div
//       ref={setNodeRef}
//       className={`drop-zone ${isOver ? "over" : ""}`}
//       id={`dropzone-${id}`}
//     >
//       <div className="drop-zone-header">
//         <span className="drop-icon">{icon}</span>
//         <span className="drop-label">{label}</span>
//         {items.length > 0 && (
//           <span className="drop-count">{items.length}</span>
//         )}
//       </div>

//       <div className="dropped-fields">
//         {items.length === 0 && (
//           <p className="drop-hint">Drop fields here</p>
//         )}
//         {items.map((field) => (
//           <div key={field} className="dropped-chip">
//             <span>{field}</span>
//             <button
//               className="remove-btn"
//               onClick={() => onRemove(id, field)}
//               title="Remove"
//             >
//               ×
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function ReportCanvas({
//   vizType,
//   rowFields,
//   colFields,
//   valFields,
//   onRemoveField,
//   onRefresh,
//   loading,
//   hasDataset,
// }) {
//   const isMatrix = vizType === "matrix";
// console.log("vizType:", vizType);
//   return (
//     <div className="report-canvas">
//       <div className="canvas-header">
//         <div className="canvas-title-group">
//           <h3 className="panel-title" style={{ margin: 0 }}>
//             <span className="icon">🎨</span> Report Builder
//           </h3>
//           {hasDataset && (
//             <span className="live-badge">
//               <span className="live-dot" /> Live
//             </span>
//           )}
//         </div>
//         <button
//           id="refresh-btn"
//           className="refresh-btn"
//           onClick={onRefresh}
//           disabled={loading || !hasDataset}
//           title="Re-fetch data from server"
//         >
//           {loading ? (
//             <>
//               <span className="spinner-sm" /> Refreshing…
//             </>
//           ) : (
//             <>↺ Refresh Data</>
//           )}
//         </button>
//       </div>

//       <div className="drop-zones">
//         {isMatrix ? (
//           <>
//             <DropZone
//               id="rows"
//               label="Rows"
//               icon="≡"
//               items={rowFields}
//               onRemove={onRemoveField}
//             />
//             <DropZone
//               id="columns"
//               label="Columns"
//               icon="⊤"
//               items={colFields}
//               onRemove={onRemoveField}
//             />
//             <DropZone
//               id="values"
//               label="Values"
//               icon="∑"
//               items={valFields}
//               onRemove={onRemoveField}
//             />
//           </>
//         ) : (
//           <DropZone
//             id="columns"
//             label="Columns"
//             icon="⊤"
//             items={colFields}
//             onRemove={onRemoveField}
//           />
//         )}
//       </div>
//     </div>
//   );
// }
import React from "react";
import { useDroppable } from "@dnd-kit/core";

function DropZone({ id, label, icon, items, onRemove }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`drop-zone ${isOver ? "over" : ""}`} id={`dropzone-${id}`}>
      <div className="drop-zone-header">
        <span className="drop-icon">{icon}</span>
        <span className="drop-label">{label}</span>
        {items.length > 0 && <span className="drop-count">{items.length}</span>}
      </div>
      <div className="dropped-fields">
        {items.length === 0 && <p className="drop-hint">Drop fields here</p>}
        {items.map((field) => (
          <div key={field} className="dropped-chip">
            <span>{field}</span>
            <button className="remove-btn" onClick={() => onRemove(id, field)} title="Remove">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportCanvas({
  vizType, rowFields, colFields, valFields,
  onRemoveField, onRefresh, loading, hasDataset,
  showTotals, onToggleTotals, hasViewFields,
}) {
  const isMatrix = vizType === "matrix";

  return (
    <div className="report-canvas">
      <div className="canvas-header">
        <div className="canvas-title-group">
          <h3 className="panel-title" style={{ margin: 0 }}>
            <span className="icon">🎨</span> Report Builder
          </h3>
          {hasDataset && (
            <span className="live-badge">
              <span className="live-dot" /> Live
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* ── Totals toggle — only shown when there's data to total ── */}
          {hasViewFields && hasDataset && (
            <button
              onClick={onToggleTotals}
              title={showTotals ? "Hide totals row" : "Show totals row"}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: showTotals ? "#1a3a1a" : "#0f1e30",
                border: `1px solid ${showTotals ? "#2d8a2d" : "#1e3a5f"}`,
                borderRadius: 7, padding: "5px 12px",
                color: showTotals ? "#6dcc6d" : "#4a7fa5",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = showTotals ? "#4aaa4a" : "#2d6aad";
                e.currentTarget.style.color = showTotals ? "#90e890" : "#7eb8f7";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = showTotals ? "#2d8a2d" : "#1e3a5f";
                e.currentTarget.style.color = showTotals ? "#6dcc6d" : "#4a7fa5";
              }}
            >
              <span style={{ fontSize: 13 }}>∑</span>
              {showTotals ? "Totals On" : "Totals Off"}
              {/* Power BI–style pill indicator */}
              <span style={{
                width: 28, height: 14, borderRadius: 7,
                background: showTotals ? "#2d8a2d" : "#1a2e45",
                border: `1px solid ${showTotals ? "#4aaa4a" : "#2d4a6a"}`,
                position: "relative", display: "inline-block", flexShrink: 0,
                transition: "background 0.2s",
              }}>
                <span style={{
                  position: "absolute", top: 1,
                  left: showTotals ? 13 : 1,
                  width: 10, height: 10, borderRadius: "50%",
                  background: showTotals ? "#6dcc6d" : "#2d4a6a",
                  transition: "left 0.2s, background 0.2s",
                }} />
              </span>
            </button>
          )}

          <button
            id="refresh-btn"
            className="refresh-btn"
            onClick={onRefresh}
            disabled={loading || !hasDataset}
            title="Re-fetch data from server"
          >
            {loading ? <><span className="spinner-sm" /> Refreshing…</> : <>↺ Refresh Data</>}
          </button>
        </div>
      </div>

      <div className="drop-zones">
        {isMatrix ? (
          <>
            <DropZone id="rows"    label="Rows"    icon="≡" items={rowFields} onRemove={onRemoveField} />
            <DropZone id="columns" label="Columns" icon="⊤" items={colFields} onRemove={onRemoveField} />
            <DropZone id="values"  label="Values"  icon="∑" items={valFields} onRemove={onRemoveField} />
          </>
        ) : (
          <DropZone id="columns" label="Columns" icon="⊤" items={colFields} onRemove={onRemoveField} />
        )}
      </div>
    </div>
  );
}