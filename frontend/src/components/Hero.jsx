import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

import p1 from '../assets/games/p1.jpg';
import p2 from '../assets/games/p2.jpg';
import p3 from '../assets/games/p3.jpg';
import p4 from '../assets/games/p4.jpg';
import p5 from '../assets/games/p5.jpg';
import p6 from '../assets/games/p6.jpg';
import p7 from '../assets/games/p7.jpg';
import p8 from '../assets/games/p8.jpg';

const GAMES = [
  { src:p1, label:'AC VALHALLA',    meta:'PS5 · Action RPG' },
  { src:p2, label:'SPIDER-MAN MM',  meta:'PS5 · Action'     },
  { src:p3, label:"DEMON'S SOULS",  meta:'PS5 · RPG'        },
  { src:p4, label:'THE LAST OF US', meta:'PS5 · Adventure'  },
  { src:p5, label:'COD MW3',        meta:'PS5 · FPS'        },
  { src:p6, label:'FIFA 23',        meta:'PS5 · Sports'     },
  { src:p7, label:'GTA V',          meta:'PS4 · Open World' },
  { src:p8, label:'GHOST OF YOTEI', meta:'PS5 · Action'     },
];

/* canvas bg particles */
function useCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    const resize = () => { c.width=window.innerWidth; c.height=window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const COLS=['#ff0040','#cc00ff','#0044ff','#ff3366','#9900ff'];
    const pts = Array.from({length:60},()=>({
      x:Math.random()*window.innerWidth, y:Math.random()*window.innerHeight,
      r:Math.random()*1.4+0.3, c:COLS[Math.floor(Math.random()*5)],
      vx:(Math.random()-0.5)*0.22, vy:(Math.random()-0.5)*0.22, o:Math.random()*0.45+0.12,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0,0,c.width,c.height);
      pts.forEach(p=>{ ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=p.c; ctx.globalAlpha=p.o; ctx.fill(); ctx.globalAlpha=1; p.x+=p.vx; p.y+=p.vy; if(p.x<0)p.x=c.width; if(p.x>c.width)p.x=0; if(p.y<0)p.y=c.height; if(p.y>c.height)p.y=0; });
      raf=requestAnimationFrame(draw);
    };
    draw();
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener('resize',resize); };
  },[]);
  return ref;
}

/* ── PAGE 1 RIGHT: Orbit + Controller ── */
function OrbitWithController() {
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const tickRef  = useRef(0);

  useEffect(() => {
    const RINGS = [
      { idx:[0,1,2,3], rx:148, ry:94,  spd: 0.007 },
      { idx:[4,5,6,7], rx:212, ry:136, spd:-0.005 },
    ];
    const CX=265, CY=245;
    let raf;
    const tick = () => {
      RINGS.forEach(ring => {
        ring.idx.forEach((ci,i) => {
          const card = cardRefs.current[ci]; if (!card) return;
          const angle = tickRef.current * ring.spd + (i/ring.idx.length)*Math.PI*2;
          const x = CX + Math.cos(angle)*ring.rx;
          const y = CY + Math.sin(angle)*ring.ry;
          const depth = 1-(Math.sin(angle)+1)/2;
          const W=90, H=120;
          card.style.left      = (x-W/2)+'px';
          card.style.top       = (y-H/2)+'px';
          card.style.opacity   = 0.38+depth*0.62;
          card.style.zIndex    = Math.round(depth*20)+1;
          card.style.transform = `rotate(${-Math.cos(angle)*22}deg) scale(${0.58+depth*0.52})`;
          card.style.filter    = `brightness(${0.48+depth*0.56})`;
        });
      });
      tickRef.current++;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf);
  },[]);

  return (
    <div className="oc-stage" ref={stageRef}>
      <svg className="oc-svg" viewBox="0 0 530 490">
        <ellipse cx="265" cy="245" rx="146" ry="92" fill="none" stroke="rgba(204,0,255,0.22)" strokeWidth="1.5" strokeDasharray="6,10"
          style={{animation:'rA 18s linear infinite',transformOrigin:'265px 245px'}}/>
        <ellipse cx="265" cy="245" rx="210" ry="134" fill="none" stroke="rgba(255,0,64,0.15)" strokeWidth="1" strokeDasharray="4,14"
          style={{animation:'rB 26s linear infinite',transformOrigin:'265px 245px'}}/>
        <ellipse cx="265" cy="245" rx="82" ry="50" fill="none" stroke="rgba(0,85,255,0.12)" strokeWidth="1" strokeDasharray="3,18"
          style={{animation:'rA 13s linear infinite reverse',transformOrigin:'265px 245px'}}/>
      </svg>
      {GAMES.map((g,i)=>(
        <div key={i} className="oc-card" ref={el=>cardRefs.current[i]=el} style={{width:90,height:120}}>
          <img src={g.src} alt={g.label} draggable={false}/>
          <div className="card-shine"/><div className="card-rim"/>
        </div>
      ))}
      <div className="ctrl-center">
        <div className="ctrl-glow"/>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/DualSense_controller.png/800px-DualSense_controller.png"
          alt="PS5 DualSense" className="ctrl-img"
          onError={e=>{e.target.style.opacity='0';}}
        />
      </div>
    </div>
  );
}

