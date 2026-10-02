import {
  Check,
  Droplets,
  Fan,
  Flame,
  Home,
  Radio,
  ShowerHead,
  Zap,
} from "lucide-react";

const icons = {
  starlink: Radio,
  well: Droplets,
  water: Droplets,
  fan: Fan,
  toilet: ShowerHead,
  kitchen: Flame,
  electricity: Zap,
  rooms: Home,
};

export default function FacilityBadge({ type, label, active = true, compact = false }) {
  const Icon = icons[type] || Check;

  return (
    <span className={`facility-badge ${active ? "active" : ""} ${compact ? "compact" : ""}`}>
      <Icon size={compact ? 13 : 15} />
      <span>{label}</span>
    </span>
  );
}
