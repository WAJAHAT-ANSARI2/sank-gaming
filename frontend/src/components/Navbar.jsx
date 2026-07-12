import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">SANK GAMING</Link>
      <div className="navbar-links">
        <Link to="/browse">Browse CDs</Link>
        <Link to="/contact">Contact</Link>

        {user ? (
          <>
            {user.role === 'admin'
              ? <Link to="/admin">Admin Panel</Link>
              : <Link to="/my-rentals">My Rentals</Link>
            }
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-nav-login">Login</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
