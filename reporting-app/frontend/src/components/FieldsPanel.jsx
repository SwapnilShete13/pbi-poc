import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function DraggableField({ id }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="field-chip"
      id={`field-${id}`}
      title={`Drag "${id}" to a drop zone`}
    >
      <span className="field-icon">⠿</span>
      {id}
    </div>
  );
}

export default function FieldsPanel({ columns, loading }) {
  return (
    <div className="fields-panel">
      <h3 className="panel-title">
        <span className="icon">🗂️</span> Fields
      </h3>

      {loading && (
        <div className="loading-fields">
          <div className="spinner" />
          <span>Loading fields…</span>
        </div>
      )}

      {!loading && columns.length === 0 && (
        <p className="empty-hint">Select a dataset to see available fields.</p>
      )}

      <div className="fields-list">
        {columns.map((col) => (
          <DraggableField key={col} id={col} />
        ))}
      </div>
    </div>
  );
}
