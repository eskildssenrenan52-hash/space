// ============================================================================
// CINEMATIC LAYER — full-screen ambient FX (vignette, scanlines, meteors,
// pulsing aurora, nebula drift, HUD corner accents). Purely additive overlay
// that sits above the 3D scene but below HUD. Pointer-events disabled.
// ============================================================================
import React, { useMemo } from 'react';

interface Meteor { left: number; top: number; delay: number; duration: number; size: number; angle: number; }
interface Particle { left: number; top: number; delay: number; duration: number; size: number; color: string; }

const PARTICLE_COLORS = ['rgba(34,211,238,0.6)', 'rgba(168,85,247,0.5)', 'rgba(99,102,241,0.5)', 'rgba(16,185,129,0.4)'];

export const CinematicLayer: React.FC = () => {
  const meteors = useMemo<Meteor[]>(() => Array.from({ length: 14 }, () => ({
    left: Math.random() * 120 - 10,
    top: Math.random() * 70,
    delay: Math.random() * 12,
    duration: 5 + Math.random() * 8,
    size: 60 + Math.random() * 200,
    angle: 200 + Math.random() * 30,
  })), []);

  const particles = useMemo<Particle[]>(() => Array.from({ length: 25 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 12,
    size: 1 + Math.random() * 2,
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
  })), []);

  return (
    <>
      <style>{`
        @keyframes cine-meteor {
          0%   { transform: translate3d(0,0,0) rotate(var(--angle,215deg)); opacity: 0; }
          8%   { opacity: 1; }
          100% { transform: translate3d(-1100px,1100px,0) rotate(var(--angle,215deg)); opacity: 0; }
        }
        @keyframes cine-aurora {
          0%,100% { opacity: .3; transform: translate3d(-2%,0,0) scale(1); }
          33%     { opacity: .5; transform: translate3d(1.5%,-0.5%,0) scale(1.04); }
          66%     { opacity: .4; transform: translate3d(-1%,0.5%,0) scale(0.98); }
        }
        @keyframes cine-nebula {
          0%,100% { opacity: .18; transform: translate3d(0,0,0) scale(1) rotate(0deg); }
          50%     { opacity: .28; transform: translate3d(1%,-0.5%,0) scale(1.06) rotate(1deg); }
        }
        @keyframes cine-particle {
          0%   { transform: translateY(0px); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.4; }
          100% { transform: translateY(-60px); opacity: 0; }
        }
        @keyframes cine-scan {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes cine-corner-pulse {
          0%,100% { opacity: 0.4; }
          50%     { opacity: 0.7; }
        }
        .cine-meteor {
          position: absolute; pointer-events: none;
          height: 1px; border-radius: 999px;
          background: linear-gradient(90deg, rgba(180,230,255,0) 0%, rgba(180,230,255,.85) 55%, #fff 100%);
          box-shadow: 0 0 10px rgba(180,230,255,.8), 0 0 22px rgba(140,200,255,.5);
          animation: cine-meteor linear infinite;
        }
        .cine-scanlines::after {
          content: ''; position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(
            0deg,
            rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px,
            transparent 1px, transparent 4px
          );
          mix-blend-mode: overlay; opacity: .3;
        }
        .cine-scanline-bar {
          position: absolute; left: 0; right: 0; height: 2px; pointer-events: none;
          background: linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.08) 30%, rgba(168,85,247,0.06) 70%, transparent 100%);
          animation: cine-scan 18s linear infinite;
          mix-blend-mode: screen;
        }
        .cine-vignette {
          background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.6) 100%);
        }
        .cine-aurora {
          position: absolute; inset: -10% -5% auto -5%; height: 60%;
          background:
            radial-gradient(65% 85% at 15% 25%, rgba(56,189,248,.16) 0%, transparent 60%),
            radial-gradient(55% 75% at 85% 35%, rgba(192,132,252,.15) 0%, transparent 60%),
            radial-gradient(75% 95% at 50% 15%, rgba(52,211,153,.09) 0%, transparent 60%),
            radial-gradient(40% 60% at 70% 60%, rgba(251,146,60,.06) 0%, transparent 60%);
          filter: blur(45px);
          animation: cine-aurora 18s ease-in-out infinite;
        }
        .cine-nebula {
          position: absolute; pointer-events: none;
          border-radius: 50%; filter: blur(60px);
          animation: cine-nebula ease-in-out infinite;
        }
        .cine-particle {
          position: absolute; pointer-events: none; border-radius: 50%;
          animation: cine-particle ease-in-out infinite;
        }
        .cine-corner {
          position: absolute; pointer-events: none;
          animation: cine-corner-pulse 4s ease-in-out infinite;
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 z-[15] overflow-hidden cine-scanlines">
        {/* Aurora layer */}
        <div className="cine-aurora" />

        {/* Nebula blobs */}
        <div className="cine-nebula" style={{
          width: '45vw', height: '35vh',
          top: '10%', right: '-5%',
          background: 'radial-gradient(ellipse, rgba(168,85,247,0.1), transparent 70%)',
          animationDuration: '22s',
        }} />
        <div className="cine-nebula" style={{
          width: '35vw', height: '28vh',
          bottom: '5%', left: '5%',
          background: 'radial-gradient(ellipse, rgba(34,211,238,0.07), transparent 70%)',
          animationDuration: '28s',
          animationDelay: '-8s',
        }} />

        {/* Moving scan bar */}
        <div className="cine-scanline-bar" />

        {/* Meteors / shooting stars */}
        {meteors.map((m, i) => (
          <span
            key={i}
            className="cine-meteor"
            style={{
              left: `${m.left}%`,
              top: `${m.top}%`,
              width: `${m.size}px`,
              ['--angle' as string]: `${m.angle}deg`,
              animationDelay: `${m.delay}s`,
              animationDuration: `${m.duration}s`,
            }}
          />
        ))}

        {/* Floating particles */}
        {particles.map((p, i) => (
          <span
            key={`p${i}`}
            className="cine-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}

        {/* HUD corner accents — top-left */}
        <svg className="cine-corner" style={{ top: 0, left: 0, width: 120, height: 120 }} viewBox="0 0 120 120">
          <path d="M8 60 L8 8 L60 8" fill="none" stroke="rgba(34,211,238,0.35)" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="3" fill="rgba(34,211,238,0.5)" />
          <path d="M16 60 L16 16 L60 16" fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="0.8" />
        </svg>

        {/* HUD corner accents — top-right */}
        <svg className="cine-corner" style={{ top: 0, right: 0, width: 120, height: 120, animationDelay: '1s' }} viewBox="0 0 120 120">
          <path d="M112 60 L112 8 L60 8" fill="none" stroke="rgba(168,85,247,0.35)" strokeWidth="1.5" />
          <circle cx="112" cy="8" r="3" fill="rgba(168,85,247,0.5)" />
          <path d="M104 60 L104 16 L60 16" fill="none" stroke="rgba(168,85,247,0.15)" strokeWidth="0.8" />
        </svg>

        {/* HUD corner accents — bottom-right */}
        <svg className="cine-corner" style={{ bottom: 0, right: 0, width: 120, height: 120, animationDelay: '2s' }} viewBox="0 0 120 120">
          <path d="M112 60 L112 112 L60 112" fill="none" stroke="rgba(34,211,238,0.25)" strokeWidth="1.2" />
          <circle cx="112" cy="112" r="2.5" fill="rgba(34,211,238,0.4)" />
        </svg>

        {/* Vignette */}
        <div className="cine-vignette absolute inset-0" />
      </div>
    </>
  );
};

export default CinematicLayer;
