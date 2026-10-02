import { FEATURES } from "../lib/constants.js";

export const emptyFilters = {
  minPrice: "",
  maxPrice: "",
  minRooms: "",
  features: [],
  hideBooked: false,
};

export default function FilterPanel({ filters, onChange }) {
  const set = (patch) => onChange({ ...filters, ...patch });
  const toggleFeature = (key) =>
    set({
      features: filters.features.includes(key)
        ? filters.features.filter((k) => k !== key)
        : [...filters.features, key],
    });

  return (
    <section className="filters" aria-label="Filter lodges">
      <div className="filter-row">
        <label>
          Min price (per year)
          <input type="number" min="0" inputMode="numeric" value={filters.minPrice}
            onChange={(e) => set({ minPrice: e.target.value })} placeholder="0" />
        </label>
        <label>
          Max price (per year)
          <input type="number" min="0" inputMode="numeric" value={filters.maxPrice}
            onChange={(e) => set({ maxPrice: e.target.value })} placeholder="Any" />
        </label>
        <label>
          Rooms (at least)
          <input type="number" min="1" inputMode="numeric" value={filters.minRooms}
            onChange={(e) => set({ minRooms: e.target.value })} placeholder="Any" />
        </label>
        <label className="check">
          <input type="checkbox" checked={filters.hideBooked}
            onChange={(e) => set({ hideBooked: e.target.checked })} />
          Hide booked lodges
        </label>
      </div>
      <div className="chips" role="group" aria-label="Features">
        {FEATURES.map((f) => (
          <button key={f.key} type="button"
            className={`chip ${filters.features.includes(f.key) ? "on" : ""} ${f.premium ? "chip-premium" : ""}`}
            aria-pressed={filters.features.includes(f.key)}
            onClick={() => toggleFeature(f.key)}>
            {f.label}
          </button>
        ))}
        <button type="button" className="chip-clear" onClick={() => onChange(emptyFilters)}>
          Clear filters
        </button>
      </div>
    </section>
  );
}
