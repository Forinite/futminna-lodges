import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import { AGENT, FEATURES, naira } from "../lib/constants.js";
import { useLodgeList } from "../lib/LodgeListContext.jsx";
import RequestModal from "../components/RequestModal.jsx";

function PagerButton({ to, label, children }) {
  return to ? (
    <Link to={to} className="pbtn" aria-label={label}>{children}</Link>
  ) : (
    <span className="pbtn off" aria-disabled="true" aria-label={`${label} (none)`}>{children}</span>
  );
}

export default function LodgeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ids: listIds } = useLodgeList();
  const [lodge, setLodge] = useState(null);
  const [missing, setMissing] = useState(false);
  const [modal, setModal] = useState(null); // 'interest' | 'booking' | null
  const [fallbackIds, setFallbackIds] = useState([]);

  // If the page was opened directly (not from Browse), step through all lodges instead.
  const inList = listIds.includes(id);
  useEffect(() => {
    if (inList) return;
    let alive = true;
    supabase.from("lodges_with_stats").select("id").order("created_at", { ascending: false })
      .then(({ data }) => { if (alive) setFallbackIds((data ?? []).map((d) => d.id)); });
    return () => { alive = false; };
  }, [inList]);

  const ids = inList ? listIds : fallbackIds;
  const index = ids.indexOf(id);
  const prevId = index > 0 ? ids[index - 1] : null;
  const nextId = index >= 0 && index < ids.length - 1 ? ids[index + 1] : null;

  const load = useCallback(async () => {
    setMissing(false);
    const { data, error } = await supabase.from("lodges_with_stats").select("*").eq("id", id).single();
    if (error || !data) return setMissing(true);
    setLodge(data);
  }, [id]);

  useEffect(() => { load(); window.scrollTo(0, 0); }, [load]);

  // Left / Right arrow keys move between lodges
  useEffect(() => {
    const onKey = (e) => {
      if (modal) return;
      const t = e.target;
      if (t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "VIDEO"].includes(t.tagName))) return;
      if (e.key === "ArrowLeft" && prevId) navigate(`/lodge/${prevId}`);
      if (e.key === "ArrowRight" && nextId) navigate(`/lodge/${nextId}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, prevId, nextId, navigate]);

  if (missing) return <p className="state">Lodge not found. <Link to="/">Back to all lodges</Link></p>;
  if (!lodge || lodge.id !== id) return <p className="state">Loading…</p>;

  const waText = encodeURIComponent(`Hello, I'm interested in "${lodge.name}" on Futminna Lodges.`);
  const premium = FEATURES.filter((f) => f.premium && lodge.features.includes(f.key));

  return (
    <>
      <div className="detail-top">
        <Link to="/" className="back">← All lodges</Link>
        <nav className="pager" aria-label="Browse lodges">
          <PagerButton to={prevId && `/lodge/${prevId}`} label="Previous lodge">‹</PagerButton>
          {index >= 0 && <span className="pager-count" aria-live="polite">{index + 1} of {ids.length}</span>}
          <PagerButton to={nextId && `/lodge/${nextId}`} label="Next lodge">›</PagerButton>
        </nav>
      </div>

      <section className="agent" aria-label="Agent">
        <div className="agent-id">
          <div className="avatar" aria-hidden>OF</div>
          <div>
            <h2>{AGENT.name}</h2>
            <p className="agent-role">Letting agent</p>
            <div className="btn-row">
              <a className="btn btn-primary" href={AGENT.callHref}>Call</a>
              <a className="btn btn-light" target="_blank" rel="noreferrer"
                href={`https://wa.me/${AGENT.whatsappIntl}?text=${waText}`}>WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="agent-nums">
          <p><span>Phone</span>{AGENT.phone}</p>
          <p><span>WhatsApp</span>{AGENT.whatsapp}</p>
        </div>
        <p className="notice"><strong>Call before you commit.</strong> Lodges go fast, so confirm with the agent that this one is still available.</p>
      </section>

      <section className="detail-main">
        <div className="detail-info">
          <div>
            <div className="tags">
              {premium.map((p) => <span key={p.key} className="tag tag-premium">{p.label}</span>)}
              <span className={`tag ${lodge.is_booked ? "tag-booked" : "tag-free"}`}>{lodge.is_booked ? "Booked" : "Available"}</span>
            </div>
            <h1>{lodge.name}</h1>
            <p className="muted">
              {lodge.location ? `${lodge.location} · ` : ""}{lodge.rooms} room{lodge.rooms > 1 ? "s" : ""} · {lodge.interest_count} interested
            </p>
          </div>

          <dl className="prices">
            <div><dt>First year</dt><dd>{naira(lodge.price_first_year)}</dd></div>
            <div><dt>Every year after</dt><dd>{naira(lodge.price_yearly)}</dd></div>
          </dl>

          <div className="panel">
            <h3>What it has</h3>
            <ul className="feature-list">
              {FEATURES.map((f) => {
                const has = lodge.features.includes(f.key);
                return (
                  <li key={f.key} className={`${has ? "yes" : "no"} ${has && f.premium ? "v" : ""}`}>
                    <span className="ico" aria-hidden>{has ? "✓" : "✕"}</span>
                    {f.label}
                    <span className="sr">{has ? " (included)" : " (not included)"}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="footage">
          {lodge.video_url
            ? <video key={lodge.id} src={lodge.video_url} controls playsInline preload="metadata" />
            : <div className="video-empty">No footage yet</div>}
        </div>
      </section>

      <section className="actions" aria-label="Next steps">
        <div className="panel action">
          <div>
            <h3>Just looking? Show interest</h3>
            <p className="muted">The agent will call you about this lodge. You are not committing to buy.</p>
          </div>
          <button className="btn" onClick={() => setModal("interest")}>Show interest</button>
        </div>
        <div className={`panel action ${lodge.is_booked ? "" : "action-main"}`}>
          <div>
            <h3>{lodge.is_booked ? "This lodge has been booked" : "Ready to take it? Book"}</h3>
            <p className="muted">
              {lodge.is_booked
                ? "Someone has already booked it. Show interest to hear about similar lodges."
                : "Booking means you want this lodge. Once booked, nobody else can, so call the agent first."}
            </p>
          </div>
          <button className="btn btn-primary" disabled={lodge.is_booked} onClick={() => setModal("booking")}>
            {lodge.is_booked ? "Booked" : "Book this lodge"}
          </button>
        </div>
      </section>

      {modal && <RequestModal lodge={lodge} type={modal} onClose={() => setModal(null)} onDone={load} />}
    </>
  );
}
