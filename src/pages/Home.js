import React, { useEffect } from "react";

export default function Home({ openInquiry }) {
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const el1 = document.querySelector(".hero-img1");
      const el2 = document.querySelector(".hero-img2");
      const el3 = document.querySelector(".hero-img3");
      const text1 = document.querySelector(".hero-text1");
      const text2 = document.querySelector(".hero-text2");
      const text3 = document.querySelector(".hero-text3");

      if (el1 && text1) {
        el1.style.transform = `translateX(${y * -0.05}px)`; // reversed
        text1.style.transform = `translateX(${y * 0.05}px)`;
      }
      if (el2 && text2) {
        el2.style.transform = `translateX(${y * 0.05}px)`; // reversed
        text2.style.transform = `translateX(${y * -0.05}px)`;
      }
      if (el3 && text3) {
        el3.style.transform = `translateX(${y * -0.03}px)`; // reversed subtle
        text3.style.opacity = Math.min(1, y / 700);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="home">
      <section className="hero">
        <h1 className="hero-title">Ravi Sharma Photo & Films</h1>
        <p className="hero-sub">Cinematic Wedding Films & Timeless Photography</p>
        <button className="btn-primary" onClick={openInquiry}>
          Book an Inquiry
        </button>
      </section>

      {/* First Image Section */}
      <section className="hero-section">
        <img src="/assets/hero1.jpg" alt="Wedding Film" className="hero-img1" />
        <div className="hero-text hero-text1">
          <h2>Wedding Filmmakers</h2>
          <p>We craft visual stories that live forever — cinematic, emotional, timeless.</p>
        </div>
      </section>

      {/* Second Image Section */}
      <section className="hero-section">
        <img src="/assets/hero2.jpg" alt="Candid Photography" className="hero-img2" />
        <div className="hero-text hero-text2">
          <h2>Candid Photography</h2>
          <p>Unposed, natural, full of emotion — our frames breathe authenticity.</p>
        </div>
      </section>

      {/* Third Image Section */}
      <section className="hero-section">
        <img src="/assets/hero3.jpg" alt="Why Choose Us" className="hero-img3" />
        <div className="hero-text hero-text3">
          <h2>Why Choose Us?</h2>
          <p>Because we don’t just capture weddings — we capture legacies.</p>
        </div>
      </section>
    </main>
  );
}
