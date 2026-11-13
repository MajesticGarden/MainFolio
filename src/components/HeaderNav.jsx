import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HeaderNav({ isMono, setIsMono, onOpenGallery }) {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);
  const [isDesktopWide, setIsDesktopWide] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1120 : true
  );

  useEffect(() => {
    const onResize = () => setIsDesktopWide(window.innerWidth >= 1120);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const glassBtnBase = {
    fontFamily: "'Space Mono', monospace",
    fontSize: '10px',
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    padding: '11px 16px',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
  };

  return (
    <nav
      aria-label="Primary Portfolio Controls"
      style={{
        position: 'fixed',
        top: '28px',
        right: '24px',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'auto',
      }}
    >
      {/* Desktop Quick-Entry Links for Key Client Segments */}
      {isDesktopWide && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(11, 11, 10, 0.76)',
            border: '1px solid rgba(243, 240, 232, 0.12)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        >
          {[
            { id: 'weddings', label: 'Weddings', path: '/weddings' },
            { id: 'portraits', label: 'Portraits', path: '/portraits' },
          ].map((item, idx) => {
            const hovered = hoveredId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderLeft: idx > 0 ? '1px solid rgba(243, 240, 232, 0.1)' : 'none',
                  color: hovered ? '#c85a32' : 'rgba(243, 240, 232, 0.68)',
                  padding: '11px 14px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '10px',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Primary CTA: Enter Editorial Monograph & High-Res Archive */}
      <button
        onClick={onOpenGallery}
        onMouseEnter={() => setHoveredId('gallery')}
        onMouseLeave={() => setHoveredId(null)}
        style={{
          ...glassBtnBase,
          background: hoveredId === 'gallery' ? '#c85a32' : '#f3f0e8',
          border: hoveredId === 'gallery' ? '1px solid #c85a32' : '1px solid #f3f0e8',
          color: hoveredId === 'gallery' ? '#ffffff' : '#0b0b0a',
          padding: '11px 20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
          transform: hoveredId === 'gallery' ? 'translateY(-1px)' : 'translateY(0)',
        }}
      >
        <span>Stories &amp; Archive</span>
        <span style={{ fontSize: '11px', lineHeight: 1 }}>↗</span>
      </button>

      {/* Film Stock Toggle (Color / Monochrome) */}
      <button
        onClick={() => setIsMono((m) => !m)}
        onMouseEnter={() => setHoveredId('mono')}
        onMouseLeave={() => setHoveredId(null)}
        title="Switch between Color and Monochrome Film"
        style={{
          ...glassBtnBase,
          background:
            hoveredId === 'mono'
              ? 'rgba(243, 240, 232, 0.12)'
              : 'rgba(11, 11, 10, 0.78)',
          border: isMono
            ? '1px solid rgba(243, 240, 232, 0.42)'
            : '1px solid rgba(243, 240, 232, 0.16)',
          color: '#f3f0e8',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isMono ? '#f3f0e8' : '#c85a32',
            display: 'inline-block',
          }}
        />
        <span>{isMono ? 'B&W' : 'COLOR'}</span>
      </button>

      {/* Thunderbolt Assistant Trigger */}
      <button
        data-thunderbolt-launcher
        onMouseEnter={() => setHoveredId('chat')}
        onMouseLeave={() => setHoveredId(null)}
        aria-label="Open Assistant Chat"
        style={{
          ...glassBtnBase,
          background:
            hoveredId === 'chat'
              ? '#f3f0e8'
              : 'rgba(11, 11, 10, 0.78)',
          border: '1px solid rgba(243, 240, 232, 0.16)',
          color: hoveredId === 'chat' ? '#0b0b0a' : '#f3f0e8',
          padding: '11px 15px',
        }}
      >
        <span style={{ fontSize: '10px', color: hoveredId === 'chat' ? '#0b0b0a' : '#c85a32' }}>
          ⚡
        </span>
        <span>CHAT</span>
      </button>
    </nav>
  );
}
