import React, { useRef, useEffect, useState, useCallback } from 'react';
import FollowCursor from '../components/FollowCursor';
import galleryImages from '../data/gallery.js';

// ─── Constants ───────────────────────────────────────────────────────────────
const CELL    = 440;   // column width (px)
const COLS    = 14;    // number of visible columns
const GAP     = 6;     // gap between columns (px)
const TILE_W  = COLS * (CELL + GAP); // width of one full horizontal tile

const columnMultipliers = [0.85, 1.1, 0.95, 1.05, 0.9, 1.15, 1.0, 0.8, 1.2, 0.9, 1.0, 1.1, 0.95, 1.05];

// We render 2 horizontal tiles + 3 vertical sets inside each column.
// 2 tiles is enough to hide the seam on any viewport (TILE_W ~= 6.3k px).
const H_SETS = 2;
const V_SETS = 2; // Reduced from 3 to cut node count by 33% (still seamless)

// Distribute images across columns
const columnData = Array.from({ length: COLS }, (_, ci) =>
  galleryImages.filter((_, i) => i % COLS === ci)
);

// ─── Static styles (defined outside component = zero re-creation per render) ──
const headerColStyle = {
  fontFamily: "'Space Mono', monospace",
  fontSize: '9px',
  letterSpacing: '0.08em',
  color: 'rgba(255,255,255,0.7)',
  lineHeight: 1.4,
  textTransform: 'uppercase',
};

