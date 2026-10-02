import { NavLink, Outlet } from "react-router-dom";

// TODO before production: protect this route (see supabase/admin-production.sql
// for the Supabase Auth + admin-only policies that go with it).
export default function AdminLayout() {
  return (
    <>
      <div className="subnav">
        <NavLink to="/admin" end>Requests</NavLink>
        <NavLink to="/admin/lodges">Manage lodges</NavLink>
      </div>
      <Outlet />
    </>
  );
}
