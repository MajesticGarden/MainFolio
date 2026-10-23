import React, { useState, useEffect, useRef } from 'react';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAAFidZcdip9MpjHkU';

export default function ContactModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState('');

  const widgetContainerRef = useRef(null);
  const widgetIdRef = useRef(null);

  // Initialize Turnstile widget when modal opens
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
            callback: (token) => {
              setTurnstileToken(token);
            },
            'expired-callback': () => {
              setTurnstileToken('');
            },
            'error-callback': () => {
              setTurnstileToken('');
            },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      setErrorMessage('Please complete the verification check before sending.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          message,
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

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(5, 5, 5, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.25s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#0d0d0d',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 255, 255, 0.05)',
          padding: '36px',
          color: 'white',
          fontFamily: "'Space Mono', monospace",
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '9px', letterSpacing: '0.3em', color: 'rgba(255, 255, 255, 0.4)' }}>
              (CONNECT / DISCUSS)
            </span>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '6px 0 0 0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Send an Inquiry
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close contact dialog"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px',
              lineHeight: 1,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#fff')}
            onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.6)')}
          >
            ✕
          </button>
        </div>

        {status === 'success' ? (
          <div style={{ padding: '30px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '14px' }}>✓</div>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 8px 0' }}>
              Message Verified & Received
            </h3>
            <p style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.6, margin: '0 0 24px 0' }}>
              Thank you. I have received your message and will get back to you shortly.
            </p>
            <button
              onClick={onClose}
              style={{
                background: 'white',
                color: 'black',
                border: 'none',
                padding: '10px 24px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="YOUR NAME"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  padding: '10px 14px',
                  color: 'white',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.6)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.18)')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR@EMAIL.COM"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  padding: '10px 14px',
                  color: 'white',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  outline: 'none',
                  transition: 'border 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.6)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.18)')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>
                Message
              </label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="TELL ME ABOUT YOUR PROJECT OR INQUIRY..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  padding: '10px 14px',
                  color: 'white',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'border 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.6)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.18)')}
              />
            </div>

            {/* Turnstile Container */}
            <div style={{ marginTop: '4px', minHeight: '65px' }}>
              <div ref={widgetContainerRef} />
            </div>

            {errorMessage && (
              <div style={{ color: '#ff6b6b', fontSize: '10px', letterSpacing: '0.05em' }}>
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting' || !turnstileToken}
              style={{
                background: turnstileToken ? 'white' : 'rgba(255, 255, 255, 0.2)',
                color: 'black',
                border: 'none',
                padding: '12px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: turnstileToken ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: turnstileToken ? '0 0 25px rgba(255,255,255,0.3)' : 'none',
              }}
            >
              {status === 'submitting' ? 'VERIFYING & SENDING...' : 'SEND MESSAGE →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
