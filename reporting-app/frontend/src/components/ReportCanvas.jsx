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
//   rowFields,
//   colFields,
//   valFields,
//   onRemoveField,
//   onRefresh,
//   loading,
//   hasDataset,
// }) {
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
//         <DropZone
//           id="rows"
//           label="Rows"
//           icon="≡"
//           items={rowFields}
//           onRemove={onRemoveField}
//         />
//         <DropZone
//           id="columns"
//           label="Columns"
//           icon="⊤"
//           items={colFields}
//           onRemove={onRemoveField}
//         />
//         <DropZone
//           id="values"
//           label="Values"
//           icon="∑"
//           items={valFields}
//           onRemove={onRemoveField}
//         />
//       </div>
//     </div>
//   );
// }
import React from "react";
import { useDroppable } from "@dnd-kit/core";

function DropZone({ id, label, icon, items, onRemove }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`drop-zone ${isOver ? "over" : ""}`}
      id={`dropzone-${id}`}
    >
      <div className="drop-zone-header">
        <span className="drop-icon">{icon}</span>
        <span className="drop-label">{label}</span>
        {items.length > 0 && (
          <span className="drop-count">{items.length}</span>
        )}
      </div>

      <div className="dropped-fields">
        {items.length === 0 && (
          <p className="drop-hint">Drop fields here</p>
        )}
        {items.map((field) => (
          <div key={field} className="dropped-chip">
            <span>{field}</span>
            <button
              className="remove-btn"
              onClick={() => onRemove(id, field)}
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportCanvas({
  vizType,
  rowFields,
  colFields,
  valFields,
  onRemoveField,
  onRefresh,
  loading,
  hasDataset,
}) {
  const isMatrix = vizType === "matrix";
console.log("vizType:", vizType);
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
        <button
          id="refresh-btn"
          className="refresh-btn"
          onClick={onRefresh}
          disabled={loading || !hasDataset}
          title="Re-fetch data from server"
        >
          {loading ? (
            <>
              <span className="spinner-sm" /> Refreshing…
            </>
          ) : (
            <>↺ Refresh Data</>
          )}
        </button>
      </div>

      <div className="drop-zones">
        {isMatrix ? (
          <>
            <DropZone
              id="rows"
              label="Rows"
              icon="≡"
              items={rowFields}
              onRemove={onRemoveField}
            />
            <DropZone
              id="columns"
              label="Columns"
              icon="⊤"
              items={colFields}
              onRemove={onRemoveField}
            />
            <DropZone
              id="values"
              label="Values"
              icon="∑"
              items={valFields}
              onRemove={onRemoveField}
            />
          </>
        ) : (
          <DropZone
            id="columns"
            label="Columns"
            icon="⊤"
            items={colFields}
            onRemove={onRemoveField}
          />
        )}
      </div>
    </div>
  );
}