// ─── ArtboardItem ─────────────────────────────────────────────────────────────
// Pure, memo-wrapped so it never re-renders unless props change.
// Images point to /thumbs/ (optimized ≤350 KB JPEG) instead of full /gallery/.
// ArtboardItem points to /thumbs/ and uses a CSS variable for parallax.
// It also uses IntersectionObserver to only render the <img> when near the viewport.
const ArtboardItem = React.memo(function ArtboardItem({ file, isMono }) {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect(); // Once in view, we keep it rendered
      }
    }, {
      rootMargin: '400px', // Start loading 400px before it hits the viewport
      threshold: 0.01,
    });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: '550px',
        marginBottom: '8px',
        overflow: 'hidden',
        background: '#0d0d0d', // Slightly darker placeholder
        position: 'relative',
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)',
        pointerEvents: 'none',
        flexShrink: 0,
        contain: 'strict', // isolated paint/layout context
      }}
    >
      {inView && (
        <img
          className="gallery-img-parallax"
          src={`/thumbs/${encodeURIComponent(file)}`}
          alt=""
          draggable={false}
          loading="lazy"   // double-down on performance
          decoding="async" // prevent main thread block during decode
          style={{
            width: '100%',
            height: '112%', // extra height for parallax headroom
            objectFit: 'cover',
            display: 'block',
            pointerEvents: 'none',
            willChange: 'transform',
            // Use CSS Variable for parallax — 1 update per frame instead of 700!
            transform: 'translate3d(0, var(--img-parallax, 0px), 0)',
            filter: isMono ? 'grayscale(100%) contrast(1.1)' : 'none',
            transition: 'filter 0.5s ease',
          }}
        />
      )}
      {/* Soft Edge Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        boxShadow: 'inset 0 0 60px 20px #0a0a0a',
        pointerEvents: 'none',
      }} />
    </div>
  );
});

// ─── NavButton ────────────────────────────────────────────────────────────────
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
        fontSize: '14px',
        fontWeight: 700,
        cursor: 'pointer',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hover ? '0 0 25px rgba(255,255,255,0.4)' : '0 4px 15px rgba(0,0,0,0.3)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {text}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Artboard() {
  const canvasRef   = useRef(null);
  const colRefs     = useRef([]);   // direct refs to each .parallax-column node
  const imgRefs     = useRef([]);   // flat list of all .gallery-img-parallax nodes
  const colHeights  = useRef([]);   // cached scrollHeight / V_SETS per column
  const heightsReady = useRef(false);

  const pan         = useRef({ x: -CELL * 2, y: -CELL * 1 });
  const dragging    = useRef(false);
  const dragStart   = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const rafId       = useRef(null);
  const velocity    = useRef({ x: 0, y: 0 });
  const lastPos     = useRef({ x: 0, y: 0 });
  const momentumRaf = useRef(null);

  const [isMono, setIsMono]   = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [time, setTime]       = useState(() =>
    new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour12: false })
  );

  // Live clock — low-frequency, fine as state update
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Cache column DOM refs once after mount ──────────────────────────────────
  // Avoids querySelectorAll on every rAF tick.
  useEffect(() => {
    if (!canvasRef.current) return;
    colRefs.current = Array.from(canvasRef.current.querySelectorAll('.parallax-column'));
    imgRefs.current = Array.from(canvasRef.current.querySelectorAll('.gallery-img-parallax'));

    // We need actual scrollHeight — wait one rAF so layout is painted
    requestAnimationFrame(() => {
      colHeights.current = colRefs.current.map(col => (col.scrollHeight || 3000) / V_SETS);
      heightsReady.current = true;
    });
  }, []); // runs once — DOM structure never changes

  // ── applyPan — the hot loop ─────────────────────────────────────────────────
  // Reads only from refs (no state, no DOM queries).
  // All writes are batched inside one rAF — zero forced-layout.
  const applyPan = useCallback(() => {
    if (rafId.current !== null) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;

      const wrappedX = ((pan.current.x % TILE_W) + TILE_W) % TILE_W - TILE_W;
      const pY = pan.current.y;

      const cols = colRefs.current;
      const heights = colHeights.current;

      for (let idx = 0; idx < cols.length; idx++) {
        const col = cols[idx];
        const mult = columnMultipliers[idx % columnMultipliers.length];
        const oneSetH = heights[idx] || 3000;

        const wrappedY = ((pY * mult % oneSetH) + oneSetH) % oneSetH - oneSetH;
        col.style.transform = `translate3d(${wrappedX}px, ${wrappedY}px, 0)`;
      }

      // Parallax on images — now 1 update per-frame via CSS variable
      // instead of iterating over 700 items!
      const wiggle = 65;
      const internalOffset = ((pY * 0.045 % wiggle) + wiggle) % wiggle - (wiggle / 2);
      canvasRef.current.style.setProperty('--img-parallax', `${internalOffset}px`);
    });
  }, []);

  // ── Pointer handlers ────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e) => {
    if (e.target.closest('button, a')) return;
    if (momentumRaf.current) cancelAnimationFrame(momentumRaf.current);
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    setIsMoving(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
    velocity.current = { x: 0, y: 0 };
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.current.x, panY: pan.current.y };
    e.currentTarget.classList.add('is-dragging');
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    velocity.current.x = e.clientX - lastPos.current.x;
    velocity.current.y = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    pan.current.x = dragStart.current.panX + (e.clientX - dragStart.current.x);
    pan.current.y = dragStart.current.panY + (e.clientY - dragStart.current.y);
    applyPan();
  }, [applyPan]);

  const onPointerUp = useCallback((e) => {
    dragging.current = false;
    e.currentTarget.classList.remove('is-dragging');
    if (momentumRaf.current) cancelAnimationFrame(momentumRaf.current);
    let vx = velocity.current.x * 0.8;
    let vy = velocity.current.y * 0.8;
    const FRICTION = 0.92;
    const MIN_V = 0.3;
    const step = () => {
      vx *= FRICTION;
      vy *= FRICTION;
      if (Math.abs(vx) < MIN_V && Math.abs(vy) < MIN_V) {
        setIsMoving(false);
        return;
      }
      pan.current.x += vx;
      pan.current.y += vy;
      applyPan();
      momentumRaf.current = requestAnimationFrame(step);
    };
    momentumRaf.current = requestAnimationFrame(step);
  }, [applyPan]);

  // ── Wheel handler — passive-false so preventDefault works ──────────────────
  const onWheel = useCallback((e) => {
    e.preventDefault();
    pan.current.x -= e.deltaX;
    pan.current.y -= e.deltaY;
    applyPan();
  }, [applyPan]);

  useEffect(() => {
    const el = document.getElementById('artboard-root');
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // Initial position
  useEffect(() => { applyPan(); }, [applyPan]);

  // ─── Render ───────────────────────────────────────────────────────────────
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

      {/* ── Draggable Canvas ─────────────────────────────────────────────── */}
      <div
        ref={canvasRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          display: 'flex', gap: `${GAP}px`,
        }}
      >
        {/* H_SETS horizontal tiles for seamless horizontal loop */}
        {Array.from({ length: H_SETS }, (_, hSet) => (
          <React.Fragment key={hSet}>
            {columnData.map((colItems, colIdx) => (
              <div
                key={`${hSet}-${colIdx}`}
                className="parallax-column"
                style={{
                  width: `${CELL}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  willChange: 'transform',
                  flexShrink: 0,
                  contain: 'layout style', // isolate paint
                }}
              >
                {/* V_SETS vertical copies for seamless vertical loop */}
                {Array.from({ length: V_SETS }, (_, vSet) => (
                  <div key={vSet} style={{ display: 'flex', flexDirection: 'column' }}>
                    {colItems.map((img, i) => (
                      <ArtboardItem
                        key={`${vSet}-${i}`}
                        file={img.file}
                        isMono={isMono}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* ── Vertical Vignette ─────────────────────────────────────────────── */}
      {/* No backdropFilter here — pure gradient, zero GPU stacking cost */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, #0a0a0a 0%, transparent 12%, transparent 88%, #0a0a0a 100%)',
      }} />

      {/* ── Header / Nav Panel ────────────────────────────────────────────── */}
      {/* backdropFilter only on a small static panel — not toggled, not the full viewport */}
      <div style={{
        position: 'fixed', bottom: '16px', left: '16px', right: '16px',
        padding: '24px', zIndex: 100, pointerEvents: 'none',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        background: isMoving ? 'rgba(10,10,10,0.92)' : 'rgba(10,10,10,0.75)',
        backdropFilter: isMoving ? 'none' : 'blur(16px) saturate(1.2)',
        WebkitBackdropFilter: isMoving ? 'none' : 'blur(16px) saturate(1.2)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        boxShadow: '0 -4px 30px rgba(0, 0, 0, 0.5)',
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '60px', maxWidth: '85%' }}>
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
          {/* Col 4 */}
          <div style={{ ...headerColStyle, maxWidth: 360, lineHeight: 1.2 }}>
            MO MOVAHED IS A PHOTOGRAPHER CAPTURING RAW EMOTION AND CINEMATIC MOMENTS. SPECIALIZING IN PORTRAITS, WEDDINGS, AND AERIAL DRONE PHOTOGRAPHY WITH A DISTINCT BRUTALIST AESTHETIC.
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, pointerEvents: 'auto' }}>
          <NavButton text={isMono ? 'SEE IN COLOR' : 'SEE IN B&W'} onClick={() => setIsMono(m => !m)} />
          <div style={{ ...headerColStyle, fontSize: '8px', color: 'rgba(255,255,255,0.3)', marginTop: 8 }}>
            SCROLL OR DRAG
          </div>
        </div>
      </div>

      {/* ── Branding ─────────────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: 40, left: 24, zIndex: 110, pointerEvents: 'none',
        fontFamily: "'Anton', sans-serif",
        fontSize: 'clamp(20px, 4vw, 60px)',
        color: 'rgba(255,255,255,0.8)',
        textTransform: 'uppercase',
        lineHeight: 0.8,
        letterSpacing: '-0.02em',
        willChange: 'transform',
      }}>
        MO MOVAHED
      </div>
    </div>
  );
}
