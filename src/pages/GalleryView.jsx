import React, { useState, useMemo, useEffect } from 'react';
import galleryImages from '../data/gallery.js';
import PhotoLightbox from '../components/PhotoLightbox';
import ContactModal from '../components/ContactModal';
import FollowCursor from '../components/FollowCursor';

const DISCIPLINE_MANIFESTO = {
  ALL: {
    kicker: 'GLASGOW, SCOTLAND — 55.8642° N · WORKING WORLDWIDE',
    headline: 'Raw human emotion framed through brutalist cinema.',
    subcopy:
      'Selected visual essays, documentary weddings, stark portraiture, and street geometry. Switch between curated Editorial Stories and the full Contact Sheet below.',
  },
  WEDDINGS: {
    kicker: 'DOCUMENTARY WEDDINGS & HIGHLAND ELOPEMENTS',
    headline: 'Unscripted atmosphere for couples who hate stiff clichés.',
    subcopy:
      'Shot like cinema—wind, shadow, movement, and quiet intimacy across Glasgow, Glencoe, Skye, and Europe. Bespoke full-day coverage & elopement commissions.',
  },
  PORTRAITS: {
    kicker: 'EDITORIAL PORTRAITURE & ARTIST COMMISSIONS',
    headline: 'Stark concrete, natural tungsten, and unguarded presence.',
    subcopy:
      'Environmental portraits and art direction crafted for musicians, founders, publications, and personal monographs.',
  },
  STREET: {
    kicker: 'BRUTALIST ARCHITECTURE, STREET & AERIAL PERSPECTIVES',
    headline: 'Scale, solitude, and geometry in motion.',
    subcopy:
      'Observational studies of urban monoliths, Scottish weather, and fleeting human silhouettes.',
  },
};

const EDITORIAL_NOTES = [
  {
    chapter: 'ACT I — CINEMASCOPE STUDY',
    title: 'Shadow & Unscripted Stillness',
    caption: 'Framed with architectural restraint—letting negative space and natural shadow carry the emotional weight of the room.',
    spec: '35MM ANAMORPHIC PERSPECTIVE · NATURAL LIGHT',
  },
  {
    chapter: 'ACT II — INTIMATE STUDY',
    title: 'Between Concrete and Pulse',
    caption: 'Stripping away artificial posing so quiet, fleeting micro-expressions remain honest and permanent.',
    spec: '50MM · f/1.4 · GLASGOW ARCHIVE',
  },
  {
    chapter: 'ACT III — DUALITY',
    title: 'Scale & Proximity',
    caption: 'Pairing wide environmental context against close human texture—the core rhythm of cinematic storytelling.',
    spec: 'DIPTYCH SEQUENCE · SCOTLAND',
  },
  {
    chapter: 'ACT IV — MONOGRAPH PLATE',
    title: 'After the Rain Clears',
    caption: 'High-contrast Northern light carved across stone, mist, and movement.',
    spec: '24MM · DOCUMENTARY PLATE',
  },
];

