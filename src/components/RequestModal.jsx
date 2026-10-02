import { useState } from "react";
import { supabase } from "../lib/supabase.js";

const COPY = {
  interest: {
    title: "Show interest",
    help: "Leave your details and the agent will call you about this lodge. You are not committing to anything.",
    action: "Send my interest",
  },
  booking: {
    title: "Book this lodge",
    help: "Booking tells the agent you want to take this lodge. Once booked, nobody else can book it.",
    action: "Book this lodge",
  },
};

export default function RequestModal({ lodge, type, onClose, onDone }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const copy = COPY[type];

  async function submit(e) {
    e.preventDefault();
    setError("");
    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (name.trim().length < 2) return setError("Enter your full name.");
    if (!/^\+?\d{10,14}$/.test(cleanPhone)) return setError("Enter a valid phone number.");

    setBusy(true);
    if (type === "interest") {
      const { error } = await supabase.from("requests").insert({
        lodge_id: lodge.id, type: "interest", name: name.trim(), phone: cleanPhone,
      });
      if (error) { setBusy(false); return setError("Could not send. Please try again."); }
    } else {
      const { data, error } = await supabase.rpc("book_lodge", {
        p_lodge_id: lodge.id, p_name: name.trim(), p_phone: cleanPhone,
      });
      if (error) { setBusy(false); return setError("Could not book. Please try again."); }
      if (!data) {
        setBusy(false);
        onDone(); // refresh so the page shows it is booked
        return setError("Sorry, someone just booked this lodge.");
      }
    }
    setBusy(false);
    setSent(true);
    onDone();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={copy.title}
        onClick={(e) => e.stopPropagation()}>
        {sent ? (
          <>
            <h2>{type === "interest" ? "Interest sent" : "Lodge booked"}</h2>
            <p>The agent will call you on {phone} soon.</p>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </>
        ) : (
          <form onSubmit={submit}>
            <h2>{copy.title}</h2>
            <p className="muted">{lodge.name}. {copy.help}</p>
            <label>Full name
              <input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </label>
            <label>Phone number
              <input value={phone} inputMode="tel" onChange={(e) => setPhone(e.target.value)}
                placeholder="08012345678" />
            </label>
            {error && <p className="error" role="alert">{error}</p>}
            <div className="modal-actions">
              <button type="button" className="btn" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" disabled={busy}>
                {busy ? "Sending…" : copy.action}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
