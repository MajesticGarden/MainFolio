import React from 'react';

const headerColStyle = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '10px',
  letterSpacing: '0.08em',
  color: 'rgba(255,255,255,0.7)',
  lineHeight: 1.4,
  textTransform: 'uppercase',
};

export default function Footer({ time, isMoving, onOpenContact }) {
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
        <button
          onClick={onOpenContact}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.08em',
            color: 'white',
            cursor: 'pointer',
            textAlign: 'left',
            textTransform: 'uppercase',
            borderBottom: '1px dashed rgba(255,255,255,0.6)',
            marginBottom: '4px',
            display: 'inline-block',
          }}
          onMouseEnter={(e) => (e.target.style.borderBottom = '1px solid white')}
          onMouseLeave={(e) => (e.target.style.borderBottom = '1px dashed rgba(255,255,255,0.6)')}
        >
          GET IN TOUCH [FORM]
        </button>
        <br />
        <a 
          href="mailto:hello@momovahed.com" 
          style={{ 
            color: 'rgba(255,255,255,0.7)', 
            textDecoration: 'none', 
            transition: 'all 0.3s',
            borderBottom: '1px solid transparent'
          }}
          onMouseEnter={e => {
            e.target.style.borderBottom = '1px solid white';
            e.target.style.color = 'white';
          }}
          onMouseLeave={e => {
            e.target.style.borderBottom = '1px solid transparent';
            e.target.style.color = 'rgba(255,255,255,0.7)';
          }}
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
