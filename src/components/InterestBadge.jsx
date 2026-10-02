import { Users } from "lucide-react";

export default function InterestBadge({ count = 0 }) {
  return (
    <span className="interest-badge">
      <Users size={14} />
      {count} {count === 1 ? "person" : "people"} interested
    </span>
  );
}
