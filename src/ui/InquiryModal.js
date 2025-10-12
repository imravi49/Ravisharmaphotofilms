import React, { useState, useEffect } from "react";
import "../../styles.css";

export default function InquiryModal() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-enquiry-modal", handler);
    return () => window.removeEventListener("open-enquiry-modal", handler);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
      setForm({ name: "", phone: "", message: "" });
    }, 3000);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {!submitted ? (
          <form className="enquiry-form" onSubmit={handleSubmit}>
            <h3>Book Enquiry</h3>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Contact Number"
              pattern="[0-9]*"
              inputMode="numeric"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value.replace(/[^0-9]/g, ""),
                })
              }
              required
            />
            <textarea
              name="message"
              placeholder="Tell us about your event"
              value={form.message}
              onChange={handleChange}
              required
            />
            <button type="submit">Submit</button>
          </form>
        ) : (
          <div className="thank-you-msg">
            <p>
              Your enquiry form has been submitted.
              <br />
              We will contact you ASAP.
              <br />
              Thank you for showing interest in our art. 🙏😊
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
