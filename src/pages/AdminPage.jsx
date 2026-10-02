import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Phone, RefreshCw, Users } from "lucide-react";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { getAdminRequests } from "../lib/api";
import { formatDate } from "../utils/format";

export default function AdminPage() {
  const [data, setData] = useState({ interests: [], bookings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("interests");

  async function load() {
    try {
      setLoading(true);
      setError("");
      setData(await getAdminRequests());
    } catch (err) {
      setError(err.message || "Unable to load admin requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(
    () => (tab === "interests" ? data.interests : data.bookings),
    [data, tab]
  );

  return (
    <div className="container page-container admin-page">
      <section className="admin-heading">
        <div>
          <p className="eyebrow">Testing dashboard</p>
          <h1>Requests</h1>
          <p className="page-subtitle">
            Interest and booking requests submitted by lodge browsers.
          </p>
        </div>
        <button className="secondary-button" onClick={load} disabled={loading}>
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </section>

      <div className="admin-warning">
        This page is intentionally public for testing. Protect this route and the underlying data with authentication before production.
      </div>

      <div className="admin-stats">
        <button
          className={`admin-stat ${tab === "interests" ? "selected" : ""}`}
          onClick={() => setTab("interests")}
        >
          <span className="stat-icon"><Users size={18} /></span>
          <span>
            <strong>{data.interests.length}</strong>
            <small>Interest requests</small>
          </span>
        </button>

        <button
          className={`admin-stat ${tab === "bookings" ? "selected" : ""}`}
          onClick={() => setTab("bookings")}
        >
          <span className="stat-icon"><CalendarCheck size={18} /></span>
          <span>
            <strong>{data.bookings.length}</strong>
            <small>Booking requests</small>
          </span>
        </button>
      </div>

      {loading ? (
        <LoadingState label="Loading requests..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <div className="empty-state compact-empty">
          <h2>No {tab} yet</h2>
          <p>Requests submitted from the lodge pages will appear here.</p>
        </div>
      ) : (
        <div className="request-table-wrap">
          <table className="request-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Lodge</th>
                <th>Submitted</th>
                {tab === "bookings" && <th>Status</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                  </td>
                  <td>
                    <a className="phone-link" href={`tel:${row.phone}`}>
                      <Phone size={14} />
                      {row.phone}
                    </a>
                  </td>
                  <td>{row.lodges?.name || "Unknown lodge"}</td>
                  <td>{formatDate(row.created_at)}</td>
                  {tab === "bookings" && (
                    <td>
                      <span className="status-badge">{row.status}</span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
