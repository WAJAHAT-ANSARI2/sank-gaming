import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCDDetail, bookRental, getSettings } from '../api';
import { useAuth } from '../context/AuthContext';

const platformEmojis = { 'PS5': '🎮', 'PS4': '🎮', 'Xbox': '🕹️', 'PC': '💻', 'Nintendo': '🎯' };

export default function CDDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cd, setCd]               = useState(null);
  const [settings, setSettings]   = useState({});
  const [loading, setLoading]     = useState(true);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [days, setDays]           = useState(1);
  const [slot, setSlot]           = useState('');
  const [deliveryType, setDeliveryType]     = useState('pickup');
  const [paymentMethod, setPaymentMethod]   = useState('cash');
  const [area, setArea]           = useState('');
  const [city, setCity]           = useState('');
  const [landmark, setLandmark]   = useState('');
  const [booking, setBooking]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  useEffect(() => {
    loadCD();
    getSettings().then(res => setSettings(res.data.settings)).catch(() => {});
  }, [id]);

  const loadCD = () => {
    setLoading(true);
    getCDDetail(id).then(res => setCd(res.data.cd)).catch(() => setError('Game not found')).finally(() => setLoading(false));
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (cd.game_type === 'digital' && !slot) { setError('Please choose Primary or Secondary slot'); return; }
    if (deliveryType === 'delivery' && (!area.trim() || !city.trim())) { setError('Area and City are required for delivery'); return; }

    setError(''); setSuccess(''); setBooking(true);
    try {
      const res = await bookRental({
        cd_id: parseInt(id), start_date: startDate, days: parseInt(days),
        slot: cd.game_type === 'digital' ? slot : 'none',
        delivery_type: deliveryType, payment_method: paymentMethod,
        area, city, landmark
      });
      setSuccess(`Booked! Total: Rs. ${Number(res.data.rental.total_price).toLocaleString()} for ${days} day(s).`);
      setSlot('');
      loadCD();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const isSlotBooked = (slotName) => {
    if (!cd?.booked_slots) return false;
    return cd.booked_slots.some(b => b.slot === slotName && !(b.end_date < startDate || b.start_date > startDate));
  };

  if (loading) return <div className="page"><div className="spinner" /></div>;
  if (!cd) return <div className="page"><div className="container"><p>Game not found.</p></div></div>;

  const totalPrice = (days || 0) * Number(cd.price_per_day);
  const isDigital  = cd.game_type === 'digital';

  return (
    <div className="page">
      <div className="container section">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2.5rem' }} className="cd-detail-grid">

          {/* Image */}
          <div className="card" style={{ height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6rem', flexDirection: 'column', gap: '1rem' }}>
            {cd.image ? <img src={cd.image} alt={cd.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span>{isDigital ? '💾' : (platformEmojis[cd.platform] || '💿')}</span>}
            <span style={{ fontSize: '0.9rem', padding: '0.4rem 1rem', borderRadius: '99px',
              background: isDigital ? 'rgba(6,182,212,0.15)' : 'rgba(168,85,247,0.15)',
              color: isDigital ? 'var(--neon-cyan)' : 'var(--neon-purple)',
              border: `1px solid ${isDigital ? 'var(--neon-cyan)' : 'var(--neon-purple)'}` }}>
              {isDigital ? '💾 Digital Game' : '💿 Disc'}
            </span>
          </div>

          {/* Info + booking form */}
          <div>
            <div className="cd-card-platform">{cd.platform} · {cd.genre}</div>
            <h1 style={{ fontFamily: 'Orbitron', fontSize: '1.8rem', margin: '0.5rem 0' }}>{cd.title}</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{cd.description}</p>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Price per day</div>
                <div style={{ fontFamily: 'Orbitron', fontSize: '1.3rem', color: 'var(--neon-purple)' }}>
                  Rs. {Number(cd.price_per_day).toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{isDigital ? 'Slots Available' : 'Copies Available'}</div>
                <div style={{ fontFamily: 'Orbitron', fontSize: '1.3rem' }}>{cd.available_now}{isDigital ? ' / 2' : ` / ${cd.total_copies}`}</div>
              </div>
            </div>

            {/* Digital slot boxes */}
            {isDigital && (
              <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem' }}>
                {['primary', 'secondary'].map(s => {
                  const taken = isSlotBooked(s);
                  return (
                    <div key={s} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', textAlign: 'center',
                      background: taken ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                      border: `1px solid ${taken ? '#ef4444' : '#22c55e'}` }}>
                      <div style={{ fontFamily: 'Orbitron', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                        {s === 'primary' ? '👑 PRIMARY' : '🎮 SECONDARY'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: taken ? '#ef4444' : '#22c55e', fontWeight: 700 }}>
                        {taken ? 'Booked' : 'Available'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {error   && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleBook} className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Orbitron', fontSize: '1rem', marginBottom: '1.2rem', color: 'var(--neon-cyan)' }}>
                {isDigital ? '💾 Book Digital Game' : '💿 Book This Disc'}
              </h3>

              {/* Slot selection - digital only */}
              {isDigital && (
                <div className="form-group">
                  <label>Choose Slot</label>
                  <div className="delivery-toggle">
                    {['primary', 'secondary'].map(s => (
                      <button key={s} type="button"
                        className={`delivery-option ${slot === s ? 'active' : ''}`}
                        onClick={() => setSlot(s)}
                        disabled={isSlotBooked(s)}
                        style={{ opacity: isSlotBooked(s) ? 0.4 : 1 }}>
                        {s === 'primary' ? '👑 Primary' : '🎮 Secondary'}
                        {isSlotBooked(s) && ' (Booked)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Start Date</label>
                <input type="date" required min={new Date().toISOString().split('T')[0]} value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Number of Days</label>
                <input type="number" min={1} required value={days} onChange={e => setDays(e.target.value)} />
              </div>

              {/* Payment Method */}
              <div className="form-group">
                <label>Payment Method</label>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {[
                    { value: 'cash',      label: '💵 Cash' },
                    { value: 'jazzcash',  label: '📱 JazzCash' },
                    { value: 'easypaisa', label: '💚 EasyPaisa' },
                  ].map(pm => (
                    <button key={pm.value} type="button"
                      className={`delivery-option ${paymentMethod === pm.value ? 'active' : ''}`}
                      style={{ flex: 1, minWidth: '100px' }}
                      onClick={() => setPaymentMethod(pm.value)}>
                      {pm.label}
                    </button>
                  ))}
                </div>

                {/* Show payment number if JazzCash or EasyPaisa selected */}
                {paymentMethod === 'jazzcash' && (
                  <div style={{ marginTop: '0.8rem', padding: '0.8rem 1rem', background: 'rgba(168,85,247,0.1)', borderRadius: '8px', border: '1px solid rgba(168,85,247,0.3)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Send payment to JazzCash:</div>
                    <div style={{ fontFamily: 'Orbitron', color: 'var(--neon-purple)', fontSize: '1rem' }}>
                      {settings.jazzcash_number || '0321-2115181'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{settings.jazzcash_name || 'NAJAM ALSAQAB KHAN'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.4rem' }}>
                      ⚠️ Digital game ke liye advance payment zaroori hai. Admin se confirm ke baad credentials milenge.
                    </div>
                  </div>
                )}
                {paymentMethod === 'easypaisa' && (
                  <div style={{ marginTop: '0.8rem', padding: '0.8rem 1rem', background: 'rgba(6,182,212,0.1)', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.3)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Send payment to EasyPaisa:</div>
                    <div style={{ fontFamily: 'Orbitron', color: 'var(--neon-cyan)', fontSize: '1rem' }}>
                      {settings.easypaisa_number || '0321-2115181'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{settings.easypaisa_name || 'NAJAM ALSAQAB KHAN'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.4rem' }}>
                      ⚠️ Digital game ke liye advance payment zaroori hai. Admin se confirm ke baad credentials milenge.
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Method */}
              <div className="form-group">
                <label>Delivery Method</label>
                <div className="delivery-toggle">
                  <button type="button" className={`delivery-option ${deliveryType === 'pickup' ? 'active' : ''}`} onClick={() => setDeliveryType('pickup')}>🏬 Self Pickup</button>
                  <button type="button" className={`delivery-option ${deliveryType === 'delivery' ? 'active' : ''}`} onClick={() => setDeliveryType('delivery')}>🛵 Home Delivery</button>
                </div>
              </div>

              {deliveryType === 'delivery' && (
                <>
                  <div className="form-group">
                    <label>Area / Street</label>
                    <input type="text" required value={area} onChange={e => setArea(e.target.value)} placeholder="e.g. Block 5, Gulshan-e-Iqbal" />
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" required value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Karachi" />
                  </div>
                  <div className="form-group">
                    <label>Landmark (optional)</label>
                    <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)} placeholder="e.g. Near ABC Plaza" />
                  </div>
                </>
              )}

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-card2)', borderRadius: '8px', marginBottom: '1.2rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Price</span>
                <span style={{ fontFamily: 'Orbitron', fontSize: '1.4rem', color: 'var(--neon-purple)' }}>
                  Rs. {totalPrice.toLocaleString()}
                </span>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={booking || cd.available_now === 0}>
                {!user ? 'Login to Book' : booking ? 'Booking...' : cd.available_now === 0 ? 'Not Available'
                  : paymentMethod === 'cash' ? (deliveryType === 'delivery' ? 'Rent Now (Cash on Delivery)' : 'Rent Now (Cash on Pickup)')
                  : `Rent Now (Pay via ${paymentMethod === 'jazzcash' ? 'JazzCash' : 'EasyPaisa'})`}
              </button>
            </form>
          </div>
        </div>

        {/* Booked dates info */}
        {!isDigital && cd.booked_ranges?.length > 0 && (
          <div style={{ marginTop: '2.5rem' }}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Currently Booked Dates</h3>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {cd.booked_ranges.map((r, i) => <span key={i} className="badge badge-booked">{r.start_date} → {r.end_date}</span>)}
            </div>
          </div>
        )}
        {isDigital && cd.booked_slots?.length > 0 && (
          <div style={{ marginTop: '2.5rem' }}>
            <h3 style={{ fontFamily: 'Orbitron', fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Booked Slots</h3>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {cd.booked_slots.map((b, i) => (
                <span key={i} className="badge badge-booked">
                  {b.slot === 'primary' ? '👑' : '🎮'} {b.slot} · {b.start_date} → {b.end_date}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) { .cd-detail-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
