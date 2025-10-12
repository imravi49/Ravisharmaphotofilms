import React from "react";
import { motion } from "framer-motion";
import "../styles.css";

export default function Portfolio({ adminData }) {
  const photos = adminData.images || [];

  return (
    <div className="portfolio-page">
      <h2 className="section-title">Our Portfolio</h2>
      <div className="portfolio-grid">
        {photos.map((p, i) => (
          <motion.div
            key={i}
            className="portfolio-item"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            <img src={p.src} alt={p.category || "Portfolio"} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
