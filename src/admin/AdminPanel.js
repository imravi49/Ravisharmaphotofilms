import React, { useState } from "react";
import "../styles.css";

export default function AdminPanel({ adminData, setAdminData }) {
  const [slides, setSlides] = useState(adminData.heroSlides || []);
  const [newCategory, setNewCategory] = useState("");

  const handleSlideChange = (i, field, value) => {
    const updated = [...slides];
    updated[i][field] = value;
    setSlides(updated);
    setAdminData({ ...adminData, heroSlides: updated });
  };

  const handleCategoryAdd = () => {
    if (!newCategory) return;
    const updated = [...(adminData.portfolioSections || []), newCategory];
    setAdminData({ ...adminData, portfolioSections: updated });
    setNewCategory("");
  };

  return (
    <div className="admin-panel-shell">
      <h2>Admin Panel</h2>

      <section className="admin-section">
        <h3>Hero Slides (3)</h3>
        {slides.map((s, i) => (
          <div key={i} className="admin-hero-item">
            <input
              type="text"
              value={s.text}
              onChange={(e) => handleSlideChange(i, "text", e.target.value)}
              placeholder="Slide Text"
            />
            <input
              type="text"
              value={s.src}
              onChange={(e) => handleSlideChange(i, "src", e.target.value)}
              placeholder="Image URL (/assets/photo_1.jpg)"
            />
          </div>
        ))}
      </section>

      <section className="admin-section">
        <h3>Portfolio Categories</h3>
        <div className="category-list">
          {(adminData.portfolioSections || []).map((c, i) => (
            <span key={i} className="category-pill">
              {c}
            </span>
          ))}
        </div>
        <input
          type="text"
          value={newCategory}
          placeholder="New Category Name"
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button onClick={handleCategoryAdd}>Add Category</button>
      </section>
    </div>
  );
}
