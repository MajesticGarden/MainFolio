import React, { useEffect, useRef, useState, useCallback } from 'react';

export default function PhotoLightbox({ photo, allPhotos = [], onClose, onSelectPhoto, isMono }) {
  const dialogRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lightboxMono, setLightboxMono] = useState(isMono);
  const touchStartX = useRef(0);

  const currentIndex = allPhotos.findIndex(p => p.file === photo);
  const hasMultiple = allPhotos.length > 1;

  // Sync initial mono mode with parent
  useEffect(() => {
    setLightboxMono(isMono);
  }, [isMono, photo]);

  // Handle open/close with native <dialog>
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

    // Light-dismiss fallback for browsers without closedby support (Safari)
    const handleBackdropClick = (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isDialogContent = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
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

  // Keyboard navigation (Arrow keys + Esc)
  useEffect(() => {
    if (!photo) return;
    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [photo, goToNext, goToPrev, onClose]);

  if (!photo) return null;

  const fileName = photo.replace(/\.[^/.]+$/, "");
  const originalUrl = `/gallery/${encodeURIComponent(photo)}`;
  const thumbUrl = `/thumbs/${encodeURIComponent(photo)}`;

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
        display: 'flex',
        flexDirection: 'column',
      }}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (diff > 50) goToPrev();
        else if (diff < -50) goToNext();
      }}
    >
      {/* Dark Blur Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(5, 5, 5, 0.94)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          zIndex: 1,
        }}
      />

      {/* Main Content Box */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 32px',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}>
        {/* Top Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'auto',
          fontFamily: "'Space Mono', monospace",
          fontSize: '11px',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.8)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span id="lightbox-title" style={{ fontWeight: 700, color: '#fff' }}>
              {fileName}
            </span>
            {currentIndex !== -1 && (
              <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                [{currentIndex + 1} / {allPhotos.length}]
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setLightboxMono(m => !m)}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#fff',
                padding: '6px 14px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '10px',
                cursor: 'pointer',
                letterSpacing: '0.1em',
                transition: 'all 0.2s',
              }}
            >
              {lightboxMono ? 'VIEW IN COLOR' : 'VIEW IN B&W'}
            </button>
            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'rgba(255, 255, 255, 0.6)',
                textDecoration: 'none',
                borderBottom: '1px dotted rgba(255, 255, 255, 0.4)',
                paddingBottom: '2px',
                fontSize: '10px',
              }}
            >
              OPEN RAW ↗
            </a>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                background: 'white',
                color: '#000',
                border: 'none',
                padding: '8px 18px',
                fontWeight: 700,
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                cursor: 'pointer',
                letterSpacing: '0.15em',
                transition: 'transform 0.2s',
              }}
            >
              ESC / CLOSE
            </button>
          </div>
        </div>

        {/* Center Image Container */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          padding: '16px 0',
          minHeight: 0,
        }}>
          {/* Previous Arrow */}
          {hasMultiple && (
            <button
              onClick={goToPrev}
              aria-label="Previous photograph"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                padding: '18px 16px',
                cursor: 'pointer',
                fontFamily: "'Space Mono', monospace",
                fontSize: '16px',
                zIndex: 10,
                pointerEvents: 'auto',
                transition: 'background 0.2s',
              }}
            >
              ‹
            </button>
          )}

          {/* Photograph Element */}
          <div style={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '78vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'auto',
          }}>
            <img
              src={originalUrl}
              alt={fileName}
              fetchpriority="high"
              onLoad={() => setImageLoaded(true)}
              style={{
                maxWidth: '100%',
                maxHeight: '78vh',
                objectFit: 'contain',
                display: 'block',
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.95)',
                filter: lightboxMono ? 'grayscale(100%) contrast(1.15)' : 'none',
                opacity: imageLoaded ? 1 : 0.4,
                transition: 'opacity 0.3s ease, filter 0.4s ease',
              }}
            />
          </div>

          {/* Next Arrow */}
          {hasMultiple && (
            <button
              onClick={goToNext}
              aria-label="Next photograph"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                padding: '18px 16px',
                cursor: 'pointer',
                fontFamily: "'Space Mono', monospace",
                fontSize: '16px',
                zIndex: 10,
                pointerEvents: 'auto',
                transition: 'background 0.2s',
              }}
            >
              ›
            </button>
          )}
        </div>

        {/* Bottom Metadata & Navigation Helper */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'auto',
          fontFamily: "'Space Mono', monospace",
          fontSize: '10px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.45)',
        }}>
          <div>
            SWIPE OR USE ← / → ARROW KEYS TO EXPLORE
          </div>
          <div>
            GLASGOW / GLOBAL ARCHIVE
          </div>
        </div>
      </div>
    </dialog>
  );
}
