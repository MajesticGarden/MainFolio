import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Footer({ time, isMoving, onOpenContact }) {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 900 : false
  );

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const colStyle = {
    fontFamily: "'Space Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.09em',
    color: 'rgba(243, 240, 232, 0.78)',
    lineHeight: 1.55,
    textTransform: 'uppercase',
  };

  const labelStyle = {
    display: 'inline-block',
    color: 'rgba(243, 240, 232, 0.42)',
    fontSize: '8px',
    letterSpacing: '0.22em',
    marginBottom: '4px',
  };

  const dividerStyle = {
    borderLeft: '1px solid rgba(243, 240, 232, 0.11)',
    paddingLeft: isCompact ? '14px' : '28px',
  };

  const inlineRouteBtn = (id, path) => ({
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: "'Space Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.09em',
    color: hoveredItem === id ? '#c85a32' : 'rgba(243, 240, 232, 0.82)',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'color 0.2s ease',
  });

  return (
    <footer
      className="footer-pod-left"
      style={{
        background: isMoving ? 'rgba(11, 11, 10, 0.94)' : 'rgba(11, 11, 10, 0.78)',
        backdropFilter: isMoving ? 'none' : 'blur(20px)',
        WebkitBackdropFilter: isMoving ? 'none' : 'blur(20px)',
        border: '1px solid rgba(243, 240, 232, 0.12)',
        borderRadius: '2px',
        gap: isCompact ? '14px' : '28px',
        padding: isCompact ? '12px 16px' : '18px 26px',
      }}
    >
      {/* 01: Live Glasgow Telemetry */}
      <div style={colStyle}>
        <span style={labelStyle}>
          <span
            style={{
              display: 'inline-block',
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: '#c85a32',
              marginRight: '6px',
              verticalAlign: 'middle',
            }}
          />
          GLASGOW, UK · {time}
        </span>
        <br />
        SCOTLAND &amp; HIGHLANDS
        <br />
        AVAILABLE WORLDWIDE
      </div>

      {/* 02: Clickable Disciplines */}
      <div style={{ ...colStyle, ...dividerStyle }}>
        <span style={labelStyle}>01 // DISCIPLINES</span>
        <br />
        <button
          type="button"
          onClick={() => navigate('/weddings')}
          onMouseEnter={() => setHoveredItem('wed')}
          onMouseLeave={() => setHoveredItem(null)}
          style={inlineRouteBtn('wed')}
        >
          WEDDINGS
        </button>
        {' / '}
        <button
          type="button"
          onClick={() => navigate('/portraits')}
          onMouseEnter={() => setHoveredItem('por')}
          onMouseLeave={() => setHoveredItem(null)}
          style={inlineRouteBtn('por')}
        >
          PORTRAITS
        </button>
        <br />
        <button
          type="button"
          onClick={() => navigate('/street')}
          onMouseEnter={() => setHoveredItem('aer')}
          onMouseLeave={() => setHoveredItem(null)}
          style={inlineRouteBtn('aer')}
        >
          AERIAL DRONE &amp; DIRECTION
        </button>
      </div>

      {/* 03: Direct Booking & Email */}
      <div style={{ ...colStyle, ...dividerStyle }}>
        <span style={labelStyle}>02 // COMMISSIONS</span>
        <br />
        <button
          type="button"
          onClick={onOpenContact}
          onMouseEnter={() => setHoveredItem('inquire')}
          onMouseLeave={() => setHoveredItem(null)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.11em',
            color: hoveredItem === 'inquire' ? '#ffffff' : '#c85a32',
            cursor: 'pointer',
            textAlign: 'left',
            textTransform: 'uppercase',
            borderBottom:
              hoveredItem === 'inquire'
                ? '1px solid #ffffff'
                : '1px solid rgba(200, 90, 50, 0.55)',
            marginBottom: '3px',
            display: 'inline-block',
            transition: 'all 0.2s ease',
          }}
        >
          INQUIRE [OPEN BRIEF] →
        </button>
        <br />
        <a
          href="mailto:hello@momovahed.com"
          onMouseEnter={() => setHoveredItem('mail')}
          onMouseLeave={() => setHoveredItem(null)}
          style={{
            color: hoveredItem === 'mail' ? '#f3f0e8' : 'rgba(243, 240, 232, 0.65)',
            textDecoration: 'none',
            borderBottom:
              hoveredItem === 'mail' ? '1px solid #f3f0e8' : '1px solid transparent',
            transition: 'all 0.2s ease',
          }}
        >
          HELLO@MOMOVAHED.COM
        </a>
      </div>

      {/* 04: Desktop Interaction Telemetry */}
      {!isCompact && (
        <div
          style={{
            ...colStyle,
            ...dividerStyle,
            opacity: isMoving ? 0.3 : 0.62,
            transition: 'opacity 0.25s ease',
          }}
        >
          <span style={labelStyle}>03 // CANVAS</span>
          <br />
          DRAG OR SCROLL
          <br />
          CLICK PLATE FOR LOUPE
        </div>
      )}
    </footer>
  );
}
