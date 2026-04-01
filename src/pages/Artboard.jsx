import React, { useRef, useEffect, useState, useCallback } from 'react';
// Smooth-drag: all pan writes are scheduled through rAF so we never force
// a layout recalc mid-gesture (fixs the "jerky" feeling).
import FollowCursor from '../components/FollowCursor';
import galleryImages from '../data/gallery.js';

const CELL = 440; // Double the size (440px)
const COLS = 14;  // grid columns (wider for separation)

// Individual image item component
// Individual image item component
// Individual image item component
function ArtboardItem({ img, isMono }) {
  return (
    <div
      className="artboard-item"
      style={{
        width: '100%',
        height: '550px', // Uniform height
        marginBottom: '8px', // 1/5th of previous 40px
        overflow: 'hidden',
        background: '#111',
        position: 'relative',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)',
        pointerEvents: 'none',
        flexShrink: 0
      }}
    >
      <img
        src={`/gallery/${encodeURIComponent(img.file)}`}
        alt=""
        draggable={false}
        className="gallery-img-parallax"
        style={{
          width: '100%',
          height: '110%', // slightly taller for internal parallax
          objectFit: 'cover',
          display: 'block',
          pointerEvents: 'none',
          willChange: 'transform',
          filter: isMono ? 'grayscale(100%) contrast(1.1)' : 'none',
          transition: 'filter 0.5s ease'
        }}
      />
      {/* Soft Edge Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        boxShadow: 'inset 0 0 60px 20px #0a0a0a',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

const allImages = galleryImages;

// Split images into columns
const columnData = Array.from({ length: COLS }, (_, colIndex) => {
  return allImages.filter((_, i) => i % COLS === colIndex);
});

const columnMultipliers = [0.85, 1.1, 0.95, 1.05, 0.9, 1.15, 1.0, 0.8, 1.2, 0.9, 1.0, 1.1, 0.95, 1.05];

// Calculate loop boundaries
const GAP = 6; // 1/5th of previous 30px
const TILE_W = COLS * (CELL + GAP);
// For height, we'll approximate based on average image rows or measure
// But for a generic solution, we'll wrap at a large enough value or measure the column's scrollHeight

const headerColStyle = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '9px',
  letterSpacing: '0.08em',
  color: 'rgba(255,255,255,0.7)',
  lineHeight: 1.4,
  textTransform: 'uppercase',
};

function NavButton({ text }) {
  return (
    <button style={{
      background: 'white',
      border: 'none',
      color: 'black',
      padding: '4px 12px',
      fontFamily: "'Space Mono', monospace",
      fontSize: '10px',
      fontWeight: 700,
      cursor: 'pointer',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    }}>
      {text}
    </button>
  );
}

export default function Artboard() {
  const canvasRef = useRef(null);
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour12: false }));

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [isMono, setIsMono] = useState(false);

  // Pan state stored in a ref so pointer events never read stale closures
  const pan = useRef({ x: -CELL * 2, y: -CELL * 1 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  // rAF handle — we only ever want one pending frame at a time
  const rafId = useRef(null);
  // Velocity for momentum scrolling
  const velocity = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const momentumRaf = useRef(null);

  const applyPan = useCallback(() => {
    if (rafId.current !== null) return; 
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      if (canvasRef.current) {
        const columns = canvasRef.current.querySelectorAll('.parallax-column');
        
        // Wrap X
        const wrappedX = ((pan.current.x % TILE_W) + TILE_W) % TILE_W - TILE_W;

        columns.forEach((col, idx) => {
          const mult = columnMultipliers[idx % columnMultipliers.length];
          // Each column has 3 vertical sets rendered. One set's height is scrollHeight / 3.
          const colHeightTotal = col.scrollHeight || 3000;
          const oneSetH = colHeightTotal / 3;
          
          // Wrap Y precisely at one unit height
          const wrappedY = ((pan.current.y * mult % oneSetH) + oneSetH) % oneSetH - oneSetH;

          col.style.transform = `translate3d(${wrappedX}px, ${wrappedY}px, 0)`;
          
          // Internal image parallax - wrap the offset to avoid "drifting" out of bounds
          const imgs = col.querySelectorAll('.gallery-img-parallax');
          imgs.forEach((img) => {
            // The image is 110% height (605px) in a 550px container. Wiggle room is 55px.
            // We wrap the parallax offset within a reasonable range to match the scroll loops.
            const wiggle = 55;
            const internalOffset = ((pan.current.y * 0.05 % wiggle) + wiggle) % wiggle - (wiggle / 2);
            img.style.transform = `translate3d(0, ${internalOffset}px, 0)`;
          });
        });
      }
    });
  }, []);

  // ---- Pointer drag (works for mouse AND touch) ----
  const onPointerDown = useCallback((e) => {
    // Ignore clicks on interactive elements
    if (e.target.closest('button, a')) return;
    // Cancel any momentum still running
    if (momentumRaf.current) cancelAnimationFrame(momentumRaf.current);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    // Seed lastPos so the first velocity sample is accurate
    lastPos.current = { x: e.clientX, y: e.clientY };
    velocity.current = { x: 0, y: 0 };
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.current.x,
      panY: pan.current.y,
    };
    e.currentTarget.classList.add('is-dragging');
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    // Track velocity for momentum
    velocity.current.x = e.clientX - lastPos.current.x;
    velocity.current.y = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    pan.current.x = dragStart.current.panX + dx;
    pan.current.y = dragStart.current.panY + dy;
    applyPan();
  }, [applyPan]);

  const onPointerUp = useCallback((e) => {
    dragging.current = false;
    e.currentTarget.classList.remove('is-dragging');
    // Kick off momentum scroll
    if (momentumRaf.current) cancelAnimationFrame(momentumRaf.current);
    let vx = velocity.current.x * 0.8; // dampen slightly
    let vy = velocity.current.y * 0.8;
    const FRICTION = 0.92;
    const MIN_V = 0.3;
    const step = () => {
      vx *= FRICTION;
      vy *= FRICTION;
      if (Math.abs(vx) < MIN_V && Math.abs(vy) < MIN_V) return;
      pan.current.x += vx;
      pan.current.y += vy;
      applyPan();
      momentumRaf.current = requestAnimationFrame(step);
    };
    momentumRaf.current = requestAnimationFrame(step);
  }, [applyPan]);

  // ---- Trackpad / mouse wheel ----
  const onWheel = useCallback((e) => {
    e.preventDefault();
    pan.current.x -= e.deltaX;
    pan.current.y -= e.deltaY;
    applyPan();
  }, [applyPan]);

  // Attach wheel with { passive: false } so preventDefault works
  useEffect(() => {
    const el = document.getElementById('artboard-root');
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // Set initial position
  useEffect(() => {
    applyPan();
  }, [applyPan]);


  return (
    <div
      id="artboard-root"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        cursor: 'none',
        touchAction: 'none',
        userSelect: 'none',
        position: 'relative',
        background: '#0a0a0a',
      }}
    >
      <FollowCursor />

      {/* ---- Multi-Column Draggable Canvas (Looping) ---- */}
      <div
        ref={canvasRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          display: 'flex', gap: `${GAP}px`, 
          padding: '0' // removed padding to make modulo calculation simpler
        }}
      >
        {/* We render 3 horizontal sets to cover looping edges seamlessly */}
        {[0, 1, 2].map((setIdx) => (
          <React.Fragment key={setIdx}>
            {columnData.map((colItems, colIdx) => (
              <div 
                key={`${setIdx}-${colIdx}`} 
                className="parallax-column"
                style={{ 
                  width: `${CELL}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  willChange: 'transform',
                  flexShrink: 0
                }}
              >
                {/* Render 3 vertical sets for seamless looping coverage */}
                {[0, 1, 2].map(vSet => (
                  <div key={vSet} style={{ display: 'flex', flexDirection: 'column' }}>
                    {colItems.map((img, i) => (
                      <ArtboardItem key={`${vSet}-${i}`} img={img} isMono={isMono} />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* ---- Cinematic Vertical Vignette (Blur Fade) ---- */}
      <div style={{
          position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, #0a0a0a 0%, transparent 15%, transparent 85%, #0a0a0a 100%)',
          backdropFilter: 'blur(4px) brightness(1.1)',
          maskImage: 'linear-gradient(to bottom, black, transparent 15%, transparent 85%, black)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 15%, transparent 85%, black)'
      }} />

      {/* ---- Top Navigation / Header Panel ---- */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%',
        padding: '28px 24px', zIndex: 100, pointerEvents: 'none',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', maxWidth: '85%' }}>
          {/* Col 1 */}
          <div style={headerColStyle}>
            BASED IN GLASGOW,<br />WORKING GLOBALLY.<br />
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>{time} BST</span>
          </div>
          {/* Col 2 */}
          <div style={headerColStyle}>
            (MY.EXPERTISE)<br /><br />
            PORTRAITS<br />
            WEDDING<br />
            RETOUCHING<br />
            DRONES
          </div>
          {/* Col 3 */}
          <div style={headerColStyle}>
            (SOCIAL.CONTACTS)<br /><br />
            INSTAGRAM<br />
            LINKEDIN<br />
            CONTACTS
          </div>
          {/* Col 4 */}
          <div style={{ ...headerColStyle, maxWidth: 360, lineHeight: 1.2 }}>
            MO MOVAHED IS A PHOTOGRAPHER CAPTURING RAW EMOTION AND CINEMATIC MOMENTS. SPECIALIZING IN PORTRAITS, WEDDINGS, AND AERIAL DRONE PHOTOGRAPHY WITH A DISTINCT BRUTALIST AESTHETIC.
          </div>
        </div>

        {/* Top Right Links */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, pointerEvents: 'auto' }}>
          <div onClick={() => setIsMono(!isMono)} style={{ cursor: 'pointer' }}>
            <NavButton text={isMono ? "COLOR MODE" : "MONO MODE"} />
          </div>
          <NavButton text="THE ARCHIVE" />
          <NavButton text="THE PROFILE" />
          <div style={{ ...headerColStyle, fontSize: '8px', color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>SCROLL OR DRAG</div>
        </div>
      </div>

      {/* ---- Bottom Integrated Branding ---- */}
      <div style={{
        position: 'fixed', bottom: 40, left: 24, zIndex: 100, pointerEvents: 'none',
        fontFamily: "'Anton', sans-serif", fontSize: 'clamp(40px, 8vw, 120px)',
        color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', lineHeight: 0.8,
        letterSpacing: '-0.02em'
      }}>
        MO MOVAHED
      </div>


    </div>
  );
}