/* ── PAGE 2 CENTER-LEFT: Search bar with orbit rings + game covers ── */
function SearchWithOrbit() {
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const tickRef  = useRef(0);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const RINGS = [
      { idx:[0,1,2,3], rx:175, ry:110, spd: 0.007 },
      { idx:[4,5,6,7], rx:250, ry:158, spd:-0.005 },
    ];
    const CX=310, CY=300;
    let raf;
    const tick = () => {
      RINGS.forEach(ring => {
        ring.idx.forEach((ci,i) => {
          const card = cardRefs.current[ci]; if (!card) return;
          const angle = tickRef.current * ring.spd + (i/ring.idx.length)*Math.PI*2;
          const x = CX + Math.cos(angle)*ring.rx;
          const y = CY + Math.sin(angle)*ring.ry;
          const depth = 1-(Math.sin(angle)+1)/2;
          const W=78, H=105;
          card.style.left      = (x-W/2)+'px';
          card.style.top       = (y-H/2)+'px';
          card.style.opacity   = 0.35+depth*0.65;
          card.style.zIndex    = Math.round(depth*15)+1;
          card.style.transform = `rotate(${-Math.cos(angle)*20}deg) scale(${0.55+depth*0.52})`;
          card.style.filter    = `brightness(${0.42+depth*0.62})`;
        });
      });
      tickRef.current++;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(raf);
  },[]);

  const handleSubmit = e => {
    e.preventDefault();
    navigate(`/browse?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="so-stage" ref={stageRef}>
      {/* Rotating rings */}
      <svg className="oc-svg" viewBox="0 0 620 600">
        <ellipse cx="310" cy="300" rx="173" ry="108" fill="none" stroke="rgba(204,0,255,0.22)" strokeWidth="1.5" strokeDasharray="6,10"
          style={{animation:'rA 18s linear infinite',transformOrigin:'310px 300px'}}/>
        <ellipse cx="310" cy="300" rx="248" ry="156" fill="none" stroke="rgba(255,0,64,0.15)" strokeWidth="1" strokeDasharray="4,14"
          style={{animation:'rB 26s linear infinite',transformOrigin:'310px 300px'}}/>
        <ellipse cx="310" cy="300" rx="95" ry="58" fill="none" stroke="rgba(0,85,255,0.12)" strokeWidth="1" strokeDasharray="3,18"
          style={{animation:'rA 13s linear infinite reverse',transformOrigin:'310px 300px'}}/>
      </svg>

      {/* Game covers rotating */}
      {GAMES.map((g,i)=>(
        <div key={i} className="oc-card so-card" ref={el=>cardRefs.current[i]=el} style={{width:78,height:105}}>
          <img src={g.src} alt={g.label} draggable={false}/>
          <div className="card-shine"/><div className="card-rim"/>
        </div>
      ))}

      {/* Center: search bar */}
      <div className="so-center">
        <p className="bs-eyebrow">⚡ FIND YOUR GAME</p>
        <h2 className="so-heading">SEARCH YOUR<br/><span>NEXT GAME</span></h2>
        <p className="so-sub">50+ titles · Lowest prices · Home delivery</p>

        <form onSubmit={handleSubmit} className="so-form">
          <input
            type="text" className="so-input"
            placeholder="Search — FIFA, COD, GTA V..."
            value={search}
            onChange={e=>setSearch(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" className="so-btn">
            <svg viewBox="0 0 32 22" width="24" height="17" fill="none">
              <path d="M4 10Q3 4 7 2Q11 0 16 0Q21 0 25 2Q29 4 28 10L27 16Q26 20 22 21L18 22Q16 22 14 22L10 21Q6 20 5 16Z" fill="white" opacity="0.95"/>
              <path d="M5 13Q2 15 2 19Q2 22 5 22Q8 22 9 19L9 15Z" fill="white" opacity="0.85"/>
              <path d="M27 13Q30 15 30 19Q30 22 27 22Q24 22 23 19L23 15Z" fill="white" opacity="0.85"/>
              <rect x="8" y="8" width="2.5" height="7" rx="1" fill="rgba(0,0,0,0.5)"/>
              <rect x="6" y="10" width="6.5" height="2.5" rx="1" fill="rgba(0,0,0,0.5)"/>
              <circle cx="24" cy="7" r="1.8" fill="#22c55e"/>
              <circle cx="21" cy="10" r="1.8" fill="#cc44ff"/>
              <circle cx="27" cy="10" r="1.8" fill="#ff4444"/>
              <circle cx="24" cy="13" r="1.8" fill="#4488ff"/>
            </svg>
            <span>SEARCH</span>
          </button>
        </form>

        <div className="glow-line"/>

        <div className="so-tags">
          {['FIFA 23','GTA V','COD MW3','Spider-Man','Ghost of Yotei','Last of Us'].map(t=>(
            <span key={t} className="so-tag"
              onClick={()=>navigate(`/browse?search=${encodeURIComponent(t)}`)}>
              {t}
            </span>
          ))}
        </div>

        <div className="so-btns">
          <button className="hbtn-p" onClick={()=>navigate('/browse')}>ALL GAMES</button>
          <button className="hbtn-s" onClick={()=>navigate('/contact')}>CONTACT</button>
        </div>
      </div>
    </div>
  );
}

/* ── PAGE 2 RIGHT: Video Banner ── */
function VideoBanner() {
  const [url, setUrl] = useState(null);
  useEffect(()=>{
    fetch('http://localhost/backend/api/admin/video.php')
      .then(r=>r.json())
      .then(d=>{ if(d.video) setUrl(d.video.url); })
      .catch(()=>{});
  },[]);

  return (
    <div className="vb-wrap">
      {url ? (
        <div className="vb-box">
          <video src={url} autoPlay loop muted playsInline className="vb-video"/>
          <div className="vb-overlay"/>
          <div className="vb-label">
            <div className="vb-title">⚡ LATEST GAME</div>
            <div className="vb-sub">Now Available for Rent</div>
          </div>
        </div>
      ) : (
        <div className="vb-box vb-ph">
          <div className="vb-ph-inner">
            <div style={{fontSize:'3rem',marginBottom:'12px'}}>🎬</div>
            <div className="vb-ph-title">Latest Game Video</div>
            <div className="vb-ph-sub">Admin Dashboard → Settings<br/>se video upload karein.<br/>Yahan continuously chalegi.</div>
          </div>
          {/* Decorative rings behind placeholder */}
          <div className="vb-ring r1"/>
          <div className="vb-ring r2"/>
          <div className="vb-ring r3"/>
        </div>
      )}
    </div>
  );
}

/* Animated SANK GAMING title */
function BigTitle() {
  let d=0;
  return (
    <div className="big-title">
      {[
        {text:'SANK',   sz:'clamp(52px,6.2vw,92px)', gr:'linear-gradient(135deg,#ff0040,#cc00ff,#0055ff)'},
        {text:'GAMING', sz:'clamp(36px,4.4vw,66px)',  gr:'linear-gradient(135deg,#cc00ff,#0055ff)'},
      ].map((row,ri)=>(
        <div key={ri} style={{display:'flex',lineHeight:.94}}>
          {row.text.split('').map((ch,ci)=>{
            const delay=d; d+=0.08;
            return (
              <span key={ci} style={{
                display:'inline-block', fontFamily:'Orbitron,monospace', fontWeight:900, fontSize:row.sz,
                background:row.gr, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
                opacity:0, animation:'charDrop .55s cubic-bezier(.23,1,.32,1) forwards', animationDelay:`${delay}s`
              }}>{ch}</span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function Hero({ onScrollEnd, onScrollBack }) {
  const navigate       = useNavigate();
  const [page,setPage] = useState(0);
  const [busy,setBusy] = useState(false);
  const canvasRef = useCanvas();
  const pageRef   = useRef(0);
  const busyRef   = useRef(false);

  useEffect(()=>{
    const onWheel=e=>{
      if(busyRef.current) { e.preventDefault(); return; }
      if(Math.abs(e.deltaY)<20) return;
      e.preventDefault();

      if(e.deltaY>30 && pageRef.current===0){
        busyRef.current=true; pageRef.current=1; setPage(1);
        setTimeout(()=>{ busyRef.current=false; },950);
      } else if(e.deltaY>30 && pageRef.current===1 && onScrollEnd){
        setTimeout(()=>onScrollEnd(),100);
      } else if(e.deltaY<-30 && pageRef.current===1){
        busyRef.current=true; pageRef.current=0; setPage(0);
        setTimeout(()=>{ busyRef.current=false; },950);
      } else if(e.deltaY<-30 && pageRef.current===0 && onScrollBack){
        onScrollBack();
      }
    };
    window.addEventListener('wheel',onWheel,{passive:false});
    return()=>window.removeEventListener('wheel',onWheel);
  },[onScrollEnd,onScrollBack]);

  return (
    <div className="hero-root">
      <canvas ref={canvasRef} className="hero-canvas"/>
      <div className="hero-grid"/>
      <div className="hero-radial"/>

      {/* ═══ PAGE 1 ═══ */}
      <div className={`hero-page ${page===0?'pg-show':'pg-hide-up'}`}>
        <div className="pg-left">
          <div className="eyebrow"><span className="eline"/>PREMIUM DISC RENTAL</div>
          <BigTitle/>
          <div className="sub-zone">GAMING ZONE</div>
          <p className="pg-desc">Karachi ka <strong>sabse sank</strong> disc hub.<br/>PS5 · PS4 · Blu-ray — ek jagah.<br/>Rent karo, khelo, jito! 🎮</p>
          <div className="pg-btns">
            <button className="hbtn-p" onClick={()=>navigate('/browse')}>⚡ RENT NOW</button>
            <button className="hbtn-s" onClick={()=>navigate('/browse')}>BROWSE COLLECTION</button>
          </div>
          <div className="pg-stats">
            <div className="ps"><span className="ps-n">500+</span><span className="ps-l">Games</span></div>
            <div className="ps bd"><span className="ps-n">24/7</span><span className="ps-l">Open</span></div>
            <div className="ps bd"><span className="ps-n">Rs.99</span><span className="ps-l">From</span></div>
          </div>
          <div className="pg-pills">
            {['PS5','PS4','Action','Sports','RPG','FPS'].map(p=>(
              <span key={p} className="ppill" onClick={()=>navigate(`/browse?platform=${p}`)}>{p}</span>
            ))}
          </div>
          <div className="pg-hint" onClick={()=>setPage(1)}>
            <span>SEARCH GAMES</span><div className="arr-dn"/>
          </div>
        </div>
        <div className="pg-right-full">
          <OrbitWithController/>
        </div>
      </div>

      {/* ═══ PAGE 2 ═══ */}
      <div className={`hero-page pg2-layout ${page===1?'pg-show':'pg-hide-dn'}`}>
        {/* LEFT — search orbit (rings + game covers + search bar center) */}
        <div className="pg2-left">
          <SearchWithOrbit/>
        </div>
        {/* RIGHT — video */}
        <div className="pg2-right">
          <VideoBanner/>
        </div>
      </div>

      {/* Nav dots */}
      <div className="nav-dots">
        <div className={`ndot${page===0?' ndot-a':''}`} onClick={()=>setPage(0)}/>
        <div className={`ndot${page===1?' ndot-a':''}`} onClick={()=>setPage(1)}/>
      </div>
    </div>
  );
}
