import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import { getCDs } from '../api';

const platformEmojis = { 'PS5':'🎮','PS4':'🎮','Xbox':'🕹️','PC':'💻','Nintendo':'🎯' };

// One full-height slide wrapper
function Slide({ children, bg='#060008' }) {
  return (
    <div style={{
      width:'100%', height:'100vh',
      background: bg,
      display:'flex', flexDirection:'column',
      justifyContent:'center',
      overflow:'hidden',
      flexShrink: 0,
    }}>
      {children}
    </div>
  );
}

export default function Home() {
  const [featuredCDs, setFeaturedCDs]   = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animating, setAnimating]       = useState(false);
  const containerRef = useRef(null);
  const navigate     = useNavigate();
  const HERO_SLIDES  = 2; // Hero has its own 2 internal pages

  useEffect(() => {
    getCDs().then(res => setFeaturedCDs(res.data.cds.slice(0,6))).catch(()=>{});
  },[]);

  // Total slides = Hero(1 unit) + Featured(1) + Why(1) + CTA+Footer(1) = 4
  const TOTAL_SLIDES = 4;

  const slideRef    = useRef(0);
  const busyRef     = useRef(false);

  const goTo = useCallback((idx) => {
    if (busyRef.current) return;
    const clamped = Math.max(0, Math.min(TOTAL_SLIDES - 1, idx));
    if (clamped === slideRef.current) return;
    busyRef.current = true;
    slideRef.current = clamped;
    setCurrentSlide(clamped);
    setTimeout(() => { busyRef.current = false; }, 950);
  }, []);

  // Wheel scroll handler — only for slides 1+ (Hero handles slide 0 internally)
  useEffect(() => {
    const onWheel = (e) => {
      if (slideRef.current === 0) return; // Hero handles internally
      if (busyRef.current) { e.preventDefault(); return; }
      if (Math.abs(e.deltaY) < 20) return;
      e.preventDefault();
      if (e.deltaY > 0) goTo(slideRef.current + 1);
      else              goTo(slideRef.current - 1);
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [goTo]);

  // Hero tells Home when to advance to next slide
  const handleHeroScrollEnd = useCallback(() => {
    goTo(1);
  }, [goTo]);

  const handleHeroScrollBack = useCallback(() => {
    // already at slide 0, nothing to do
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width:'100%', height:'100vh', overflow:'hidden', position:'relative' }}
    >
      {/* All slides stacked, transform moves them */}
      <div style={{
        width: '100%',
        transform: `translateY(${-currentSlide * 100}vh)`,
        transition: 'transform 0.88s cubic-bezier(0.16,1,0.3,1)',
        willChange: 'transform',
      }}>

        {/* SLIDE 0: Hero (manages its own 2 internal pages) */}
        <div style={{ width:'100%', height:'100vh', overflow:'hidden' }}>
          <Hero onScrollEnd={handleHeroScrollEnd} onScrollBack={handleHeroScrollBack}/>
        </div>

        {/* SLIDE 1: Featured Games */}
        <Slide bg="#060008">
          <div style={{ paddingTop:'80px' }}>
            <div className="container section" style={{ paddingTop:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'2rem' }}>
                <div style={{ flex:1, height:'1px', background:'linear-gradient(90deg,transparent,#cc00ff)' }}/>
                <h2 style={{ fontFamily:'Orbitron', fontSize:'clamp(1rem,3vw,1.5rem)', color:'white', whiteSpace:'nowrap' }}>🎮 FEATURED GAMES</h2>
                <div style={{ flex:1, height:'1px', background:'linear-gradient(90deg,#ff0040,transparent)' }}/>
              </div>
              <div className="cd-grid">
                {featuredCDs.map((cd,i) => (
                  <div key={cd.id} className="card cd-card" onClick={() => navigate(`/cd/${cd.id}`)}>
                    <div className="cd-card-img" style={{ position:'relative', overflow:'hidden' }}>
                      {cd.image
                        ? <img src={cd.image} alt={cd.title} style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
                        : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#1a0028,#060008)',fontSize:'3.5rem' }}>
                            {cd.game_type==='digital'?'💾':(platformEmojis[cd.platform]||'💿')}
                          </div>
                      }
                      <div style={{ position:'absolute',top:'0.5rem',left:'0.5rem',background:'rgba(0,0,0,0.8)',border:'1px solid #cc00ff',borderRadius:'4px',padding:'0.15rem 0.5rem',fontSize:'0.7rem',fontFamily:'Orbitron',color:'#cc00ff' }}>{cd.platform}</div>
                      {cd.game_type==='digital' && <div style={{ position:'absolute',top:'0.5rem',right:'0.5rem',background:'rgba(6,182,212,0.2)',border:'1px solid #06b6d4',borderRadius:'4px',padding:'0.15rem 0.5rem',fontSize:'0.65rem',color:'#06b6d4' }}>💾 Digital</div>}
                    </div>
                    <div className="cd-card-body">
                      <div className="cd-card-platform">{cd.genre}</div>
                      <div className="cd-card-title">{cd.title}</div>
                      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'0.6rem' }}>
                        <div className="cd-card-price">Rs. {Number(cd.price_per_day).toLocaleString()}<span style={{ fontSize:'0.75rem',color:'var(--text-muted)' }}>/day</span></div>
                        <div>{cd.available_now>0?<span className="available">✓ Available</span>:<span className="unavailable">✗ Booked</span>}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign:'center',marginTop:'2rem' }}>
                <button className="btn btn-secondary" onClick={() => navigate('/browse')} style={{ letterSpacing:'2px',fontFamily:'Orbitron',fontSize:'0.85rem' }}>
                  VIEW ALL GAMES →
                </button>
              </div>
            </div>
          </div>
        </Slide>

        {/* SLIDE 2: Why SANK GAMING */}
        <Slide bg="#0a000f">
          <div className="container" style={{ padding:'0 1.5rem' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1.5rem' }}>
              <div style={{ flex:1,height:'1px',background:'linear-gradient(90deg,transparent,#cc00ff)' }}/>
              <h2 style={{ fontFamily:'Orbitron',fontSize:'clamp(0.9rem,2.5vw,1.3rem)',color:'white',whiteSpace:'nowrap' }}>⚡ WHY SANK GAMING</h2>
              <div style={{ flex:1,height:'1px',background:'linear-gradient(90deg,#ff0040,transparent)' }}/>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.9rem' }}>
              {[
                { icon:'💰',title:'Lowest Prices',    desc:'Top games from Rs. 99/day',     color:'#ff0040' },
                { icon:'🎮',title:'Huge Collection',  desc:'PS5, PS4, Xbox — all platforms', color:'#cc00ff' },
                { icon:'🛵',title:'Home Delivery',    desc:'CD delivered to your doorstep',  color:'#0055ff' },
                { icon:'💾',title:'Digital Games',    desc:'Primary & Secondary slots',      color:'#cc00ff' },
                { icon:'📅',title:'Flexible Duration',desc:'1 day or an entire month',       color:'#ff0040' },
                { icon:'📱',title:'Easy Payment',     desc:'Cash, JazzCash, EasyPaisa',      color:'#0055ff' },
              ].map(item => (
                <div key={item.title} style={{ background:'#0d000d',border:'1px solid #1a0033',borderRadius:'10px',padding:'1rem',display:'flex',gap:'0.8rem',alignItems:'flex-start',transition:'all 0.3s',cursor:'default' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=item.color; e.currentTarget.style.boxShadow=`0 0 16px ${item.color}33`; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor='#1a0033'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none'; }}
                >
                  <div style={{ fontSize:'1.6rem',lineHeight:1,flexShrink:0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontFamily:'Orbitron',fontSize:'0.75rem',color:item.color,marginBottom:'0.25rem' }}>{item.title}</div>
                    <div style={{ color:'#7788aa',fontSize:'0.8rem',lineHeight:1.4 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Slide>

        {/* SLIDE 3: CTA + Footer */}
        <Slide bg="#060008">
          <div style={{ display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',flex:1,padding:'3rem 0' }}>
            <h2 style={{ fontFamily:'Orbitron',fontSize:'clamp(1.2rem,4vw,2rem)',marginBottom:'0.8rem',textAlign:'center' }}>
              Ready to <span style={{ color:'#ff0040' }}>Game?</span>
            </h2>
            <p style={{ color:'#7788aa',marginBottom:'1.5rem',fontSize:'1.05rem',textAlign:'center' }}>
              Browse collection aur apna favorite game aaj hi rent karo
            </p>
            <div style={{ display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap',marginBottom:'3rem' }}>
              <button className="btn btn-primary" onClick={()=>navigate('/browse')} style={{ fontFamily:'Orbitron',letterSpacing:'1px' }}>🎮 Browse Games</button>
              <button className="btn btn-secondary" onClick={()=>navigate('/contact')} style={{ fontFamily:'Orbitron',letterSpacing:'1px' }}>📞 Contact Us</button>
            </div>

            {/* Footer */}
            <div style={{ borderTop:'1px solid #1a0033',paddingTop:'2rem',textAlign:'center',width:'100%' }}>
              <div style={{ fontFamily:'Orbitron',fontSize:'1rem',marginBottom:'0.5rem',background:'linear-gradient(135deg,#ff0040,#cc00ff,#0055ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>SANK GAMING</div>
              <p style={{ color:'#445566',fontSize:'0.85rem',marginBottom:'0.8rem' }}>Pakistan's Premier CD & Digital Game Rental Store</p>
              <div style={{ display:'flex',gap:'1.5rem',justifyContent:'center',marginBottom:'1rem' }}>
                <a href="https://www.instagram.com/sinkintheworldofgaming" target="_blank" rel="noreferrer" style={{ color:'#445566',fontSize:'1.3rem' }}>📸</a>
                <a href="https://www.facebook.com/sankgamings" target="_blank" rel="noreferrer" style={{ color:'#445566',fontSize:'1.3rem' }}>👥</a>
                <a href="https://wa.me/923212115181" target="_blank" rel="noreferrer" style={{ color:'#445566',fontSize:'1.3rem' }}>💬</a>
              </div>
              <p style={{ color:'#2a1a3a',fontSize:'0.75rem' }}>© 2026 SANK GAMING. All rights reserved.</p>
            </div>
          </div>
        </Slide>
      </div>

      {/* Side navigation dots */}
      <div style={{ position:'fixed',right:'18px',top:'50%',transform:'translateY(-50%)',zIndex:200,display:'flex',flexDirection:'column',gap:'10px' }}>
        {['Hero','Games','Why Us','Contact'].map((label,i) => (
          <div
            key={i}
            title={label}
            onClick={() => { if(i > 0) goTo(i); }}
            style={{
              width: i===currentSlide ? '10px' : '8px',
              height: i===currentSlide ? '10px' : '8px',
              borderRadius:'50%',
              background: i===currentSlide ? '#cc00ff' : 'rgba(150,0,255,0.3)',
              border:'1px solid rgba(150,0,255,0.5)',
              cursor: i===0 ? 'default' : 'pointer',
              transition:'all 0.3s',
              boxShadow: i===currentSlide ? '0 0 10px #cc00ff' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}
