import React from 'react';

/**
 * GrainOverlay — Adds a high-fidelity cinematic noise and CRT 
 * scanline effect to the entire artboard.
 */
export default function GrainOverlay() {
  return (
    <>
      {/* 1. Animated Noise/Grain Base */}
      <div style={{
        position: 'fixed', inset: '-100%', zIndex: 120, pointerEvents: 'none',
        background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        opacity: 0.045, // Extremely subtle
        animation: 'grain-movement 8s steps(10) infinite',
        mixBlendMode: 'overlay',
      }} />

      {/* 2. CRT Scanlines (Fixed, minimalist) */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 121, pointerEvents: 'none',
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.02), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.02))',
        backgroundSize: '100% 3px, 3px 100%',
        mixBlendMode: 'multiply',
      }} />

      <style>{`
        @keyframes grain-movement {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -10%); }
          20% { transform: translate(-15%, 5%); }
          30% { transform: translate(7%, -25%); }
          40% { transform: translate(-5%, 25%); }
          50% { transform: translate(-15%, 10%); }
          60% { transform: translate(15%, 0%); }
          70% { transform: translate(0%, 15%); }
          80% { transform: translate(3%, 35%); }
          90% { transform: translate(-10%, 10%); }
        }
      `}</style>
    </>
  );
}
