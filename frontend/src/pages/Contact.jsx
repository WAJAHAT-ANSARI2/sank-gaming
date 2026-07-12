import React, { useState } from 'react';
import { sendContactMessage } from '../api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await sendContactMessage(form);
      setSuccess('Message sent! We will contact you soon.');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container section">

        {/* Hero banner */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontFamily: 'Orbitron', fontSize: 'clamp(1.5rem, 5vw, 3rem)', background: 'linear-gradient(135deg, var(--neon-purple), var(--neon-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.8rem' }}>
            Contact Us
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Sawalon ke liye, ya game book karne ke baad humse rabta karein
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }} className="contact-grid">

          {/* Left: About + Social */}
          <div>
            {/* About */}
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.1rem', color: 'var(--neon-purple)', marginBottom: '1rem' }}>
                🎮 About SANK GAMING
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                SANK GAMING Pakistan ka ek trusted CD aur Digital Game rental store hai. Hum PS4, PS5, Xbox aur PC games rent pe dete hain — lowest prices pe, ghar tak delivery ke saath. Hamara maqsad hai ke gaming sab ke liye accessible ho.
              </p>
              <div style={{ marginTop: '1.2rem', padding: '1rem', background: 'var(--bg-card2)', borderRadius: '8px', borderLeft: '3px solid var(--neon-purple)' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>📍 Location: Karachi, Pakistan</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>⏰ Hours: 10am – 10pm (Daily)</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>📧 sank.gaming@outlook.com</p>
              </div>
            </div>

            {/* Social Media */}
            <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.1rem', color: 'var(--neon-cyan)', marginBottom: '1.2rem' }}>
                📱 Social Media
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <a href="https://www.instagram.com/sinkintheworldofgaming?igsh=MWlyYTU4YW41cnpobA==" target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.2rem', background: 'var(--bg-card2)', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text-white)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#e1306c'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <span style={{ fontSize: '1.5rem' }}>📸</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Instagram</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>@sinkintheworldofgaming</div>
                  </div>
                </a>

                <a href="https://www.facebook.com/sankgamings" target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.2rem', background: 'var(--bg-card2)', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text-white)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#1877f2'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <span style={{ fontSize: '1.5rem' }}>👥</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Facebook</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>facebook.com/sankgamings</div>
                  </div>
                </a>

                <a href="https://wa.me/923212115181" target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.2rem', background: 'var(--bg-card2)', borderRadius: '8px', border: '1px solid var(--border)', color: 'var(--text-white)', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#25d366'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <span style={{ fontSize: '1.5rem' }}>💬</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>WhatsApp</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>0321-2115181</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Payment Numbers */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.1rem', color: 'var(--neon-purple)', marginBottom: '1.2rem' }}>
                💳 Payment Numbers
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(168,85,247,0.1)', borderRadius: '8px', border: '1px solid rgba(168,85,247,0.3)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--neon-purple)', marginBottom: '0.3rem' }}>JazzCash</div>
                  <div style={{ color: 'var(--text-white)', fontSize: '1.1rem', fontFamily: 'Orbitron' }}>0321-2115181</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>NAJAM ALSAQAB KHAN</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(6,182,212,0.1)', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.3)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--neon-cyan)', marginBottom: '0.3rem' }}>EasyPaisa</div>
                  <div style={{ color: 'var(--text-white)', fontSize: '1.1rem', fontFamily: 'Orbitron' }}>0321-2115181</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>NAJAM ALSAQAB KHAN</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="card" style={{ padding: '2rem', alignSelf: 'start' }}>
            <h2 style={{ fontFamily: 'Orbitron', fontSize: '1.1rem', color: 'var(--neon-cyan)', marginBottom: '1.5rem' }}>
              ✉️ Send Us a Message
            </h2>

            {success && <div className="alert alert-success">{success}</div>}
            {error   && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input required type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ali Khan" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
              </div>
              <div className="form-group">
                <label>Phone (optional)</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0321-2115181" />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Apna sawal ya feedback yahan likhein..." />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Sending...' : '📨 Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
