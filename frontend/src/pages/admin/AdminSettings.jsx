import React, { useEffect, useRef, useState } from 'react';
import { getSettings, updateSettings } from '../../api';
import API from '../../api';

export default function AdminSettings() {
  const [form, setForm]       = useState({ jazzcash_number:'', jazzcash_name:'', easypaisa_number:'', easypaisa_name:'' });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  // Video states
  const [video, setVideo]           = useState(null);
  const [uploading, setUploading]   = useState(false);
  const [videoMsg, setVideoMsg]     = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    getSettings().then(res => {
      const s = res.data.settings;
      setForm({ jazzcash_number:s.jazzcash_number||'', jazzcash_name:s.jazzcash_name||'', easypaisa_number:s.easypaisa_number||'', easypaisa_name:s.easypaisa_name||'' });
    }).finally(() => setLoading(false));

    // Load current video
    fetch('http://localhost/backend/api/admin/video.php', {
      headers: { Authorization: `Bearer ${localStorage.getItem('sg_token')}` }
    }).then(r=>r.json()).then(d=>{ if(d.video) setVideo(d.video); }).catch(()=>{});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSuccess(''); setError('');
    try { await updateSettings(form); setSuccess('Settings updated!'); }
    catch { setError('Failed to update'); }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true); setVideoMsg('');
    try {
      const fd = new FormData(); fd.append('video', file);
      const res = await API.post('/admin/video.php', fd, { headers:{ 'Content-Type':'multipart/form-data' } });
      if (res.data.success) {
        setVideoMsg('✅ Video uploaded successfully!');
        fetch('http://localhost/backend/api/admin/video.php', { headers:{ Authorization:`Bearer ${localStorage.getItem('sg_token')}` } })
          .then(r=>r.json()).then(d=>{ if(d.video) setVideo(d.video); });
      }
    } catch { setVideoMsg('❌ Upload failed. Check file size/type.'); }
    finally { setUploading(false); e.target.value=''; }
  };

  const handleDeleteVideo = async () => {
    if (!window.confirm('Delete banner video?')) return;
    await API.delete('/admin/video.php');
    setVideo(null); setVideoMsg('Video deleted.');
  };

  if (loading) return <div className="spinner"/>;

  return (
    <div>
      <h2 className="section-title">Settings</h2>

      {/* ── Banner Video ── */}
      <div className="card" style={{ padding:'1.5rem', marginBottom:'2rem', maxWidth:'500px' }}>
        <h3 style={{ fontFamily:'Orbitron', fontSize:'0.95rem', color:'var(--neon-purple)', marginBottom:'0.5rem' }}>
          🎬 Homepage Banner Video
        </h3>
        <p style={{ color:'var(--text-muted)', fontSize:'0.85rem', marginBottom:'1rem' }}>
          Ye video homepage ke search page ke right side mein loop chalegi. (MP4, max ~100MB)
        </p>

        {videoMsg && (
          <div className={`alert ${videoMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`} style={{marginBottom:'1rem'}}>
            {videoMsg}
          </div>
        )}

        {video ? (
          <div>
            <video
              src={video.url} controls muted
              style={{ width:'100%', borderRadius:'8px', marginBottom:'1rem', border:'1px solid var(--border)', maxHeight:'220px', objectFit:'cover' }}
            />
            <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', marginBottom:'1rem' }}>
              📁 {video.original_name}
            </p>
            <div style={{ display:'flex', gap:'0.8rem' }}>
              <button className="btn btn-secondary" onClick={()=>fileRef.current.click()} disabled={uploading}>
                {uploading ? 'Uploading...' : '🔄 Replace Video'}
              </button>
              <button className="btn btn-danger" onClick={handleDeleteVideo}>🗑️ Delete</button>
            </div>
          </div>
        ) : (
          <div style={{ border:'2px dashed var(--border)', borderRadius:'8px', padding:'2rem', textAlign:'center' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'0.8rem' }}>🎬</div>
            <p style={{ color:'var(--text-muted)', marginBottom:'1.2rem', fontSize:'0.9rem' }}>
              Koi video upload nahi hai
            </p>
            <button className="btn btn-primary" onClick={()=>fileRef.current.click()} disabled={uploading}>
              {uploading ? '⏳ Uploading...' : '+ Upload Video'}
            </button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/ogg" style={{display:'none'}} onChange={handleVideoUpload}/>
      </div>

      {/* ── Payment Settings ── */}
      {success && <div className="alert alert-success">{success}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth:'500px' }}>
        <div className="card" style={{ padding:'1.5rem', marginBottom:'1.5rem' }}>
          <h3 style={{ fontFamily:'Orbitron', fontSize:'0.95rem', color:'var(--neon-purple)', marginBottom:'1rem' }}>📱 JazzCash</h3>
          <div className="form-group">
            <label>JazzCash Number</label>
            <input value={form.jazzcash_number} onChange={e=>setForm({...form,jazzcash_number:e.target.value})} placeholder="0321-2115181"/>
          </div>
          <div className="form-group">
            <label>Account Name</label>
            <input value={form.jazzcash_name} onChange={e=>setForm({...form,jazzcash_name:e.target.value})} placeholder="NAJAM ALSAQAB KHAN"/>
          </div>
        </div>

        <div className="card" style={{ padding:'1.5rem', marginBottom:'1.5rem' }}>
          <h3 style={{ fontFamily:'Orbitron', fontSize:'0.95rem', color:'var(--neon-cyan)', marginBottom:'1rem' }}>💚 EasyPaisa</h3>
          <div className="form-group">
            <label>EasyPaisa Number</label>
            <input value={form.easypaisa_number} onChange={e=>setForm({...form,easypaisa_number:e.target.value})} placeholder="0321-2115181"/>
          </div>
          <div className="form-group">
            <label>Account Name</label>
            <input value={form.easypaisa_name} onChange={e=>setForm({...form,easypaisa_name:e.target.value})} placeholder="NAJAM ALSAQAB KHAN"/>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">Save Payment Settings</button>
      </form>
    </div>
  );
}
