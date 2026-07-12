import React, { useEffect, useState } from 'react';
import { getMyRentals, cancelRental } from '../api';

export default function MyRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = () => {
    setLoading(true);
    getMyRentals().then(res => setRentals(res.data.rentals)).finally(() => setLoading(false));
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this rental?')) return;
    try {
      await cancelRental(id);
      loadRentals();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <div className="page">
      <div className="container section">
        <h2 className="section-title">My Rentals</h2>

        {loading ? (
          <div className="spinner" />
        ) : rentals.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>You haven't rented any games yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Platform</th>
                  <th>Slot</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Total Price</th>
                  <th>Delivery</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rentals.map(r => (
                  <tr key={r.id}>
                    <td>{r.cd_title}</td>
                    <td>{r.platform}</td>
                    <td>
                      {r.slot === 'primary' ? '👑 Primary'
                        : r.slot === 'secondary' ? '🎮 Secondary'
                        : '💿 Disc'}
                    </td>
                    <td>{r.start_date}</td>
                    <td>{r.end_date}</td>
                    <td>{r.days}</td>
                    <td>Rs. {Number(r.total_price).toLocaleString()}</td>
                    <td>
                      {r.delivery_type === 'delivery'
                        ? <span title={`${r.area}, ${r.city}${r.landmark ? ' (' + r.landmark + ')' : ''}`}>🛵 {r.city || 'Delivery'}</span>
                        : <span>🏬 Pickup</span>}
                    </td>
                    <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                    <td>
                      {r.status === 'booked' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(r.id)}>Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
