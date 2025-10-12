import React, { useEffect } from "react";

export default function Home({ openInquiry }) {
  useEffect(() => {
    const handleScroll = () => {
      const sc = window.scrollY;
      const el1 = document.querySelector(".parallax-right");
      const el2 = document.querySelector(".parallax-left");
      const el3 = document.querySelector(".parallax-center");

      if (el1)
        el1.style.transform = `translateX(${Math.max(0, sc * 0.05)}px)`;
      if (el2)
        el2.style.transform = `translateX(${Math.min(0, sc * -0.05)}px)`;
      if (el3)
        el3.style.transform = `translateX(${Math.max(0, sc * 0.03)}px)`;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="home-page">
      <section className="hero">
        <h1 className="hero-title">Ravi Sharma Photo & Films</h1>
        <p className="hero-tag">Cinematic Wedding Films & Timeless Photography</p>
        <button className="btn-primary" onClick={openInquiry}>
          Book an Inquiry
        </button>
      </section>

      <section className="parallax parallax-right">
        <img src="/assets/hero1.jpg" alt="Wedding Film" />
        <div className="text-box left">
          <h2>Wedding Filmmakers</h2>
          <p>We capture emotions with cinematic precision and passion.</p>
        </div>
      </section>

      <section className="parallax parallax-left">
        <img src="/assets/hero2.jpg" alt="Candid Photography" />
        <div className="text-box right">
          <h2>Candid Photography</h2>
          <p>Our candid frames speak stories filled with heart and soul.</p>
        </div>
      </section>

      <section className="parallax parallax-center">
        <img src="/assets/hero3.jpg" alt="Why Choose Us" />
        <div className="overlay-text">
          <h2>Why Choose Us?</h2>
          <p>
            Because your story deserves to be remembered beautifully — through our lens.
          </p>
        </div>
      </section>
    </main>
  );
}
