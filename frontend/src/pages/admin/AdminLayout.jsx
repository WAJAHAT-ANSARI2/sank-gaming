import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Link to="/admin"          className={isActive('/admin')          ? 'active' : ''}>📊 Dashboard</Link>
        <Link to="/admin/cds"      className={isActive('/admin/cds')      ? 'active' : ''}>💿 Manage CDs</Link>
        <Link to="/admin/rentals"  className={isActive('/admin/rentals')  ? 'active' : ''}>📋 All Rentals</Link>
        <Link to="/admin/calendar" className={isActive('/admin/calendar') ? 'active' : ''}>📅 Calendar</Link>
        <Link to="/admin/settings" className={isActive('/admin/settings') ? 'active' : ''}>⚙️ Settings</Link>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
