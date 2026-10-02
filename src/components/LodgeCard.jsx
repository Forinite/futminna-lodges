import { Link } from "react-router-dom";
import AutoVideo from "./AutoVideo.jsx";
import { naira, FEATURES } from "../lib/constants.js";

export default function LodgeCard({ lodge }) {
  const premium = FEATURES.filter((f) => f.premium && lodge.features.includes(f.key));
  const isPremium = premium.length > 0;

  return (
    <article>
      <div className="card-price">
        {naira(lodge.price_yearly)} <span>per year</span>
      </div>
      <Link to={`/lodge/${lodge.id}`} className={`card ${isPremium ? "card-premium" : ""}`}>
        <AutoVideo src={lodge.video_url} className="card-video" />
        <div className="card-body">
          <h3>{lodge.name}</h3>
          <p className="muted">
            {lodge.location ? `${lodge.location} · ` : ""}
            {lodge.rooms} room{lodge.rooms > 1 ? "s" : ""}
          </p>
          <div className="tags">
            {premium.map((p) => <span key={p.key} className="tag tag-premium">{p.label}</span>)}
            <span className="tag">{lodge.interest_count} interested</span>
            {lodge.is_booked
              ? <span className="tag tag-booked">Booked</span>
              : <span className="tag tag-free">Not booked</span>}
          </div>
        </div>
      </Link>
    </article>
  );
}
