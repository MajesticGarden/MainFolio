import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import FollowCursor from '../components/FollowCursor';
import galleryImages from '../data/gallery.js';
import Footer from '../components/Footer';
import HeaderNav from '../components/HeaderNav';
import PhotoLightbox from '../components/PhotoLightbox';
import ContactModal from '../components/ContactModal';

// ─── Constants ───────────────────────────────────────────────────────────────
const CELL   = 440;
const COLS   = 14;
const GAP    = 10;
const TILE_W = COLS * (CELL + GAP);
const columnMultipliers = [0.85, 1.1, 0.95, 1.05, 0.9, 1.15, 1.0, 0.8, 1.2, 0.9, 1.0, 1.1, 0.95, 1.05];
const H_SETS = 2;
const V_SETS = 2;

const columnData = Array.from({ length: COLS }, (_, ci) =>
  galleryImages.filter((_, i) => i % COLS === ci)
);

// ─── ArtboardItem ────────────────────────────────────────────────────────────
const ArtboardItem = React.memo(function ArtboardItem({ file, isMono, index }) {
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const exif = useMemo(() => {
    const isos = [100, 400, 800, 1600];
    const shutters = ['1/125', '1/250', '1/500', '1/1000'];
    const lenses = ['24MM', '35MM', '50MM', '85MM'];
    const aperture = ['f/1.4', 'f/1.8', 'f/2.8', 'f/4.0'];
    return {
      frame: String((index % 99) + 1).padStart(3, '0'),
      iso: isos[index % isos.length],
      shutter: shutters[index % shutters.length],
      lens: lenses[index % lenses.length],
      aperture: aperture[index % aperture.length],
    };
  }, [index]);

  return (
    <div
      className="artboard-item"
      data-file={file}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        height: '550px',
        marginBottom: '10px',
        overflow: 'hidden',
        background: '#121210',
        position: 'relative',
        border: hovered ? '1px solid rgba(200, 90, 50, 0.55)' : '1px solid rgba(243, 240, 232, 0.08)',
        pointerEvents: 'auto',
        cursor: 'pointer',
        flexShrink: 0,
        contain: 'paint layout',
        transition: 'border-color 0.35s ease',
      }}
    >
      <img
        className="gallery-img-parallax"
        src={`/thumbs/${encodeURIComponent(file)}`}
        alt={`Mo Movahed Frame ${exif.frame}`}
        draggable={false}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          if (!e.currentTarget.dataset.retried) {
            e.currentTarget.dataset.retried = 'true';
            e.currentTarget.src = `/gallery/${encodeURIComponent(file)}`;
          }
        }}
        style={{
          width: '100%',
          height: '112%',
          objectFit: 'cover',
          display: 'block',
          pointerEvents: 'none',
          willChange: 'transform',
          opacity: loaded ? 1 : 0,
          filter: isMono ? 'grayscale(100%) contrast(1.08)' : 'none',
          transition: 'opacity 0.4s ease, filter 0.4s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: hovered
            ? 'translate3d(0, var(--img-parallax, 0px), 0) scale(1.03)'
            : 'translate3d(0, var(--img-parallax, 0px), 0) scale(1)',
        }}
      />

      {/* Subtle Film Edge Frame Counter */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 25,
          pointerEvents: 'none',
          padding: '3px 7px',
          background: 'rgba(11, 11, 10, 0.62)',
          fontFamily: "'Space Mono', monospace",
          fontSize: '9px',
          letterSpacing: '0.14em',
          color: hovered ? '#c85a32' : 'rgba(243, 240, 232, 0.55)',
          transition: 'color 0.3s ease',
        }}
      >
        {exif.frame}A
      </div>

      {/* Editorial EXIF HUD on Hover */}
      <div
        style={{
          position: 'absolute',
          bottom: '14px',
          left: '14px',
          right: '14px',
          zIndex: 30,
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '9px 12px',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(8px)',
          background: 'rgba(11, 11, 10, 0.84)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(243, 240, 232, 0.14)',
          textTransform: 'uppercase',
          fontFamily: "'Space Mono', monospace",
          fontSize: '9px',
          color: '#f3f0e8',
          letterSpacing: '0.14em',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ color: '#c85a32' }}>{exif.lens}</span>
          <span style={{ opacity: 0.3 }}>/</span>
          <span>{exif.aperture}</span>
        </div>
        <div>{exif.shutter}s</div>
        <div style={{ opacity: 0.6 }}>ISO {exif.iso}</div>
      </div>
    </div>
  );
});

