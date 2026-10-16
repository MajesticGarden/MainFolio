import React, { useState, useMemo } from 'react';
import galleryImages from '../data/gallery.js';
import PhotoLightbox from '../components/PhotoLightbox';
import FollowCursor from '../components/FollowCursor';

export default function GalleryView({ onBackToCanvas, isMono, setIsMono }) {
  const [activePhoto, setActivePhoto] = useState(null);
  const [filter, setFilter] = useState('ALL');

  // Categorize images based on filenames / tags
  const categoryCounts = useMemo(() => ({
    ALL: galleryImages.length,
    PORTRAITS: galleryImages.filter(img => /Mohammad|portrait|_DSC0[789]|_DSC10|_DSC11|_DSC2[123]/i.test(img.file)).length,
    WEDDINGS: galleryImages.filter(img => /DSC_|_DSC7|_DSC9|_DSC6/i.test(img.file)).length,
    STREET: galleryImages.filter(img => /Street|Untitled|_DSC3|_DSC4|_DSC5/i.test(img.file)).length,
  }), []);

  const filteredImages = useMemo(() => {
    if (filter === 'ALL') return galleryImages;
    if (filter === 'PORTRAITS') {
      return galleryImages.filter(img => 
        /Mohammad|portrait|_DSC0[789]|_DSC10|_DSC11|_DSC2[123]/i.test(img.file)
      );
    }
    if (filter === 'STREET') {
      return galleryImages.filter(img => 
        /Street|Untitled|_DSC3|_DSC4|_DSC5/i.test(img.file)
      );
    }
    if (filter === 'WEDDINGS') {
      return galleryImages.filter(img => 
        /DSC_|_DSC7|_DSC9|_DSC6/i.test(img.file)
      );
    }
    return galleryImages;
  }, [filter]);

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: "'Space Mono', monospace",
      overflowX: 'hidden',
      overflowY: 'auto',
      position: 'relative',
      paddingBottom: '80px',
    }}>
      <FollowCursor />

      {/* Top Fixed Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 10, 10, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <button
            onClick={onBackToCanvas}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              cursor: 'pointer',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: 0,
              marginBottom: '6px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
          >
            ← RETURN TO INFINITE ARTBOARD
          </button>
          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(20px, 3vw, 32px)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: 0,
            textTransform: 'uppercase',
          }}>
            MO MOVAHED ARCHIVE
          </h1>
        </div>

        {/* Filter Bar & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {['ALL', 'PORTRAITS', 'WEDDINGS', 'STREET'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                background: filter === cat ? '#fff' : 'rgba(255, 255, 255, 0.05)',
                color: filter === cat ? '#000' : 'rgba(255, 255, 255, 0.7)',
                border: '1px solid ' + (filter === cat ? '#fff' : 'rgba(255, 255, 255, 0.15)'),
                padding: '6px 16px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                fontWeight: filter === cat ? 700 : 400,
                cursor: 'pointer',
                letterSpacing: '0.12em',
                transition: 'all 0.2s',
              }}
            >
              {cat} ({categoryCounts[cat]})
            </button>
          ))}
          <button
            onClick={() => setIsMono(m => !m)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#fff',
              padding: '6px 16px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              cursor: 'pointer',
              letterSpacing: '0.12em',
            }}
          >
            {isMono ? 'COLOR' : 'B&W'}
          </button>
          <button
            data-thunderbolt-launcher
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#fff',
              padding: '6px 16px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.12em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>⚡</span> CHAT
          </button>
        </div>
      </header>

      {/* Main Grid View */}
      <main style={{
        maxWidth: '1800px',
        margin: '0 auto',
        padding: '32px',
      }}>
        <div style={{
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.4)',
          letterSpacing: '0.15em',
          marginBottom: '24px',
          textTransform: 'uppercase',
        }}>
          SHOWING {filteredImages.length} OF {galleryImages.length} PHOTOGRAPHS — CLICK ANY PHOTO TO VIEW FULLSCREEN
        </div>

        <div style={{
          columnCount: 'auto',
          columnWidth: '340px',
          columnGap: '16px',
        }}>
          {filteredImages.map((img, i) => (
            <div
              key={img.file}
              onClick={() => setActivePhoto(img.file)}
              style={{
                marginBottom: '16px',
                breakInside: 'avoid',
                position: 'relative',
                background: '#111',
                overflow: 'hidden',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.8)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <img
                src={`/thumbs/${encodeURIComponent(img.file)}`}
                alt=""
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  if (!e.currentTarget.dataset.retried) {
                    e.currentTarget.dataset.retried = 'true';
                    e.currentTarget.src = `/gallery/${encodeURIComponent(img.file)}`;
                  }
                }}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  filter: isMono ? 'grayscale(100%) contrast(1.1)' : 'none',
                  transition: 'filter 0.4s ease',
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '8px 12px',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                fontSize: '9px',
                color: 'rgba(255, 255, 255, 0.7)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span>NO.{i + 1}</span>
                <span>EXPAND ↗</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Lightbox Modal */}
      <PhotoLightbox
        photo={activePhoto}
        allPhotos={filteredImages}
        onClose={() => setActivePhoto(null)}
        onSelectPhoto={setActivePhoto}
        isMono={isMono}
      />
    </div>
  );
}
