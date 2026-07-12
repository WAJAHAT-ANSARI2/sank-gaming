import React, { useEffect, useState } from 'react';
import { getAdminStats, getAdminRentals } from '../../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentRentals, setRecentRentals] = useState([]);

  useEffect(() => {
    getAdminStats().then(res => setStats(res.data.stats));
    getAdminRentals().then(res => setRecentRentals(res.data.rentals.slice(0, 8)));
  }, []);

  return (
    <div>
      <h2 className="section-title">Dashboard</h2>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.active_rentals}</div>
            <div className="stat-label">Active Rentals</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.total_cds}</div>
            <div className="stat-label">Total Games</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.total_customers}</div>
            <div className="stat-label">Customers</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">Rs. {Number(stats.total_revenue).toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
      )}

      <h3 style={{ fontFamily: 'Orbitron', fontSize: '1rem', margin: '2rem 0 1rem', color: 'var(--neon-cyan)' }}>
        Recent Rentals
      </h3>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Game</th>
              <th>Dates</th>
              <th>Days</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentRentals.map(r => (
              <tr key={r.id}>
                <td>{r.customer_name}</td>
                <td>{r.cd_title}</td>
                <td>{r.start_date} → {r.end_date}</td>
                <td>{r.days}</td>
                <td>Rs. {Number(r.total_price).toLocaleString()}</td>
                <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
