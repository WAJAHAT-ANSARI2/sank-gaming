import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCDs } from '../api';

const platformEmojis = { 'PS5': '🎮', 'PS4': '🎮', 'Xbox': '🕹️', 'PC': '💻', 'Nintendo': '🎯' };

export default function Browse() {
  const [cds, setCds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const search = searchParams.get('search') || '';
  const platform = searchParams.get('platform') || '';
  const genre = searchParams.get('genre') || '';

  useEffect(() => {
    setLoading(true);
    getCDs({ search, platform, genre })
      .then(res => setCds(res.data.cds))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, platform, genre]);

  const updateFilter = (key, value) => {
    const params = Object.fromEntries(searchParams);
    if (value) params[key] = value; else delete params[key];
    setSearchParams(params);
  };

  return (
    <div className="page">
      <div className="container section">
        <h2 className="section-title">Browse Games</h2>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={e => updateFilter('search', e.target.value)}
            style={{
              flex: '1 1 250px', padding: '0.7rem 1rem', background: 'var(--bg-card2)',
              border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-white)'
            }}
          />
          <select value={platform} onChange={e => updateFilter('platform', e.target.value)}
            style={{ padding: '0.7rem 1rem', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-white)' }}>
            <option value="">🎮 All Platforms</option>
            <option value="PS5">🎮 PS5</option>
            <option value="PS4">🎮 PS4</option>
            <option value="Xbox">🕹️ Xbox</option>
            <option value="PC">💻 PC</option>
          </select>
          <select value={genre} onChange={e => updateFilter('genre', e.target.value)}
            style={{ padding: '0.7rem 1rem', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-white)' }}>
            <option value="">All Genres</option>
            <option value="Action">Action</option>
            <option value="Sports">Sports</option>
            <option value="Shooter">Shooter</option>
            <option value="RPG">RPG</option>
          </select>
          <select value={searchParams.get('game_type') || ''} onChange={e => updateFilter('game_type', e.target.value)}
            style={{ padding: '0.7rem 1rem', background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-white)' }}>
            <option value="">💿💾 All Types</option>
            <option value="disc">💿 Disc Only</option>
            <option value="digital">💾 Digital Only</option>
          </select>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : cds.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>
            No games found matching your search.
          </p>
        ) : (
          <div className="cd-grid">
            {cds.map(cd => (
              <div key={cd.id} className="card cd-card" onClick={() => navigate(`/cd/${cd.id}`)}>
                <div className="cd-card-img">
                  {cd.image
                    ? <img src={cd.image} alt={cd.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span>{platformEmojis[cd.platform] || '💿'}</span>
                  }
                </div>
                <div className="cd-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <div className="cd-card-platform">{cd.platform} · {cd.genre}</div>
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '99px', background: cd.game_type === 'digital' ? 'rgba(6,182,212,0.15)' : 'rgba(168,85,247,0.15)', color: cd.game_type === 'digital' ? 'var(--neon-cyan)' : 'var(--neon-purple)' }}>
                      {cd.game_type === 'digital' ? '💾 Digital' : '💿 Disc'}
                    </span>
                  </div>
                  <div className="cd-card-title">{cd.title}</div>
                  <div className="cd-card-price">Rs. {Number(cd.price_per_day).toLocaleString()} / day</div>
                  <div className="cd-card-availability">
                    {cd.game_type === 'digital'
                      ? cd.available_now > 0
                        ? <span className="available">✓ {cd.available_now} slot(s) available</span>
                        : <span className="unavailable">✗ Both slots booked</span>
                      : cd.available_now > 0
                        ? <span className="available">✓ {cd.available_now} copies available</span>
                        : <span className="unavailable">✗ Currently unavailable</span>
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
