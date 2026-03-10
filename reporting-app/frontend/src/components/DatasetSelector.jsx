import React from "react";

export default function DatasetSelector({
  categories,
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
}) {
  const subcategories = selectedCategory
    ? Object.keys(categories[selectedCategory] || {})
    : [];

  return (
    <div className="dataset-selector">
      <h3 className="panel-title">
        <span className="icon">📊</span> Dataset
      </h3>

      <div className="field-group">
        <label className="field-label">Category</label>
        <select
          id="category-select"
          className="styled-select"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">— Select Category —</option>
          {Object.keys(categories).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="field-group">
        <label className="field-label">Subcategory</label>
        <select
          id="subcategory-select"
          className="styled-select"
          value={selectedSubcategory}
          onChange={(e) => onSubcategoryChange(e.target.value)}
          disabled={!selectedCategory}
        >
          <option value="">— Select Subcategory —</option>
          {subcategories.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
