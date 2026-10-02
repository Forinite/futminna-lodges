import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { useLodgeList } from "../lib/LodgeListContext.jsx";
import LodgeCard from "../components/LodgeCard.jsx";
import FilterPanel, { emptyFilters } from "../components/FilterPanel.jsx";

export default function Browse() {
  const { setIds } = useLodgeList();
  const [lodges, setLodges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(emptyFilters);

  useEffect(() => {
    supabase
      .from("lodges_with_stats")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError("Could not load lodges. Check your connection and refresh.");
        else setLodges(data);
        setLoading(false);
      });
  }, []);

  const visible = useMemo(() => {
    const { minPrice, maxPrice, minRooms, features, hideBooked } = filters;
    return lodges.filter((l) =>
      (minPrice === "" || l.price_yearly >= Number(minPrice)) &&
      (maxPrice === "" || l.price_yearly <= Number(maxPrice)) &&
      (minRooms === "" || l.rooms >= Number(minRooms)) &&
      features.every((f) => l.features.includes(f)) &&
      !(hideBooked && l.is_booked)
    );
  }, [lodges, filters]);

  // Lets the detail page step Previous / Next through exactly this list.
  useEffect(() => { if (!loading) setIds(visible.map((l) => l.id)); }, [visible, loading, setIds]);

  return (
    <>
      <FilterPanel filters={filters} onChange={setFilters} />
      {loading && <p className="state">Loading lodges…</p>}
      {error && <p className="state error">{error}</p>}
      {!loading && !error && visible.length === 0 && (
        <p className="state">No lodges match these filters. Try removing one.</p>
      )}
      <div className="grid">
        {visible.map((l) => <LodgeCard key={l.id} lodge={l} />)}
      </div>
    </>
  );
}
