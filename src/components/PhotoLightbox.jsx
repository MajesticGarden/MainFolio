import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

export default function PhotoLightbox({ photo, allPhotos = [], onClose, onSelectPhoto, isMono }) {
  const dialogRef = useRef(null);
  const activeThumbRef = useRef(null);
  const touchStartX = useRef(0);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [lightboxMono, setLightboxMono] = useState(isMono);
  const [showInfo, setShowInfo] = useState(false);

  const currentIndex = allPhotos.findIndex((p) => p.file === photo);
  const hasMultiple = allPhotos.length > 1;

  useEffect(() => {
    setLightboxMono(isMono);
  }, [isMono, photo]);

  // Center active thumbnail in bottom contact-sheet filmstrip
  useEffect(() => {
    if (activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentIndex]);

  // Preload adjacent high-res photographs once current frame settles
  useEffect(() => {
    if (!imageLoaded || !hasMultiple || currentIndex === -1) return;
    const nextFile = allPhotos[(currentIndex + 1) % allPhotos.length]?.file;
    const prevFile = allPhotos[(currentIndex - 1 + allPhotos.length) % allPhotos.length]?.file;
    [nextFile, prevFile].forEach((f) => {
      if (f) {
        const preloader = new Image();
        preloader.src = `/gallery/${encodeURIComponent(f)}`;
      }
    });
  }, [imageLoaded, hasMultiple, currentIndex, allPhotos]);

  // Manage native <dialog> lifecycle
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (photo) {
      setImageLoaded(false);
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }

    const handleBackdropClick = (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (isDialogContent) return;
      onClose();
    };

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', handleBackdropClick);
    }

    const handleCancel = (e) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener('cancel', handleCancel);

    return () => {
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        dialog.removeEventListener('click', handleBackdropClick);
      }
      dialog.removeEventListener('cancel', handleCancel);
    };
  }, [photo, onClose]);

  const goToNext = useCallback(() => {
    if (!hasMultiple || currentIndex === -1) return;
    const nextIdx = (currentIndex + 1) % allPhotos.length;
    setImageLoaded(false);
    onSelectPhoto(allPhotos[nextIdx].file);
  }, [allPhotos, currentIndex, hasMultiple, onSelectPhoto]);

  const goToPrev = useCallback(() => {
    if (!hasMultiple || currentIndex === -1) return;
    const prevIdx = (currentIndex - 1 + allPhotos.length) % allPhotos.length;
    setImageLoaded(false);
    onSelectPhoto(allPhotos[prevIdx].file);
  }, [allPhotos, currentIndex, hasMultiple, onSelectPhoto]);

  // Keyboard shortcuts: Left/Right, I (Info HUD), B (B&W Toggle), Esc
  useEffect(() => {
    if (!photo) return;
    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'Escape') onClose();
      if (e.key.toLowerCase() === 'i') setShowInfo((v) => !v);
      if (e.key.toLowerCase() === 'b') setLightboxMono((m) => !m);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [photo, goToNext, goToPrev, onClose]);

  const plateDetails = useMemo(() => {
    if (!photo) return null;
    const rawRef = photo.replace(/\.[^/.]+$/, '');
    const plateNum = String((currentIndex >= 0 ? currentIndex : 0) + 1).padStart(3, '0');
    let discipline = 'ARCHIVE STUDY';
    if (/Mohammad|portrait|_DSC0[789]|_DSC10|_DSC11|_DSC2[123]/i.test(photo)) {
      discipline = 'EDITORIAL PORTRAITURE';
    } else if (/DSC_|_DSC7|_DSC9|_DSC6/i.test(photo)) {
      discipline = 'DOCUMENTARY WEDDING';
    } else if (/Street|Untitled|_DSC3|_DSC4|_DSC5/i.test(photo)) {
      discipline = 'BRUTALIST STREET & AERIAL';
    }
    return { rawRef, plateNum, discipline };
  }, [photo, currentIndex]);

  if (!photo || !plateDetails) return null;

  const originalUrl = `/gallery/${encodeURIComponent(photo)}`;
  const thumbUrl = `/thumbs/${encodeURIComponent(photo)}`;

  const controlBtnStyle = (active = false) => ({
    background: active ? '#c85a32' : 'rgba(243, 240, 232, 0.06)',
    border: active ? '1px solid #c85a32' : '1px solid rgba(243, 240, 232, 0.18)',
    color: '#f3f0e8',
    padding: '7px 13px',
    fontFamily: "'Space Mono', monospace",
    fontSize: '10px',
    cursor: 'pointer',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    transition: 'all 0.2s ease',
  });

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="lightbox-title"
      style={{
        margin: 'auto',
        padding: 0,
        border: 'none',
        background: 'transparent',
        maxWidth: '100vw',
        maxHeight: '100vh',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        outline: 'none',
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        cursor: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (diff > 50) goToPrev();
        else if (diff < -50) goToNext();
      }}
    >
      {/* Obsidian Darkroom Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(8, 8, 7, 0.96)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          zIndex: 1,
        }}
      />

      {/* Loupe Frame */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px 28px 16px',
          boxSizing: 'border-box',
          pointerEvents: 'none',
        }}
      >
        {/* Top Control Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            pointerEvents: 'auto',
            fontFamily: "'Space Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#f3f0e8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span id="lightbox-title" style={{ fontWeight: 700, color: '#f3f0e8' }}>
              PLATE {plateDetails.plateNum}
            </span>
            <span style={{ color: '#c85a32' }}>// {plateDetails.discipline}</span>
            {currentIndex !== -1 && (
              <span style={{ color: 'rgba(243, 240, 232, 0.45)' }}>
                [{currentIndex + 1} OF {allPhotos.length}]
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => setShowInfo((v) => !v)} style={controlBtnStyle(showInfo)}>
              [I] {showInfo ? 'HIDE SPEC' : 'SPEC'}
            </button>

            <button onClick={() => setLightboxMono((m) => !m)} style={controlBtnStyle(lightboxMono)}>
              [B] {lightboxMono ? 'COLOR' : 'B&W'}
            </button>

            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...controlBtnStyle(false),
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              RAW ↗
            </a>

            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                background: '#f3f0e8',
                color: '#0b0b0a',
                border: 'none',
                padding: '8px 16px',
                fontWeight: 700,
                fontFamily: "'Space Mono', monospace",
                fontSize: '10px',
                cursor: 'pointer',
                letterSpacing: '0.14em',
              }}
            >
              ESC ✕
            </button>
          </div>
        </div>

        {/* Center Optical Stage */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            padding: '12px 0',
            minHeight: 0,
          }}
        >
          {hasMultiple && (
            <button
              onClick={goToPrev}
              aria-label="Previous photograph"
              style={{
                position: 'absolute',
                left: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(11, 11, 10, 0.72)',
                border: '1px solid rgba(243, 240, 232, 0.16)',
                color: '#f3f0e8',
                padding: '16px 15px',
                cursor: 'pointer',
                fontFamily: "'Space Mono', monospace",
                fontSize: '16px',
                zIndex: 10,
                pointerEvents: 'auto',
              }}
            >
              ‹
            </button>
          )}

          <div
            style={{
              position: 'relative',
              maxWidth: '88vw',
              maxHeight: '70vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              pointerEvents: 'auto',
            }}
          >
            {!imageLoaded && (
              <img
                src={thumbUrl}
                alt=""
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  filter: lightboxMono ? 'grayscale(100%) contrast(1.1) blur(8px)' : 'blur(8px)',
                  opacity: 0.85,
                  pointerEvents: 'none',
                }}
              />
            )}

            <img
              src={originalUrl}
              alt={`Mo Movahed Plate ${plateDetails.plateNum}`}
              fetchpriority="high"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                if (!e.currentTarget.dataset.retried) {
                  e.currentTarget.dataset.retried = 'true';
                  e.currentTarget.src = thumbUrl;
                  setImageLoaded(true);
                }
              }}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                display: 'block',
                position: 'relative',
                zIndex: 2,
                boxShadow: '0 24px 80px rgba(0, 0, 0, 0.92)',
                filter: lightboxMono ? 'grayscale(100%) contrast(1.1)' : 'none',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease, filter 0.35s ease',
              }}
            />

            {/* Optional Toggleable Archival Spec Card ([I] Key) */}
            {showInfo && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '14px',
                  left: '14px',
                  zIndex: 12,
                  background: 'rgba(11, 11, 10, 0.9)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(243, 240, 232, 0.18)',
                  padding: '12px 16px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  color: '#f3f0e8',
                  lineHeight: 1.7,
                }}
              >
                <div style={{ color: '#c85a32' }}>ARCHIVE FILE // {plateDetails.rawRef}</div>
                <div>COLLECTION // {plateDetails.discipline}</div>
                <div style={{ opacity: 0.65 }}>EDITION // GLASGOW, UK — SIGNED PRINT AVAILABLE</div>
              </div>
            )}
          </div>

          {hasMultiple && (
            <button
              onClick={goToNext}
              aria-label="Next photograph"
              style={{
                position: 'absolute',
                right: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(11, 11, 10, 0.72)',
                border: '1px solid rgba(243, 240, 232, 0.16)',
                color: '#f3f0e8',
                padding: '16px 15px',
                cursor: 'pointer',
                fontFamily: "'Space Mono', monospace",
                fontSize: '16px',
                zIndex: 10,
                pointerEvents: 'auto',
              }}
            >
              ›
            </button>
          )}
        </div>

        {/* Bottom Contact-Sheet Filmstrip Scrubber */}
        <div style={{ pointerEvents: 'auto' }}>
          {hasMultiple && (
            <div
              style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                padding: '8px 0 6px',
                borderTop: '1px solid rgba(243, 240, 232, 0.1)',
                scrollbarWidth: 'thin',
              }}
            >
              {allPhotos.map((item, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={item.file}
                    ref={isActive ? activeThumbRef : null}
                    onClick={() => {
                      if (!isActive) {
                        setImageLoaded(false);
                        onSelectPhoto(item.file);
                      }
                    }}
                    title={`Jump to Plate ${idx + 1}`}
                    style={{
                      flexShrink: 0,
                      width: '52px',
                      height: '38px',
                      padding: 0,
                      background: '#141412',
                      border: isActive
                        ? '1px solid #c85a32'
                        : '1px solid rgba(243, 240, 232, 0.12)',
                      opacity: isActive ? 1 : 0.42,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      transition: 'opacity 0.2s ease, border-color 0.2s ease',
                    }}
                  >
                    <img
                      src={`/thumbs/${encodeURIComponent(item.file)}`}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        filter: lightboxMono ? 'grayscale(100%)' : 'none',
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: "'Space Mono', monospace",
              fontSize: '9px',
              letterSpacing: '0.14em',
              color: 'rgba(243, 240, 232, 0.42)',
              marginTop: '4px',
            }}
          >
            <span>KEYS: ←/→ NAVIGATE · [I] SPEC · [B] FILM · [ESC] CLOSE</span>
            <span>MO MOVAHED MONOGRAPH</span>
          </div>
        </div>
      </div>
    </dialog>
  );
}
