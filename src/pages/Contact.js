import React from "react";

export default function Contact({ openInquiry }) {
  return (
    <main className="contact-page">
      <h1>Contact Us</h1>
      <p>
        We look forward to hearing from you — let’s create something beautiful
        together.
      </p>

      <div className="contact-icons">
        <a
          className="icon-btn"
          href="mailto:hello@ravisharma.com"
          target="_blank"
          rel="noreferrer"
        >
          <img src="/assets/icon_mail.png" alt="mail" />
        </a>
        <a
          className="icon-btn"
          href="https://instagram.com/Tasweer.photography"
          target="_blank"
          rel="noreferrer"
        >
          <img src="/assets/icon_insta.png" alt="insta" />
        </a>
        <a
          className="icon-btn"
          href="https://wa.me/917383826282"
          target="_blank"
          rel="noreferrer"
        >
          <img src="/assets/icon_wa.png" alt="whatsapp" />
        </a>
        <a
          className="icon-btn"
          href="https://www.youtube.com/@TasweerphotographybyRavisharma"
          target="_blank"
          rel="noreferrer"
        >
          <img src="/assets/icon_youtube.png" alt="youtube" />
        </a>
      </div>

      <button className="btn-primary" onClick={openInquiry}>
        Book an Inquiry
      </button>
    </main>
  );
}
