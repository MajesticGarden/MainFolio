import React, { useState } from 'react';

export default function HeaderNav({ isMono, setIsMono, onOpenGallery }) {
  const [hoverGallery, setHoverGallery] = useState(false);
  const [hoverMono, setHoverMono] = useState(false);
  const [hoverChat, setHoverChat] = useState(false);

  return (
    <nav
      style={{
        position: 'fixed',
        top: '32px',
        right: '28px',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        pointerEvents: 'auto',
      }}
    >
      {/* High Res Gallery Button */}
      <button
        onClick={onOpenGallery}
        onMouseEnter={() => setHoverGallery(true)}
        onMouseLeave={() => setHoverGallery(false)}
        style={{
          background: hoverGallery ? '#0a0a0a' : 'white',
          border: '1px solid white',
          color: hoverGallery ? 'white' : 'black',
          padding: '10px 22px',
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: hoverGallery ? '0 0 35px rgba(255,255,255,0.5)' : '0 8px 30px rgba(0,0,0,0.5)',
          transform: hoverGallery ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)',
          whiteSpace: 'nowrap',
        }}
      >
        High Res Gallery
      </button>

      {/* B&W / Color Toggle */}
      <button
        onClick={() => setIsMono(m => !m)}
        onMouseEnter={() => setHoverMono(true)}
        onMouseLeave={() => setHoverMono(false)}
        style={{
          background: hoverMono ? 'white' : 'rgba(10,10,10,0.75)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          color: hoverMono ? 'black' : 'white',
          padding: '10px 18px',
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: hoverMono ? 'translateY(-2px)' : 'translateY(0)',
          whiteSpace: 'nowrap',
        }}
      >
        {isMono ? 'COLOR' : 'B&W'}
      </button>

      {/* Thunderbolt Assistant Trigger */}
      <button
        data-thunderbolt-launcher
        onMouseEnter={() => setHoverChat(true)}
        onMouseLeave={() => setHoverChat(false)}
        aria-label="Open Assistant Chat"
        style={{
          background: hoverChat ? 'white' : 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: hoverChat ? 'black' : 'white',
          padding: '10px 16px',
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: hoverChat ? 'translateY(-2px)' : 'translateY(0)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span style={{ fontSize: '10px', opacity: 0.8 }}>⚡</span> CHAT
      </button>
    </nav>
  );
}
