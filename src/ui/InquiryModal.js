// Inside step where email is entered:
<div className="input-row">
  <label>Email (optional)</label>
  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Enter your email"
  />
</div>
<div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
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

// Inside Requirements checkboxes list:
<label className={requirements.includes('Photo Album') ? 'checked' : ''}>
  <input
    type="checkbox"
    onChange={() => toggle('Photo Album')}
  /> Photo Album
</label>
