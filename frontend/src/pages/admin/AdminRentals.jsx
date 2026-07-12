import React, { useEffect, useState } from 'react';
import { getAdminRentals, updateRentalStatus, updatePaymentStatus, cancelRental } from '../../api';

export default function AdminRentals() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');

  useEffect(() => { loadRentals(); }, [filter]);

  const loadRentals = () => {
    setLoading(true);
    getAdminRentals(filter).then(res => setRentals(res.data.rentals)).finally(() => setLoading(false));
  };

  const handleMarkReturned = async (id) => {
    await updateRentalStatus(id, 'returned');
    loadRentals();
  };

  const handleMarkPaid = async (id) => {
    await updatePaymentStatus(id, 'paid');
    loadRentals();
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this rental?')) return;
    await cancelRental(id);
    loadRentals();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>All Rentals</h2>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          style={{ padding: '0.5rem 1rem', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-white)' }}>
          <option value="">All Statuses</option>
          <option value="booked">Booked</option>
          <option value="returned">Returned</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? <div className="spinner" /> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Game</th>
                <th>Slot</th>
                <th>Start</th>
                <th>End</th>
                <th>Days</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Delivery</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map(r => (
                <tr key={r.id}>
                  <td>{r.customer_name}</td>
                  <td>{r.customer_phone || '-'}</td>
                  <td>{r.cd_title} <span style={{ color: 'var(--text-muted)' }}>({r.platform})</span></td>
                  <td>
                    {r.slot === 'primary'   ? '👑 Primary'
                      : r.slot === 'secondary' ? '🎮 Secondary'
                      : '💿 Disc'}
                  </td>
                  <td>{r.start_date}</td>
                  <td>{r.end_date}</td>
                  <td>{r.days}</td>
                  <td>Rs. {Number(r.total_price).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: r.payment_method === 'jazzcash' ? 'var(--neon-purple)' : r.payment_method === 'easypaisa' ? 'var(--neon-cyan)' : 'var(--text-muted)' }}>
                        {r.payment_method === 'jazzcash' ? '📱 JazzCash' : r.payment_method === 'easypaisa' ? '💚 EasyPaisa' : '💵 Cash'}
                      </span>
                      <span className={`badge ${r.payment_status === 'paid' ? 'badge-returned' : 'badge-booked'}`} style={{ fontSize: '0.7rem' }}>
                        {r.payment_status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                      </span>
                    </div>
                  </td>
                  <td>
                    {r.delivery_type === 'delivery'
                      ? <span title={`${r.area}, ${r.city}${r.landmark ? ' (' + r.landmark + ')' : ''}`}>🛵 {r.city}</span>
                      : <span>🏬 Pickup</span>}
                  </td>
                  <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {r.status === 'booked' && (
                        <>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleMarkReturned(r.id)}>✓ Returned</button>
                          {r.payment_status === 'pending' && (
                            <button className="btn btn-sm" style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e', border: '1px solid #22c55e' }} onClick={() => handleMarkPaid(r.id)}>
                              💰 Mark Paid
                            </button>
                          )}
                          <button className="btn btn-danger btn-sm" onClick={() => handleCancel(r.id)}>✕ Cancel</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rentals.length === 0 && <p style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>No rentals found.</p>}
        </div>
      )}
    </div>
  );
}
