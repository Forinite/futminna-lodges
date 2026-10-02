import { Link, useLocation } from "react-router-dom";
import { Building2, LayoutGrid, ShieldCheck } from "lucide-react";

export default function SiteHeader() {
  const location = useLocation();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Building2 size={19} strokeWidth={2.1} />
          </span>
          <span>
            <strong>FUT Lodges</strong>
            <small>Minna accommodation</small>
          </span>
        </Link>

        <nav className="main-nav">
          <Link
            className={location.pathname === "/" ? "nav-link active" : "nav-link"}
            to="/"
          >
            <LayoutGrid size={16} />
            Browse
          </Link>
          <Link
            className={location.pathname.startsWith("/admin") ? "nav-link active" : "nav-link"}
            to="/admin"
          >
            <ShieldCheck size={16} />
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
