import React, { useState } from 'react';

const headerColStyle = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '10px',
  letterSpacing: '0.08em',
  color: 'rgba(255,255,255,0.7)',
  lineHeight: 1.4,
  textTransform: 'uppercase',
};

function NavButton({ text, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? '#0a0a0a' : 'white',
        border: '1px solid white',
        color: hover ? 'white' : 'black',
        padding: '12px 28px',
        fontFamily: "'Space Mono', monospace",
        fontSize: '13px',
        fontWeight: 700,
        cursor: 'pointer',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hover ? '0 0 35px rgba(255,255,255,0.5)' : '0 8px 30px rgba(0,0,0,0.5)',
        transform: hover ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </button>
  );
}

export default function Footer({ isMono, setIsMono, time, isMoving, onOpenGallery }) {
  return (
    <>
      {/* Left Pod: Info & Studio Details */}
      <div 
        className="footer-pod-left"
        style={{
          background: isMoving ? 'rgba(10,10,10,0.95)' : 'rgba(10,10,10,0.65)',
          backdropFilter: isMoving ? 'none' : 'blur(24px) saturate(1.8)',
          WebkitBackdropFilter: isMoving ? 'none' : 'blur(24px) saturate(1.8)',
        }}
      >
        <div style={headerColStyle}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px', letterSpacing: '0.3em' }}>(GLASGOW/UK)</span><br />
          BASED LOCALLY,<br />WORKING GLOBALLY.
        </div>
        <div style={{ ...headerColStyle, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '40px' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px', letterSpacing: '0.3em' }}>(MY.EXPERTISE)</span><br />
          PORTRAITS / WEDDINGS<br />
          RETOUCHING / DRONES
        </div>
        <div style={{ ...headerColStyle, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '40px' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px', letterSpacing: '0.3em' }}>(CONNECT)</span><br />
          GET IN TOUCH<br />
          <a 
            href="mailto:hello@momovahed.com" 
            style={{ 
              color: 'white', 
              textDecoration: 'none', 
              transition: 'all 0.3s',
              borderBottom: '1px solid transparent'
            }}
            onMouseEnter={e => e.target.style.borderBottom = '1px solid white'}
            onMouseLeave={e => e.target.style.borderBottom = '1px solid transparent'}
          >
            HELLO@MOMOVAHED.COM
          </a>
        </div>
      </div>

      {/* Right Pod: Action Toggle & HUD */}
      <div className="footer-pod-right">
        <button 
          onClick={onOpenGallery} 
          className="portfolio-link-btn"
          style={{ width: '100%', textAlign: 'center' }}
        >
          High Res Gallery
        </button>
        <NavButton text={isMono ? 'COLOR' : 'B&W'} onClick={() => setIsMono(m => !m)} />
        <div 
          className="footer-hud-hint"
          style={{ 
            ...headerColStyle, 
            fontSize: '11px',
            color: 'rgba(255,255,255,0.3)', 
            letterSpacing: '0.22em',
            transition: 'all 0.5s ease',
            opacity: isMoving ? 0.1 : 0.6
          }}
        >
          SCROLL OR DRAG TO EXPLORE
        </div>
      </div>
    </>
  );
}
