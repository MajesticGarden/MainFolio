import React, { useEffect, useRef } from 'react';

// FollowCursor — no GSAP dependency.
// Uses a single rAF loop with lerp for the trailing circle.
// The central dot moves pixel-perfectly via direct style mutations.
// This avoids creating a new gsap.to({}) tween on every mousemove.
export default function FollowCursor() {
  const dotRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const circle = circleRef.current;
    if (!dot || !circle) return;

    let mouseX = 0, mouseY = 0;       // current mouse position
    let cx = 0, cy = 0;               // circle's lerped position
    let rafId = null;

    // Lerp factor — higher = faster trailing (0.28 = very snappy)
    const LERP = 0.28;

    const tick = () => {
      cx += (mouseX - cx) * LERP;
      cy += (mouseY - cy) * LERP;

      // Direct transform — no layout, no style.left/top reads
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      circle.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;

      rafId = requestAnimationFrame(tick);
    };

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onPointerDown = () => {
      dot.style.transition = 'transform 0.2s, scale 0.2s';
      dot.style.scale = '0.5';
      circle.style.scale = '1.5';
      // Slight delay reset
      setTimeout(() => {
        dot.style.transition = '';
        circle.style.transition = '';
      }, 300);
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
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          willChange: 'transform',
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
          willChange: 'transform',
        }}
      />
    </>
  );
}
