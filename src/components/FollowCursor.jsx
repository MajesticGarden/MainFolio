import React, { useEffect, useRef, useState } from 'react';

/**
 * FollowCursor — High-performance trailing cursor with zero dependencies.
 * Automatically disabled on touch screens and coarse pointer devices to preserve native usability.
 */
export default function FollowCursor() {
  const dotRef = useRef(null);
  const circleRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Only run on fine-pointer devices (desktop mice / trackpads)
    const mediaQuery = window.matchMedia('(pointer: fine) and (hover: hover)');
    if (!mediaQuery.matches) {
      setEnabled(false);
      return;
    }
    setEnabled(true);

    const dot = dotRef.current;
    const circle = circleRef.current;
    if (!dot || !circle) return;

    let mouseX = -100, mouseY = -100;
    let cx = -100, cy = -100;
    let rafId = null;
    let hasMoved = false;

    const LERP = 0.28;

    const tick = () => {
      cx += (mouseX - cx) * LERP;
      cy += (mouseY - cy) * LERP;

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      circle.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;

      rafId = requestAnimationFrame(tick);
    };

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        cx = mouseX;
        cy = mouseY;
        dot.style.opacity = '1';
        circle.style.opacity = '1';
      }
    };

    const onPointerDown = () => {
      dot.style.transition = 'transform 0.15s ease, scale 0.15s ease';
      dot.style.scale = '0.5';
      circle.style.scale = '1.4';
      setTimeout(() => {
        dot.style.transition = '';
        circle.style.transition = '';
      }, 200);
    };

    const onPointerUp = () => {
      dot.style.scale = '1';
      circle.style.scale = '1';
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onPointerDown, { passive: true });
    window.addEventListener('mouseup', onPointerUp, { passive: true });
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mouseup', onPointerUp);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Outer trailing circle */}
      <div
        ref={circleRef}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 38,
          height: 38,
          margin: '-19px 0 0 -19px',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0,
          willChange: 'transform',
          transition: 'opacity 0.3s ease',
        }}
      />
      {/* Inner solid dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 6,
          height: 6,
          margin: '-3px 0 0 -3px',
          background: '#fff',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 10000,
          opacity: 0,
          willChange: 'transform',
          transition: 'opacity 0.3s ease',
        }}
      />
    </>
  );
}
