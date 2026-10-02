import { Routes, Route, Link } from "react-router-dom";
import Browse from "./pages/Browse.jsx";
import LodgeDetail from "./pages/LodgeDetail.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminRequests from "./pages/admin/AdminRequests.jsx";
import AdminLodges from "./pages/admin/AdminLodges.jsx";
import { LodgeListProvider } from "./lib/LodgeListContext.jsx";

export default function App() {
  return (
    <LodgeListProvider>
      <header className="bar">
        <Link to="/" className="brand">Futminna Lodges</Link>
        <Link to="/admin" className="bar-link">Admin</Link>
      </header>
      <main className="wrap">
        <Routes>
          <Route path="/" element={<Browse />} />
          <Route path="/lodge/:id" element={<LodgeDetail />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminRequests />} />
            <Route path="lodges" element={<AdminLodges />} />
          </Route>
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </LodgeListProvider>
  );
}
