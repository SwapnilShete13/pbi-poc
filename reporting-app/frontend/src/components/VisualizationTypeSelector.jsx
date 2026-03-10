import React from "react";

const VIZ_TYPES = [
  { id: "table", label: "Table", icon: "▦" },
  { id: "matrix", label: "Matrix", icon: "⊞" },
];


export default function VisualizationTypeSelector({ vizType, onChange }) {
  return (
    <div className="viz-selector">
      <h3 className="panel-title">
        <span className="icon">📈</span> Visualization
      </h3>
      <div className="viz-buttons">
        {VIZ_TYPES.map((v) => (
          <button
            key={v.id}
            id={`viz-${v.id}`}
            className={`viz-btn ${vizType === v.id ? "active" : ""}`}
            onClick={() => onChange(v.id)}
          >
            <span className="viz-icon">{v.icon}</span>
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
