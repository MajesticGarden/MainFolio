import React, { useState } from 'react';

const headerColStyle = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '10px', // Reverted from 13px
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
        padding: '12px 32px', // Reverted from 15px 40px
        fontFamily: "'Space Mono', monospace",
        fontSize: '14px', // Reverted from 18px
        fontWeight: 700,
        cursor: 'pointer',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hover ? '0 0 35px rgba(255,255,255,0.5)' : '0 8px 30px rgba(0,0,0,0.5)',
        transform: hover ? 'translateY(-4px) scale(1.02)' : 'translateY(0) scale(1)',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </button>
  );
}

export default function Footer({ isMono, setIsMono, time, isMoving }) {
  return (
    <>
      {/* Left Pod: Info & Branding */}
      <div style={{
        position: 'fixed', bottom: '24px', left: '24px',
        padding: '24px 32px', // Reverted from 30px 40px
        zIndex: 100, pointerEvents: 'auto',
        background: isMoving ? 'rgba(10,10,10,0.95)' : 'rgba(10,10,10,0.65)',
        backdropFilter: isMoving ? 'none' : 'blur(24px) saturate(1.8)',
        WebkitBackdropFilter: isMoving ? 'none' : 'blur(24px) saturate(1.8)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px', // Reverted from 20px
        display: 'flex', gap: '48px', // Reverted from 60px
        boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <div style={headerColStyle}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px', letterSpacing: '0.3em' }}>(GLASGOW/UK)</span><br />
          BASED LOCALLY,<br />WORKING GLOBALLY.
        </div>
        <div style={{ ...headerColStyle, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '48px' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px', letterSpacing: '0.3em' }}>(MY.EXPERTISE)</span><br />
          PORTRAITS / WEDDINGS<br />
          RETOUCHING / DRONES
        </div>
        <div style={{ ...headerColStyle, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '48px' }}>
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
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px',
        zIndex: 100, pointerEvents: 'auto',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16
      }}>
        <NavButton text={isMono ? 'COLOR' : 'B&W'} onClick={() => setIsMono(m => !m)} />
        <div style={{ 
          ...headerColStyle, 
          fontSize: '12px', // Reduced from 16px but still legible
          color: 'rgba(255,255,255,0.3)', 
          letterSpacing: '0.25em',
          transition: 'all 0.5s ease',
          opacity: isMoving ? 0.1 : 0.6
        }}>
          SCROLL OR DRAG TO EXPLORE
        </div>
      </div>
    </>
  );
}
