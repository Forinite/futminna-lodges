import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase.js";
import { FEATURES, VIDEO_BUCKET, naira } from "../../lib/constants.js";

const blank = { name: "", location: "", rooms: 1, price_first_year: "", price_yearly: "", features: [] };

function videoPath(url) {
  const marker = `/${VIDEO_BUCKET}/`;
  const i = url ? url.indexOf(marker) : -1;
  return i === -1 ? null : url.slice(i + marker.length).split("?")[0];
}
const removeVideo = (url) => {
  const p = videoPath(url);
  return p ? supabase.storage.from(VIDEO_BUCKET).remove([p]) : Promise.resolve();
};

export default function AdminLodges() {
  const fileRef = useRef(null);
  const [lodges, setLodges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // lodge being edited, or null = adding
  const [form, setForm] = useState(blank);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase.from("lodges_with_stats").select("*").order("created_at", { ascending: false });
    setLodges(data ?? []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const toggle = (k) =>
    set({ features: form.features.includes(k) ? form.features.filter((x) => x !== k) : [...form.features, k] });

  function reset() {
    setEditing(null); setForm(blank); setFile(null); setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function startEdit(l) {
    setEditing(l); setFile(null); setError(""); setNotice("");
    setForm({
      name: l.name, location: l.location ?? "", rooms: l.rooms,
      price_first_year: l.price_first_year, price_yearly: l.price_yearly, features: l.features ?? [],
    });
    if (fileRef.current) fileRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadVideo(f) {
    const ext = (f.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(VIDEO_BUCKET).upload(path, f, { contentType: f.type });
    if (error) throw new Error(/size|exceed/i.test(error.message) ? "That video is too large (50 MB max)." : error.message);
    return supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path).data.publicUrl;
  }

  async function submit(e) {
    e.preventDefault();
    setError(""); setNotice("");
    const rooms = Number(form.rooms), first = Number(form.price_first_year), yearly = Number(form.price_yearly);
    if (form.name.trim().length < 2) return setError("Enter a lodge name.");
    if (!Number.isInteger(rooms) || rooms < 1) return setError("Rooms must be a whole number, 1 or more.");
    if (!(first >= 0) || !(yearly >= 0) || form.price_first_year === "" || form.price_yearly === "")
      return setError("Enter both prices.");
    if (!editing && !file) return setError("Choose a video of the lodge.");

    const row = {
      name: form.name.trim(), location: form.location.trim() || null, rooms,
      price_first_year: first, price_yearly: yearly, features: form.features,
    };
    try {
      if (file) { setBusy("Uploading video…"); row.video_url = await uploadVideo(file); }
      setBusy("Saving…");
      const q = editing
        ? supabase.from("lodges").update(row).eq("id", editing.id)
        : supabase.from("lodges").insert(row);
      const { error } = await q;
      if (error) {
        if (file) await removeVideo(row.video_url); // don't leave an orphaned upload
        throw new Error(error.message);
      }
      if (editing && file) await removeVideo(editing.video_url);
      setNotice(editing ? "Changes saved." : "Lodge added.");
      reset(); await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function revoke(l) {
    if (!confirm(`Revoke the booking on "${l.name}"? It becomes available again and the booking stays in the requests list as revoked.`)) return;
    const { error } = await supabase.rpc("revoke_booking", { p_lodge_id: l.id });
    if (error) setError("Could not revoke that booking."); else { setNotice("Booking revoked."); load(); }
  }

  async function remove(l) {
    if (!confirm(`Delete "${l.name}"? Its video and all interest and booking records will be removed for good.`)) return;
    const { error } = await supabase.from("lodges").delete().eq("id", l.id);
    if (error) return setError("Could not delete that lodge.");
    await removeVideo(l.video_url);
    if (editing?.id === l.id) reset();
    setNotice("Lodge deleted.");
    load();
  }

  return (
    <div className="split">
      <form className="panel stack sticky" onSubmit={submit}>
        <h2>{editing ? "Edit lodge" : "Add a lodge"}</h2>
        <label>Name
          <input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Single room self-contain" />
        </label>
        <label>Area
          <input value={form.location} onChange={(e) => set({ location: e.target.value })} placeholder="Bosso Estate" />
        </label>
        <div className="two">
          <label>Rooms
            <input type="number" min="1" value={form.rooms} onChange={(e) => set({ rooms: e.target.value })} />
          </label>
          <span />
          <label>First-year price (₦)
            <input type="number" min="0" value={form.price_first_year} onChange={(e) => set({ price_first_year: e.target.value })} />
          </label>
          <label>Yearly price after (₦)
            <input type="number" min="0" value={form.price_yearly} onChange={(e) => set({ price_yearly: e.target.value })} />
          </label>
        </div>
        <fieldset className="plain">
          <legend>Features</legend>
          <div className="checks">
            {FEATURES.map((f) => (
              <label key={f.key} className="opt">
                <input type="checkbox" checked={form.features.includes(f.key)} onChange={() => toggle(f.key)} />
                {f.label}
              </label>
            ))}
          </div>
        </fieldset>
        <label>{editing ? "Replace video (optional)" : "Video"}
          <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <span className="muted">MP4 or WebM, up to 50 MB. Short clips (30 to 60 seconds) load fastest.</span>
        </label>
        {editing?.video_url && !file && <video className="preview" src={editing.video_url} controls muted playsInline />}
        {file && <p className="muted">Selected: {file.name} ({(file.size / 1048576).toFixed(1)} MB)</p>}
        {error && <p className="error" role="alert">{error}</p>}
        {notice && <p className="ok" role="status">{notice}</p>}
        <div className="btn-row">
          <button className="btn btn-primary" disabled={!!busy}>{busy || (editing ? "Save changes" : "Add lodge")}</button>
          {editing && <button type="button" className="btn" onClick={reset} disabled={!!busy}>Cancel</button>}
        </div>
      </form>

      <section>
        <h2>Your lodges ({lodges.length})</h2>
        {loading && <p className="state">Loading…</p>}
        {!loading && lodges.length === 0 && <p className="state">No lodges yet. Add your first one.</p>}
        <div className="list">
          {lodges.map((l) => (
            <article key={l.id} className={`panel item ${editing?.id === l.id ? "item-on" : ""}`}>
              {l.video_url
                ? <video src={l.video_url} muted playsInline preload="metadata" />
                : <div className="video-empty">No video</div>}
              <div>
                <h3>{l.name}</h3>
                <p className="muted">
                  {l.location ? `${l.location} · ` : ""}{l.rooms} room{l.rooms > 1 ? "s" : ""} · {naira(l.price_yearly)}/yr ({naira(l.price_first_year)} first year)
                </p>
                <div className="tags">
                  <span className={`tag ${l.is_booked ? "tag-booked" : "tag-free"}`}>{l.is_booked ? "Booked" : "Available"}</span>
                  <span className="tag">{l.interest_count} interested</span>
                  {l.features?.includes("starlink") && <span className="tag tag-premium">Starlink</span>}
                </div>
                <div className="btn-row">
                  <button className="btn btn-sm" onClick={() => startEdit(l)}>Edit</button>
                  {l.is_booked && <button className="btn btn-sm" onClick={() => revoke(l)}>Revoke booking</button>}
                  <button className="btn btn-sm btn-danger" onClick={() => remove(l)}>Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
