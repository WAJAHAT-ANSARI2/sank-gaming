import React, { useEffect, useState } from 'react';
import { getCDs, createCD, updateCD, deleteCD } from '../../api';

const emptyForm = { title: '', game_type: 'disc', description: '', platform: 'PS5', genre: '', price_per_day: '', total_copies: 1, image: '' };

export default function AdminCDs() {
  const [cds, setCds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  useEffect(() => { loadCDs(); }, []);

  const loadCDs = () => {
    setLoading(true);
    getCDs().then(res => setCds(res.data.cds)).finally(() => setLoading(false));
  };

  const openAddModal = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (cd) => {
    setForm({
      title: cd.title, game_type: cd.game_type || 'disc', description: cd.description || '', platform: cd.platform || 'PS5',
      genre: cd.genre || '', price_per_day: cd.price_per_day, total_copies: cd.total_copies, image: cd.image || ''
    });
    setEditingId(cd.id);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await updateCD(editingId, form);
      } else {
        await createCD(form);
      }
      setShowModal(false);
      loadCDs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save CD');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this CD permanently?')) return;
    try {
      await deleteCD(id);
      loadCDs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Manage CDs</h2>
        <button className="btn btn-primary" onClick={openAddModal}>+ Add New CD</button>
      </div>

      {loading ? <div className="spinner" /> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Platform</th>
                <th>Genre</th>
                <th>Price/Day</th>
                <th>Copies/Slots</th>
                <th>Available Now</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cds.map(cd => (
                <tr key={cd.id}>
                  <td>{cd.title}</td>
                  <td>
                    <span className={`badge ${cd.game_type === 'digital' ? 'badge-booked' : ''}`} style={cd.game_type === 'digital' ? {} : { background: 'rgba(168,85,247,0.15)', color: 'var(--neon-purple)' }}>
                      {cd.game_type === 'digital' ? '💾 Digital' : '💿 Disc'}
                    </span>
                  </td>
                  <td>{cd.platform}</td>
                  <td>{cd.genre}</td>
                  <td>Rs. {Number(cd.price_per_day).toLocaleString()}</td>
                  <td>{cd.game_type === 'digital' ? '2 slots' : cd.total_copies}</td>
                  <td>{cd.available_now}</td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(cd)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cd.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{editingId ? 'Edit CD' : 'Add New CD'}</h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>

              {/* Game Type toggle */}
              <div className="form-group">
                <label>Game Type</label>
                <div className="delivery-toggle">
                  <button type="button" className={`delivery-option ${form.game_type === 'disc' ? 'active' : ''}`} onClick={() => setForm({ ...form, game_type: 'disc' })}>
                    💿 Disc
                  </button>
                  <button type="button" className={`delivery-option ${form.game_type === 'digital' ? 'active' : ''}`} onClick={() => setForm({ ...form, game_type: 'digital' })}>
                    💾 Digital (2 Slots)
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Platform</label>
                  <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                    <option>PS5</option><option>PS4</option><option>Xbox</option><option>PC</option><option>Nintendo</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Genre</label>
                  <input value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} placeholder="Action, RPG..." />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Price per Day (Rs.)</label>
                  <input required type="number" min="0" step="0.01" value={form.price_per_day} onChange={e => setForm({ ...form, price_per_day: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Total Copies</label>
                  <input required type="number" min="1" value={form.total_copies} onChange={e => setForm({ ...form, total_copies: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL (optional)</label>
                <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {editingId ? 'Save Changes' : 'Add CD'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