export default function GalleryView({ initialFilter = 'ALL', onBackToCanvas, isMono, setIsMono }) {
  const [activePhoto, setActivePhoto] = useState(null);
  const [filter, setFilter] = useState(initialFilter);
  const [mode, setMode] = useState('STORIES'); // 'STORIES' | 'INDEX'
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    setFilter(initialFilter);
  }, [initialFilter]);

  const handleFilterChange = (nextFilter) => {
    setFilter(nextFilter);
    const routeMap = {
      ALL: '/gallery',
      WEDDINGS: '/weddings',
      PORTRAITS: '/portraits',
      STREET: '/street',
    };
    window.history.replaceState({}, '', routeMap[nextFilter] || '/gallery');
  };

  // Preserve your exact filename categorization rules
  const categoryCounts = useMemo(
    () => ({
      ALL: galleryImages.length,
      PORTRAITS: galleryImages.filter((img) =>
        /Mohammad|portrait|_DSC0[789]|_DSC10|_DSC11|_DSC2[123]/i.test(img.file)
      ).length,
      WEDDINGS: galleryImages.filter((img) => /DSC_|_DSC7|_DSC9|_DSC6/i.test(img.file)).length,
      STREET: galleryImages.filter((img) => /Street|Untitled|_DSC3|_DSC4|_DSC5/i.test(img.file)).length,
    }),
    []
  );

  const filteredImages = useMemo(() => {
    if (filter === 'PORTRAITS') {
      return galleryImages.filter((img) =>
        /Mohammad|portrait|_DSC0[789]|_DSC10|_DSC11|_DSC2[123]/i.test(img.file)
      );
    }
    if (filter === 'STREET') {
      return galleryImages.filter((img) => /Street|Untitled|_DSC3|_DSC4|_DSC5/i.test(img.file));
    }
    if (filter === 'WEDDINGS') {
      return galleryImages.filter((img) => /DSC_|_DSC7|_DSC9|_DSC6/i.test(img.file));
    }
    return galleryImages;
  }, [filter]);

  // Group images into paced editorial chapters (Cinema -> Asymmetrical -> Diptych)
  const storyChapters = useMemo(() => {
    const chapters = [];
    let idx = 0;
    let step = 0;

    while (idx < filteredImages.length && chapters.length < 18) {
      const pattern = step % 3;
      const meta = EDITORIAL_NOTES[step % EDITORIAL_NOTES.length];

      if (pattern === 0) {
        chapters.push({
          type: 'cinema',
          items: [filteredImages[idx]],
          startIndex: idx,
          paper: step % 2 === 1 && (filter === 'WEDDINGS' || filter === 'ALL'),
          meta,
        });
        idx += 1;
      } else if (pattern === 1) {
        chapters.push({
          type: 'asym',
          items: [filteredImages[idx]],
          startIndex: idx,
          paper: filter === 'WEDDINGS' && step % 2 === 1,
          meta,
        });
        idx += 1;
      } else {
        const pair = filteredImages.slice(idx, idx + 2);
        chapters.push({
          type: pair.length === 2 ? 'diptych' : 'cinema',
          items: pair,
          startIndex: idx,
          paper: false,
          meta,
        });
        idx += pair.length;
      }
      step += 1;
    }
    return chapters;
  }, [filteredImages, filter]);

  const copy = DISCIPLINE_MANIFESTO[filter] || DISCIPLINE_MANIFESTO.ALL;

  return (
    <div className="editorial-root">
      <FollowCursor />

      <div className="editorial-shell">
        {/* Sticky Architectural Top Bar */}
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'rgba(11, 11, 10, 0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--hairline)',
            padding: '18px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={onBackToCanvas}
              className="pill-control"
              title="Return to Interactive Infinite Canvas"
            >
              ← ARTBOARD
            </button>
            <div>
              <div
                className="editorial-serif"
                style={{ fontSize: '26px', color: 'var(--text)', letterSpacing: '-0.01em' }}
              >
                Mo Movahed
              </div>
            </div>
          </div>

          {/* Mode Switcher + B&W + Direct Booking */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className={`pill-control ${mode === 'STORIES' ? 'is-active' : ''}`}
              onClick={() => setMode('STORIES')}
            >
              01 STORIES
            </button>
            <button
              className={`pill-control ${mode === 'INDEX' ? 'is-active' : ''}`}
              onClick={() => setMode('INDEX')}
            >
              02 INDEX [{filteredImages.length}]
            </button>

            <button className="pill-control" onClick={() => setIsMono((m) => !m)}>
              {isMono ? 'FILM: B&W' : 'FILM: COLOR'}
            </button>

            <button data-thunderbolt-launcher className="pill-control">
              ⚡ CHAT
            </button>

            <button
              className="pill-control is-accent"
              onClick={() => setIsContactOpen(true)}
            >
              INQUIRE →
            </button>
          </div>
        </header>

        {/* Editorial Hero Manifesto & Discipline Filter */}
        <section
          style={{
            padding: '56px 36px 44px',
            borderBottom: '1px solid var(--hairline)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '28px',
          }}
        >
          <div style={{ maxWidth: '760px' }}>
            <div
              style={{
                fontSize: '10px',
                letterSpacing: '0.18em',
                color: 'var(--tungsten)',
                textTransform: 'uppercase',
                marginBottom: '14px',
              }}
            >
              {copy.kicker}
            </div>
            <h1
              className="editorial-serif"
              style={{
                fontSize: 'clamp(36px, 5.5vw, 72px)',
                marginBottom: '18px',
                color: 'var(--text)',
              }}
            >
              {copy.headline}
            </h1>
            <p
              style={{
                fontSize: '12px',
                lineHeight: 1.75,
                color: 'var(--text-muted)',
                maxWidth: '62ch',
              }}
            >
              {copy.subcopy}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['ALL', 'WEDDINGS', 'PORTRAITS', 'STREET'].map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilterChange(cat)}
                className={`pill-control ${filter === cat ? 'is-active' : ''}`}
              >
                {cat} ({categoryCounts[cat]})
              </button>
            ))}
          </div>
        </section>

        {/* VIEW 01: Paced Editorial Monograph */}
        {mode === 'STORIES' ? (
          <main>
            {storyChapters.map((chapter, cIdx) => {
              const first = chapter.items[0];
              const second = chapter.items[1];
              const frameLabel = String(chapter.startIndex + 1).padStart(3, '0');

              if (chapter.type === 'cinema' && first) {
                return (
                  <article
                    key={`ch-${cIdx}-${first.file}`}
                    className={`chapter-row ${chapter.paper ? 'paper-chapter' : ''}`}
                  >
                    <div
                      className="chapter-cinema-media"
                      onClick={() => setActivePhoto(first.file)}
                    >
                      <img
                        className="editorial-photo"
                        src={`/gallery/${encodeURIComponent(first.file)}`}
                        alt={`Mo Movahed Plate ${frameLabel}`}
                        loading={cIdx === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        style={{
                          filter: isMono ? 'grayscale(100%) contrast(1.08)' : 'none',
                        }}
                      />
                    </div>
                    <div className="chapter-cinema-meta">
                      <div>
                        <div style={{ fontSize: '10px', letterSpacing: '0.16em', opacity: 0.6, marginBottom: '6px' }}>
                          PLATE {frameLabel} // {chapter.meta.chapter}
                        </div>
                        <h2 className="editorial-serif" style={{ fontSize: 'clamp(26px, 3vw, 38px)' }}>
                          {chapter.meta.title}
                        </h2>
                      </div>
                      <p style={{ fontSize: '11px', lineHeight: 1.7, maxWidth: '46ch', opacity: 0.78 }}>
                        {chapter.meta.caption}
                      </p>
                    </div>
                  </article>
                );
              }

              if (chapter.type === 'asym' && first) {
                return (
                  <article
                    key={`ch-${cIdx}-${first.file}`}
                    className={`chapter-row ${chapter.paper ? 'paper-chapter' : ''}`}
                  >
                    <div
                      className="chapter-asym-media"
                      onClick={() => setActivePhoto(first.file)}
                    >
                      <img
                        className="editorial-photo"
                        src={`/gallery/${encodeURIComponent(first.file)}`}
                        alt={`Mo Movahed Plate ${frameLabel}`}
                        loading="lazy"
                        decoding="async"
                        style={{
                          filter: isMono ? 'grayscale(100%) contrast(1.08)' : 'none',
                        }}
                      />
                    </div>
                    <div className="chapter-asym-meta">
                      <div
                        style={{
                          fontSize: '10px',
                          letterSpacing: '0.16em',
                          color: '#c85a32',
                          marginBottom: '12px',
                        }}
                      >
                        PLATE {frameLabel} — DIRECTOR&apos;S NOTE
                      </div>
                      <h2
                        className="editorial-serif"
                        style={{ fontSize: 'clamp(30px, 3.6vw, 46px)', marginBottom: '16px' }}
                      >
                        {chapter.meta.title}
                      </h2>
                      <p style={{ fontSize: '12px', lineHeight: 1.8, opacity: 0.82, marginBottom: '20px' }}>
                        {chapter.meta.caption}
                      </p>
                      <div style={{ fontSize: '10px', letterSpacing: '0.14em', opacity: 0.55 }}>
                        {chapter.meta.spec}
                      </div>
                    </div>
                  </article>
                );
              }

              if (chapter.type === 'diptych' && first && second) {
                return (
                  <article key={`ch-${cIdx}-${first.file}`} className="chapter-row">
                    <div className="chapter-diptych-a" onClick={() => setActivePhoto(first.file)}>
                      <img
                        className="editorial-photo"
                        src={`/thumbs/${encodeURIComponent(first.file)}`}
                        onError={(e) => {
                          if (!e.currentTarget.dataset.retried) {
                            e.currentTarget.dataset.retried = 'true';
                            e.currentTarget.src = `/gallery/${encodeURIComponent(first.file)}`;
                          }
                        }}
                        alt={`Mo Movahed Diptych ${frameLabel}A`}
                        loading="lazy"
                        style={{ filter: isMono ? 'grayscale(100%) contrast(1.08)' : 'none' }}
                      />
                    </div>
                    <div className="chapter-diptych-b" onClick={() => setActivePhoto(second.file)}>
                      <img
                        className="editorial-photo"
                        src={`/thumbs/${encodeURIComponent(second.file)}`}
                        onError={(e) => {
                          if (!e.currentTarget.dataset.retried) {
                            e.currentTarget.dataset.retried = 'true';
                            e.currentTarget.src = `/gallery/${encodeURIComponent(second.file)}`;
                          }
                        }}
                        alt={`Mo Movahed Diptych ${frameLabel}B`}
                        loading="lazy"
                        style={{ filter: isMono ? 'grayscale(100%) contrast(1.08)' : 'none' }}
                      />
                    </div>
                    <div className="chapter-cinema-meta">
                      <span style={{ fontSize: '10px', letterSpacing: '0.16em', opacity: 0.6 }}>
                        DIPTYCH PLATES {frameLabel}A &amp; {frameLabel}B
                      </span>
                      <span style={{ fontSize: '10px', letterSpacing: '0.16em', opacity: 0.6 }}>
                        CLICK ANY PLATE FOR FULLSCREEN LOUPE ↗
                      </span>
                    </div>
                  </article>
                );
              }

              return null;
            })}

            {filteredImages.length > storyChapters.length && (
              <div style={{ padding: '48px 36px', textAlign: 'center', borderBottom: '1px solid var(--hairline)' }}>
                <button className="portfolio-link-btn" onClick={() => setMode('INDEX')}>
                  VIEW ALL {filteredImages.length} PLATES IN CONTACT SHEET →
                </button>
              </div>
            )}
          </main>
        ) : (
          /* VIEW 02: Architectural Contact-Sheet Archive */
          <main className="contact-sheet-grid">
            {filteredImages.map((img, i) => (
              <div
                key={img.file}
                className="contact-sheet-cell"
                onClick={() => setActivePhoto(img.file)}
              >
                <div style={{ aspectRatio: '4 / 5', overflow: 'hidden', background: '#141412', marginBottom: '12px' }}>
                  <img
                    className="editorial-photo"
                    src={`/thumbs/${encodeURIComponent(img.file)}`}
                    alt={`Archive Frame ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      if (!e.currentTarget.dataset.retried) {
                        e.currentTarget.dataset.retried = 'true';
                        e.currentTarget.src = `/gallery/${encodeURIComponent(img.file)}`;
                      }
                    }}
                    style={{
                      filter: isMono ? 'grayscale(100%) contrast(1.08)' : 'none',
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '10px',
                    letterSpacing: '0.14em',
                    color: 'var(--text-muted)',
                  }}
                >
                  <span>PLATE #{String(i + 1).padStart(3, '0')}</span>
                  <span style={{ color: 'var(--tungsten)' }}>LOUPE ↗</span>
                </div>
              </div>
            ))}
          </main>
        )}

        {/* Editorial Booking Footer */}
        <footer
          style={{
            padding: '72px 36px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '28px',
          }}
        >
          <div>
            <div style={{ fontSize: '10px', letterSpacing: '0.18em', color: 'var(--tungsten)', marginBottom: '10px' }}>
              2026 / 2027 COMMISSIONS OPEN
            </div>
            <h2 className="editorial-serif" style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}>
              Let&apos;s make something unforgettable.
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="portfolio-link-btn" onClick={() => setIsContactOpen(true)}>
              BOOK / COMMISSION INQUIRY →
            </button>
            <button className="pill-control" onClick={onBackToCanvas}>
              BACK TO INFINITE CANVAS
            </button>
          </div>
        </footer>
      </div>

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

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
