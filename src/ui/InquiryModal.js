import React, { useState } from "react";

export default function InquiryModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [requirements, setRequirements] = useState([]);

  const toggleReq = (val) => {
    setRequirements((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        {step === 1 && (
          <>
            <h2>Enter your name</h2>
            <input type="text" placeholder="Your name" className="input" />
            <div className="modal-nav">
              <button className="btn-primary" onClick={() => setStep(2)}>
                Next
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Email (optional)</h2>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
            <div className="modal-nav">
              <button className="btn-ghost" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn-ghost" onClick={() => setStep(3)}>
                Skip
              </button>
              <button className="btn-primary" onClick={() => setStep(3)}>
                Next
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2>Requirements</h2>
            <div className="checkbox-list">
              {[
                "Candid Photography",
                "Cinematography",
                "Traditional Photo / Video",
                "Photo Album",
              ].map((req) => (
                <label key={req}>
                  <input
                    type="checkbox"
                    checked={requirements.includes(req)}
                    onChange={() => toggleReq(req)}
                  />{" "}
                  {req}
                </label>
              ))}
            </div>
            <div className="modal-nav">
              <button className="btn-ghost" onClick={() => setStep(2)}>
                Back
              </button>
              <button className="btn-primary" onClick={() => setStep(4)}>
                Submit
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2>Thank You!</h2>
            <p>Your inquiry has been received successfully.</p>
            <button className="btn-primary" onClick={onClose}>
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
