import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="app-shell">
      <nav className="navbar">
        <NavLink to="/" className="navbar-brand">
          <span className="brand-icon">⬡</span>
          <span>LLD Practice</span>
        </NavLink>
        <div className="navbar-links">
          <NavLink to="/problems" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Problems
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            My History
          </NavLink>
        </div>
      </nav>
      <main className={`main-content ${isHome ? 'home-main' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
