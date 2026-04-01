import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function FollowCursor() {
  const dotRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    // Quick setters for performance
    const xDot = gsap.quickSetter(dotRef.current, 'x', 'px');
    const yDot = gsap.quickSetter(dotRef.current, 'y', 'px');
    const xCircle = gsap.quickSetter(circleRef.current, 'x', 'px');
    const yCircle = gsap.quickSetter(circleRef.current, 'y', 'px');

    const move = (e) => {
      // Immediate move for the central dot
      xDot(e.clientX);
      yDot(e.clientY);

      // Trailing move for the outer circle
      gsap.to({}, {
        duration: 0.4,
        onUpdate: () => {
          xCircle(e.clientX);
          yCircle(e.clientY);
        },
        ease: 'power2.out'
      });
    };

    const onPointerDown = () => {
      gsap.to(dotRef.current, { scale: 0.5, duration: 0.3 });
      gsap.to(circleRef.current, { scale: 1.5, borderColor: 'rgba(255,255,255,0.8)', duration: 0.3 });
    };

    const onPointerUp = () => {
      gsap.to(dotRef.current, { scale: 1, duration: 0.3 });
      gsap.to(circleRef.current, { scale: 1, borderColor: 'rgba(255,255,255,0.3)', duration: 0.3 });
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mouseup', onPointerUp);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mouseup', onPointerUp);
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
      {/* Visual Instruction label (optional, placed below) */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: "'Space Mono', monospace",
        fontSize: '9px',
        color: 'rgba(255,255,255,0.2)',
        letterSpacing: '0.2em',
        pointerEvents: 'none',
        textTransform: 'uppercase',
      }}>
        DRAG TO EXPLORE — SCROLL TO PAN
      </div>
    </>
  );
}
