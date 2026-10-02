import { useEffect, useMemo, useState } from "react";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import LodgeCard from "../components/LodgeCard";
import FilterPanel from "../components/FilterPanel";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { getLodges, supabase } from "../lib/api";

const defaultFilters = {
  minPrice: "",
  maxPrice: "",
  rooms: "",
  electricity: "",
  water: "",
  has_well: false,
  has_starlink: false,
  has_ceiling_fan: false,
  has_modern_toilet: false,
  has_kitchen: false,
};

function matchesFilters(lodge, filters) {
    console.log('lodge',lodge)

  const min = Number(filters.minPrice);
  const max = Number(filters.maxPrice);

  if (filters.minPrice && Number(lodge.price_first_year) < min) return false;
  if (filters.maxPrice && Number(lodge.price_first_year) > max) return false;

  if (filters.rooms === "4" && lodge.rooms < 4) return false;
  if (filters.rooms && filters.rooms !== "4" && lodge.rooms !== Number(filters.rooms)) {
    return false;
  }

  if (filters.electricity && lodge.electricity !== filters.electricity) return false;
  if (filters.water && lodge.water !== filters.water) return false;

  for (const key of ["has_well", "has_starlink", "has_ceiling_fan", "has_modern_toilet", "has_kitchen"]) {
    if (filters[key] && !lodge[key]) return false;
  }

  return true;
}

export default function BrowsePage() {
  const [lodges, setLodges] = useState([]);
  const [interestCounts, setInterestCounts] = useState({});
  const [filters, setFilters] = useState(defaultFilters);
  const [search, setSearch] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const [lodgeRows, interestRows] = await Promise.all([
        getLodges(),
        supabase.from("interests").select("lodge_id"),
      ]);

      if (interestRows.error) throw interestRows.error;

      const counts = {};
      for (const row of interestRows.data ?? []) {
        counts[row.lodge_id] = (counts[row.lodge_id] || 0) + 1;
      }

      setLodges(lodgeRows);
      setInterestCounts(counts);
    } catch (err) {
      setError(err.message || "Unable to load lodges.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredLodges = useMemo(() => {
    const query = search.trim().toLowerCase();

    return lodges.filter((lodge) => {
      const searchable = `${lodge.name} ${lodge.location} ${lodge.description}`.toLowerCase();
      return (!query || searchable.includes(query)) && matchesFilters(lodge, filters);
    });
  }, [lodges, filters, search]);

  return (
    <div className="container page-container">
      <section className="browse-toolbar">
        <div>
          <p className="eyebrow">FUT Minna area</p>
          <h1>Available lodges</h1>
          <p className="page-subtitle">
            Browse student accommodation, compare facilities and contact the agent directly.
          </p>
        </div>

        <div className="toolbar-actions">
          <label className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lodge or location"
            />
          </label>

          <button
            className="filter-mobile-trigger"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal size={17} />
            Filters
          </button>
        </div>
      </section>

      {loading ? (
        <LoadingState label="Finding available lodges..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <div className="browse-layout">
          <div className={`mobile-filter-drawer ${mobileFiltersOpen ? "open" : ""}`}>
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              resultCount={filteredLodges.length}
              onClose={() => setMobileFiltersOpen(false)}
            />
          </div>

          <div className="desktop-filters">
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              resultCount={filteredLodges.length}
            />
          </div>

          <section className="results-section">
            <div className="results-heading">
              <div>
                <span className="results-count">{filteredLodges.length}</span>
                <span> {filteredLodges.length === 1 ? "lodge" : "lodges"} found</span>
              </div>
              {Object.values(filters).some(Boolean) && (
                <button className="clear-small" onClick={() => setFilters(defaultFilters)}>
                  <Filter size={14} />
                  Clear filters
                </button>
              )}
            </div>

            {filteredLodges.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Search size={22} />
                </div>
                <h2>No lodges match your filters</h2>
                <p>Try changing the price range, facilities or search term.</p>
                <button className="secondary-button" onClick={() => setFilters(defaultFilters)}>
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="lodge-grid">
                {filteredLodges.map((lodge) => (
                  <LodgeCard
                    key={lodge.id}
                    lodge={lodge}
                    interestCount={interestCounts[lodge.id] || 0}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
