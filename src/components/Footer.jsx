import React from 'react';

const headerColStyle = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '10px',
  letterSpacing: '0.08em',
  color: 'rgba(255,255,255,0.7)',
  lineHeight: 1.4,
  textTransform: 'uppercase',
};

export default function Footer({ time, isMoving }) {
  return (
    <div 
      className="footer-pod-left"
      style={{
        background: isMoving ? 'rgba(10,10,10,0.95)' : 'rgba(10,10,10,0.65)',
        backdropFilter: isMoving ? 'none' : 'blur(24px) saturate(1.8)',
        WebkitBackdropFilter: isMoving ? 'none' : 'blur(24px) saturate(1.8)',
      }}
    >
      <div style={headerColStyle}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px', letterSpacing: '0.3em' }}>(GLASGOW/UK {time})</span><br />
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
      <div style={{ ...headerColStyle, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '40px', opacity: isMoving ? 0.2 : 0.6 }}>
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px', letterSpacing: '0.3em' }}>(NAVIGATE)</span><br />
        DRAG OR SCROLL<br />
        TAP TO EXPAND
      </div>
    </div>
  );
}