// ─── Main Component ──────────────────────────────────────────────────────────
export default function Artboard({ onOpenGallery, isMono: controlledMono, setIsMono: setControlledMono }) {
  const canvasRef   = useRef(null);
  const colRefs     = useRef([]);
  const colHeights  = useRef([]);
  const pan         = useRef({ x: -CELL * 2, y: -CELL * 1 });
  const dragging    = useRef(false);
  const dragStart   = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const rafId       = useRef(null);
  const velocity    = useRef({ x: 0, y: 0 });
  const lastPos     = useRef({ x: 0, y: 0 });
  const momentumRaf = useRef(null);

  const [activePhoto, setActivePhoto] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [internalMono, setInternalMono] = useState(false);

  const isMono = controlledMono !== undefined ? controlledMono : internalMono;
  const setIsMono = setControlledMono || setInternalMono;

  const [isMoving, setIsMoving] = useState(false);
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour12: false })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    colRefs.current = Array.from(canvasRef.current.querySelectorAll('.parallax-column'));

    const measure = () => {
      colHeights.current = colRefs.current.map((col) => (col.scrollHeight || 3000) / V_SETS);
    };

    requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const applyPan = useCallback(() => {
    if (rafId.current !== null) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      if (!canvasRef.current) return;
      const wrappedX = ((pan.current.x % TILE_W) + TILE_W) % TILE_W - TILE_W;
      const pY = pan.current.y;

      const cols = colRefs.current;
      const heights = colHeights.current;

      for (let idx = 0; idx < cols.length; idx++) {
        const col = cols[idx];
        const mult = columnMultipliers[idx % columnMultipliers.length];
        const oneSetH = heights[idx] || 3000;
        const wrappedY = (((pY * mult) % oneSetH) + oneSetH) % oneSetH - oneSetH;
        col.style.transform = `translate3d(${wrappedX}px, ${wrappedY}px, 0)`;
      }

      const wiggle = 65;
      const internalOffset = (((pY * 0.045) % wiggle) + wiggle) % wiggle - wiggle / 2;
      canvasRef.current.style.setProperty('--img-parallax', `${internalOffset}px`);
    });
  }, []);

  const onPointerDown = useCallback((e) => {
    if (e.target.closest('button, a, dialog, .brand-masthead')) return;
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

    const dist = Math.hypot(e.clientX - dragStart.current.x, e.clientY - dragStart.current.y);
    if (dist < 6) {
      const itemEl = document.elementFromPoint(e.clientX, e.clientY)?.closest('.artboard-item');
      if (itemEl && itemEl.dataset.file) {
        setActivePhoto(itemEl.dataset.file);
        setIsMoving(false);
        return;
      }
    }

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
        touchAction: 'none',
        userSelect: 'none',
        position: 'relative',
        background: '#0b0b0a',
      }}
    >
      <FollowCursor />

      {/* Draggable Infinite Canvas */}
      <div
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'flex',
          gap: `${GAP}px`,
        }}
      >
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
                  contain: 'layout style',
                }}
              >
                {Array.from({ length: V_SETS }, (_, vSet) => (
                  <div key={vSet} style={{ display: 'flex', flexDirection: 'column' }}>
                    {colItems.map((img, i) => (
                      <ArtboardItem
                        key={`${vSet}-${i}`}
                        index={i}
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

      {/* Subtle Top & Bottom Cinema Edge */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(11,11,10,0.82) 0%, transparent 11%, transparent 89%, rgba(11,11,10,0.86) 100%)',
        }}
      />

      <HeaderNav
        isMono={isMono}
        setIsMono={setIsMono}
        onOpenGallery={onOpenGallery}
      />

      <Footer
        time={time}
        isMoving={isMoving}
        onOpenContact={() => setIsContactOpen(true)}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Editorial Masthead */}
      <div
        className="brand-glitch brand-masthead"
        onClick={onOpenGallery}
        title="Enter Editorial Stories & Monograph"
        style={{
          position: 'fixed',
          top: 28,
          left: 24,
          zIndex: 110,
          pointerEvents: 'auto',
          background: 'rgba(11, 11, 10, 0.72)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(243, 240, 232, 0.12)',
          padding: '14px 20px',
        }}
      >
        <div
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 'clamp(28px, 3.6vw, 48px)',
            fontWeight: 400,
            color: '#f3f0e8',
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
          }}
        >
          Mo Movahed
        </div>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.18em',
            color: 'rgba(243, 240, 232, 0.62)',
            textTransform: 'uppercase',
            marginTop: '7px',
          }}
        >
          CINEMATIC PHOTOGRAPHY &amp; ART DIRECTION · ENTER STORIES →
        </div>
      </div>

      <PhotoLightbox
        photo={activePhoto}
        allPhotos={galleryImages}
        onClose={() => setActivePhoto(null)}
        onSelectPhoto={setActivePhoto}
        isMono={isMono}
      />
    </div>
  );
}
