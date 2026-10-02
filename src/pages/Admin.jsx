import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

// TEST ONLY: unprotected. Add auth + tighten RLS before production.
export default function Admin() {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState("all");
  const [state, setState] = useState("loading");

  const load = async () => {
    setState("loading");
    const { data, error } = await supabase
      .from("requests")
      .select("id, type, name, phone, created_at, lodge_id, lodges(name)")
      .order("created_at", { ascending: false });
    if (error) return setState("error");
    setRows(data);
    setState("ready");
  };
  useEffect(() => { load(); }, []);

  const shown = rows.filter((r) => tab === "all" || r.type === tab);
  const labels = { all: "All", interest: "Interests", booking: "Bookings" };

  return (
    <>
      <div className="admin-head">
        <h1>Requests</h1>
        <button className="btn" onClick={load}>Refresh</button>
      </div>
      <div className="chips">
        {Object.keys(labels).map((t) => (
          <button key={t} className={`chip ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
            {labels[t]}
          </button>
        ))}
      </div>
      {state === "loading" && <p className="state">Loading…</p>}
      {state === "error" && <p className="state error">Could not load requests.</p>}
      {state === "ready" && shown.length === 0 && <p className="state">Nothing here yet.</p>}
      {shown.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Type</th><th>Name</th><th>Phone</th><th>Lodge</th><th>When</th></tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td><span className={`tag ${r.type === "booking" ? "tag-booked" : ""}`}>{r.type}</span></td>
                  <td>{r.name}</td>
                  <td><a href={`tel:${r.phone}`}>{r.phone}</a></td>
                  <td><Link to={`/lodge/${r.lodge_id}`}>{r.lodges?.name ?? "—"}</Link></td>
                  <td>{new Date(r.created_at).toLocaleString("en-NG")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
