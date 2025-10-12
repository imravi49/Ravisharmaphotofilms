import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import "../../styles.css";

export default function Home({ adminData }) {
  const defaultSlides = [
    { src: "/assets/photo_1.jpg", text: "Cinematic Wedding Stories" },
    { src: "/assets/photo_2.jpg", text: "Unscripted Candid Emotions" },
    { src: "/assets/photo_3.jpg", text: "Memories in Golden Frames" },
  ];
  const slides = adminData.heroSlides || defaultSlides;

  const { scrollY } = useScroll();

  return (
    <div className="home-container">
      {slides.map((slide, index) => {
        const y = useTransform(scrollY, [0, 500], [0, index * 100]);
        const textY = useTransform(scrollY, [0, 300], [50, 0]);
        const opacity = useTransform(scrollY, [0, 200], [0, 1]);
        return (
          <section key={index} className="parallax-section">
            <motion.img
              src={slide.src}
              alt={`Hero ${index}`}
              className="parallax-image"
              style={{ y }}
            />
            <motion.div
              className="parallax-text"
              style={{ y: textY, opacity }}
            >
              <h2>{slide.text}</h2>
            </motion.div>
          </section>
        );
      })}

      {/* Our Services Section */}
      <section className="services-section">
        <h2 className="section-title">Our Services</h2>
        <div className="services-grid">
          {[
            {
              title: "Photography",
              desc: "Capturing timeless emotions and real stories in golden light.",
            },
            {
              title: "Videography",
              desc: "Crafting cinematic wedding films that move hearts.",
            },
            {
              title: "Photobooks & Albums",
              desc: "Beautifully curated albums that tell your story forever.",
            },
            {
              title: "Post Production",
              desc: "Editing that enhances emotions with our signature look.",
            },
          ].map((service, i) => (
            <motion.div
              key={i}
              className="service-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
            >
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
