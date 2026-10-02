import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import VideoPreview from "../components/VideoPreview";
import FacilityBadge from "../components/FacilityBadge";
import RequestModal from "../components/RequestModal";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { bookLodge, getLodge, submitInterest } from "../lib/api";
import { formatNaira } from "../utils/format";

const AGENT_NAME = "Obe Fortune";
const AGENT_PHONE = "08000000000";
const WHATSAPP_NUMBER = "2348000000000";

const stats = [
  ["rooms", "rooms", "Rooms"],
  ["electricity", "electricity", "Electricity"],
  ["water", "water", "Running water"],
  ["has_well", "well", "Well"],
  ["has_starlink", "starlink", "Starlink"],
  ["has_ceiling_fan", "fan", "Ceiling fan"],
  ["has_modern_toilet", "toilet", "Modern toilet"],
  ["has_kitchen", "kitchen", "Kitchen"],
];

export default function LodgeDetailsPage() {
  const { id } = useParams();
  const [lodge, setLodge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      setLodge(await getLodge(id));
    } catch (err) {
      setError(err.message || "Unable to load this lodge.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  function openModal(type) {
    setNotice("");
    setModalError("");
    setModal(type);
  }

  async function submitRequest({ name, phone }) {
    try {
      setSubmitting(true);
      setModalError("");

      if (modal === "interest") {
        await submitInterest({ lodgeId: lodge.id, name, phone });
        setNotice("Your interest has been sent to the agent.");
        setModal(null);
        return;
      }

      await bookLodge({ lodgeId: lodge.id, name, phone });
      setLodge((current) => ({ ...current, is_booked: true }));
      setNotice("Booking request submitted. The agent can now contact you.");
      setModal(null);
    } catch (err) {
      const message = err.message || "Unable to submit request.";

      if (modal === "booking" && message.toLowerCase().includes("already")) {
        setLodge((current) => ({ ...current, is_booked: true }));
        setModalError("This lodge has already been booked by another person.");
      } else {
        setModalError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container page-container">
        <LoadingState label="Loading lodge details..." />
      </div>
    );
  }

  if (error || !lodge) {
    return (
      <div className="container page-container">
        <ErrorState message={error || "Lodge not found."} onRetry={load} />
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hello ${AGENT_NAME}, I'm interested in ${lodge.name}. Is it still available?`
  )}`;

  return (
    <div className="container page-container details-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} />
        Back to all lodges
      </Link>

      <section className="agent-bar">
        <div className="agent-identity">
          <div className="agent-avatar">OF</div>
          <div>
            <p className="eyebrow">Lodge agent</p>
            <h2>{AGENT_NAME}</h2>
          </div>
        </div>

        <div className="agent-contacts">
          <div className="contact-numbers">
            <span>{AGENT_PHONE}</span>
            <span>{AGENT_PHONE}</span>
          </div>
          <div className="agent-buttons">
            <a className="contact-button" href={`tel:${AGENT_PHONE}`}>
              <Phone size={16} />
              Call
            </a>
            <a className="contact-button whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="availability-message">
          <span className="availability-dot" />
          <p>
            Interested in this lodge? <strong>Call to confirm</strong> that it is still available
            before making plans.
          </p>
        </div>
      </section>

      {notice && (
        <div className="success-notice">
          <Check size={17} />
          {notice}
        </div>
      )}

      <section className="details-hero">
        <div className="details-stats">
          <div className="details-title">
            <p className="eyebrow">{lodge.location}</p>
            <h1>{lodge.name}</h1>
            <p>{lodge.description}</p>
          </div>

          <div className="stats-list">
            {stats.map(([key, type, label]) => {
              let value = lodge[key];

              if (key === "rooms") value = `${value} room${value === 1 ? "" : "s"}`;
              if (key === "has_well" || key === "has_starlink" || key === "has_ceiling_fan" || key === "has_modern_toilet" || key === "has_kitchen") {
                value = value ? "Available" : "Not available";
              }

              return (
                <div className={`stat-row ${value === "Available" ? "positive" : ""}`} key={key}>
                  <FacilityBadge type={type} label={label} compact />
                  <span>{value}</span>
                </div>
              );
            })}
          </div>

          <div className="pricing-card">
            <div>
              <span>First year</span>
              <strong>{formatNaira(lodge.first_year_price)}</strong>
            </div>
            <ChevronRight size={19} />
            <div>
              <span>Afterwards / year</span>
              <strong>{formatNaira(lodge.yearly_price)}</strong>
            </div>
          </div>
        </div>

        <div className="details-video-column">
          {lodge.has_starlink && (
            <div className="feature-ribbon">
              <Sparkles size={15} />
              Special feature · Starlink
            </div>
          )}
          <VideoPreview src={lodge.video_url} className="details-video" />
        </div>
      </section>

      <section className="request-section">
        <div className="request-explanation">
          <div>
            <p className="eyebrow">Your options</p>
            <h2>Ready to take the next step?</h2>
          </div>
          <div className="meaning-grid">
            <div>
              <strong>Show interest</strong>
              <p>Lets the agent know you are considering the lodge and gives them a way to contact you.</p>
            </div>
            <div>
              <strong>Book lodge</strong>
              <p>Requests that the lodge be held for you. Other users will see it as booked after confirmation.</p>
            </div>
          </div>
        </div>

        <div className="request-actions">
          <button className="secondary-button large" onClick={() => openModal("interest")}>
            Show interest
          </button>
          <button
            className="primary-button large"
            disabled={lodge.is_booked}
            onClick={() => openModal("booking")}
          >
            {lodge.is_booked ? "Lodge has been booked" : "Book this lodge"}
          </button>
        </div>
      </section>

      <RequestModal
        open={Boolean(modal)}
        type={modal}
        lodgeName={lodge.name}
        submitting={submitting}
        error={modalError}
        onClose={() => !submitting && setModal(null)}
        onSubmit={submitRequest}
      />
    </div>
  );
}
