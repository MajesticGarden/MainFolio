import React, { useState, useEffect, useRef } from 'react';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAFidZcdip9MpjHkU';

const COMMISSION_TYPES = [
  { id: 'WEDDING', label: 'Wedding / Elopement' },
  { id: 'PORTRAIT', label: 'Portrait / Editorial' },
  { id: 'AERIAL', label: 'Aerial / Commercial' },
  { id: 'DIRECTION', label: 'Art Direction' },
];

export default function ContactModal({ isOpen, onClose, defaultCategory = 'WEDDING' }) {
  const [commissionType, setCommissionType] = useState(defaultCategory);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contextField, setContextField] = useState(''); // Date/Venue OR Timeline/Usage/Budget
  const [message, setMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const widgetContainerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setStatus('idle');
      setTurnstileToken('');
      setErrorMessage('');
      return;
    }

    let intervalId;

    const renderWidget = () => {
      if (window.turnstile && widgetContainerRef.current && widgetIdRef.current === null) {
        try {
          widgetIdRef.current = window.turnstile.render(widgetContainerRef.current, {
            sitekey: SITE_KEY,
            action: 'contact',
            theme: 'dark',
            callback: (token) => setTurnstileToken(token),
            'expired-callback': () => setTurnstileToken(''),
            'error-callback': () => setTurnstileToken(''),
          });
          if (intervalId) clearInterval(intervalId);
        } catch (err) {
          console.error('Turnstile render error:', err);
        }
      }
    };

    renderWidget();
    if (!window.turnstile) {
      intervalId = setInterval(renderWidget, 250);
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('keydown', handleKeyDown);
      if (window.turnstile && widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (_) {}
        widgetIdRef.current = null;
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isWedding = commissionType === 'WEDDING';
  const selectedCommissionLabel =
    COMMISSION_TYPES.find((c) => c.id === commissionType)?.label || commissionType;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!turnstileToken) {
      setErrorMessage('Please complete the verification check before sending.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    // Structured brief keeps full compatibility with your existing /api/contact endpoint
    const structuredMessage = [
      `[COMMISSION SCOPE]: ${selectedCommissionLabel}`,
      contextField
        ? `[${isWedding ? 'DATE & LOCATION' : 'TIMELINE / SCOPE / BUDGET'}]: ${contextField}`
        : null,
      '',
      message,
    ]
      .filter((line) => line !== null)
      .join('\n');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message: structuredMessage,
          'cf-turnstile-response': turnstileToken,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.reason || data.error || 'Failed to verify request');
      }

      setStatus('success');
      setName('');
      setEmail('');
      setContextField('');
      setMessage('');
      setTurnstileToken('');
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
    }
  };

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(243, 240, 232, 0.03)',
    border: '1px solid rgba(243, 240, 232, 0.16)',
    padding: '11px 14px',
    color: '#f3f0e8',
    fontFamily: "'Space Mono', monospace",
    fontSize: '11px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        cursor: 'auto',
        backgroundColor: 'rgba(8, 8, 7, 0.86)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '18px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#0e0e0d',
          border: '1px solid rgba(243, 240, 232, 0.16)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85)',
          padding: '36px',
          color: '#f3f0e8',
          fontFamily: "'Space Mono', monospace",
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '24px',
            paddingBottom: '18px',
            borderBottom: '1px solid rgba(243, 240, 232, 0.1)',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '9px',
                letterSpacing: '0.22em',
                color: '#c85a32',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              GLASGOW · SCOTLAND · WORLDWIDE COMMISSIONS
            </div>
            <h2
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 'clamp(28px, 4vw, 38px)',
                fontWeight: 400,
                lineHeight: 0.98,
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Tell me what we&apos;re creating.
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close contact dialog"
            style={{
              background: 'transparent',
              border: '1px solid rgba(243, 240, 232, 0.15)',
              color: 'rgba(243, 240, 232, 0.75)',
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              cursor: 'pointer',
              padding: '6px 10px',
              lineHeight: 1,
            }}
          >
            ESC ✕
          </button>
        </div>

        {status === 'success' ? (
          <div style={{ padding: '28px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '26px', color: '#c85a32', marginBottom: '14px' }}>✓</div>
            <h3
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: '30px',
                fontWeight: 400,
                margin: '0 0 10px 0',
              }}
            >
              Commission Brief Received
            </h3>
            <p
              style={{
                fontSize: '11px',
                color: 'rgba(243, 240, 232, 0.65)',
                lineHeight: 1.7,
                margin: '0 auto 26px auto',
                maxWidth: '42ch',
              }}
            >
              Thank you—your inquiry is verified and in my inbox. I respond personally to all wedding and editorial briefs within 24–48 hours.
            </p>
            <button
              onClick={onClose}
              style={{
                background: '#f3f0e8',
                color: '#0b0b0a',
                border: 'none',
                padding: '11px 26px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Return to Portfolio
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 01: Commission Scope Selector */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '9px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(243, 240, 232, 0.55)',
                  marginBottom: '8px',
                }}
              >
                01 // Commission Discipline
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {COMMISSION_TYPES.map((item) => {
                  const active = commissionType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCommissionType(item.id)}
                      style={{
                        background: active ? '#c85a32' : 'transparent',
                        color: active ? '#fff' : 'rgba(243, 240, 232, 0.72)',
                        border: active
                          ? '1px solid #c85a32'
                          : '1px solid rgba(243, 240, 232, 0.16)',
                        padding: '7px 12px',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 02: Name & Email Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '9px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(243, 240, 232, 0.55)',
                    marginBottom: '6px',
                  }}
                >
                  02 // Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="YOUR NAME"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#c85a32')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(243, 240, 232, 0.16)')}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '9px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(243, 240, 232, 0.55)',
                    marginBottom: '6px',
                  }}
                >
                  03 // Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="YOUR@EMAIL.COM"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#c85a32')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(243, 240, 232, 0.16)')}
                />
              </div>
            </div>

            {/* 04: Conditional Audience Field */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '9px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(243, 240, 232, 0.55)',
                  marginBottom: '6px',
                }}
              >
                {isWedding ? '04 // Date & Venue / Highland Location' : '04 // Target Shoot Window, Usage & Budget'}
              </label>
              <input
                type="text"
                required
                value={contextField}
                onChange={(e) => setContextField(e.target.value)}
                placeholder={
                  isWedding
                    ? 'E.G. AUTUMN 2027 · GLENCOE / GLASGOW / ITALY'
                    : 'E.G. NOV 2026 · GLOBAL CAMPAIGN / CAA AERIAL STILLS'
                }
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#c85a32')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(243, 240, 232, 0.16)')}
              />
            </div>

            {/* 05: Creative Brief / Story */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '9px',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(243, 240, 232, 0.55)',
                  marginBottom: '6px',
                }}
              >
                {isWedding ? '05 // Your Story & Atmosphere' : '05 // Creative Brief & Treatment Notes'}
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isWedding
                    ? 'TELL ME ABOUT THE TWO OF YOU, THE MOOD YOU ENVISION, AND WHAT DREW YOU TO MY WORK...'
                    : 'SHARE VISUAL REFERENCES, DELIVERABLES, LOCATION COORDINATES, OR CONCEPT DETAILS...'
                }
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={(e) => (e.target.style.borderColor = '#c85a32')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(243, 240, 232, 0.16)')}
              />
            </div>

            {/* Cloudflare Turnstile Container */}
            <div style={{ marginTop: '2px', minHeight: '65px' }}>
              <div ref={widgetContainerRef} />
            </div>

            {errorMessage && (
              <div style={{ color: '#ff6b6b', fontSize: '10px', letterSpacing: '0.06em' }}>
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting' || !turnstileToken}
              style={{
                background: turnstileToken ? '#f3f0e8' : 'rgba(243, 240, 232, 0.16)',
                color: turnstileToken ? '#0b0b0a' : 'rgba(243, 240, 232, 0.45)',
                border: 'none',
                padding: '13px 18px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: turnstileToken ? 'pointer' : 'not-allowed',
                transition: 'all 0.25s ease',
              }}
            >
              {status === 'submitting' ? 'VERIFYING & TRANSMITTING...' : 'SEND COMMISSION BRIEF →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
