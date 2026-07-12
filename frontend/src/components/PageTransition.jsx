import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [stage, setStage] = useState('enter');

  useEffect(() => {
    // New page coming in
    setStage('exit');
    const t1 = setTimeout(() => {
      setDisplayChildren(children);
      setStage('enter');
    }, 320);
    return () => clearTimeout(t1);
  }, [location.pathname]);

  return (
    <div
      style={{
        opacity:   stage === 'enter' ? 1 : 0,
        transform: stage === 'enter' ? 'translateY(0) scale(1)' : 'translateY(18px) scale(0.98)',
        transition: 'opacity 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)',
        willChange: 'opacity, transform',
        minHeight: '100vh',
      }}
    >
      {displayChildren}
    </div>
  );
}
