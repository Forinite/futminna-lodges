import { useEffect, useRef, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Browse from "./pages/Browse.jsx";
import LodgeDetail from "./pages/LodgeDetail.jsx";
import ConnectPage from "./pages/ConnectPage.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import AuthModal from "./components/AuthModal.jsx";
import { LinkBtn } from "./components/ui.jsx";
import { LodgeListProvider } from "./lib/LodgeListContext.jsx";
import { AuthProvider, useAuth } from "./lib/AuthContext.jsx";

function SiteHeader() {
  const { user, signOut } = useAuth();
  const ref = useRef(null);
  const [authOpen, setAuthOpen] = useState(false);

  // Tell the CSS how tall the header is so sticky filters sit right under it
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () => document.documentElement.style.setProperty("--header-h", el.offsetHeight + "px");
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <header ref={ref} className="sticky top-0 z-30">
      {user && (
        <div className="flex min-h-8 items-center gap-4 bg-[#0b1511] px-4 text-[0.8rem] text-[#c3d6cd]">
          <span>Signed in as <strong className="font-bold text-white">{user.email}</strong></span>
          <span className="grow" />
          <Link to="/my-bookings" className="text-white">My bookings</Link>
          <LinkBtn onClick={signOut}>Sign out</LinkBtn>
        </div>
      )}
      <div className="flex min-h-15 items-center justify-between bg-ink px-4 py-3.5 text-white">
        <Link to="/" className="font-display text-[1.35rem] font-extrabold no-underline">Futminna Lodges</Link>
        <div className="flex items-center gap-4">
          {!user && (
            <button className="min-h-10 cursor-pointer rounded-lg border border-[#6f8a81] px-4 text-[0.85rem] font-bold text-white" onClick={() => setAuthOpen(true)}>Sign in</button>
          )}
        </div>
      </div>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} />}
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LodgeListProvider>
        <SiteHeader />
        <main className="mx-auto max-w-[1120px] px-4 pb-16 pt-5">
          <Routes>
            <Route path="/" element={<Browse />} />
            <Route path="/lodge/:id" element={<LodgeDetail />} />
            <Route path="/connect/:token" element={<ConnectPage />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="*" element={<p>Page not found.</p>} />
          </Routes>
        </main>
      </LodgeListProvider>
    </AuthProvider>
  );
}
