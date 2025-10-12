import React, { useState } from "react";

export default function InquiryModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [requirements, setRequirements] = useState([]);

  const toggle = (val) => {
    if (requirements.includes(val))
      setRequirements(requirements.filter((v) => v !== val));
    else setRequirements([...requirements, val]);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        {step === 1 && (
          <div>
            <h2>Enter your name</h2>
            <input type="text" placeholder="Your name" />
            <div className="modal-nav">
              <button className="btn-primary" onClick={() => setStep(2)}>
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2>Email (optional)</h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
            <div className="modal-nav">
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-ghost" onClick={() => setStep(1)}>
                  Back
                </button>
                <button
                  className="btn-ghost"
                  onClick={() => {
                    setEmail("");
                    setStep(3);
                  }}
                >
                  Skip
                </button>
              </div>
              <button
                className="btn-primary"
                disabled={!email}
                onClick={() => setStep(3)}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2>Select Requirements</h2>
            <div className="checkbox-list">
              <label>
                <input
                  type="checkbox"
                  onChange={() => toggle("Candid Photography")}
                />{" "}
                Candid Photography
              </label>
              <label>
                <input
                  type="checkbox"
                  onChange={() => toggle("Cinematography")}
                />{" "}
                Cinematography
              </label>
              <label>
                <input
                  type="checkbox"
                  onChange={() => toggle("Traditional Photo / Video")}
                />{" "}
                Traditional Photo / Video
              </label>
              <label>
                <input type="checkbox" onChange={() => toggle("Photo Album")} />{" "}
                Photo Album
              </label>
            </div>
            <div className="modal-nav">
              <button className="btn-ghost" onClick={() => setStep(2)}>
                Back
              </button>
              <button className="btn-primary" onClick={() => setStep(4)}>
                Submit
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2>Thank you!</h2>
            <p>We’ve received your inquiry.</p>
            <button className="btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
