"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Real 3D research scene built with CSS 3D transforms (perspective + preserve-3d):
 * three tilted orbit rings, nodes travelling around them at different depths,
 * a wireframe core, a molecule and depth-sorted stars. The whole scene tilts with
 * the pointer, so it reads as an object in space rather than a flat drawing.
 *
 * No WebGL library: the browser composites transforms on the GPU, so it stays light.
 */

const RINGS = [
  { size: 420, rotX: 74, rotY: 0, duration: 26, nodes: 3 },
  { size: 300, rotX: 62, rotY: 58, duration: 19, reverse: true, nodes: 2 },
  { size: 540, rotX: 80, rotY: -34, duration: 42, nodes: 2 },
];

const STARS = [
  { x: -46, y: -38, z: -180, d: 0 },
  { x: 44, y: -30, z: -120, d: 1.4 },
  { x: -38, y: 36, z: 60, d: 2.2 },
  { x: 40, y: 34, z: -60, d: 0.8 },
  { x: 8, y: -46, z: 120, d: 1.8 },
];

export function OrbitScene({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Pointer parallax: the scene leans towards the cursor.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      setTilt({ x: -py * 18, y: px * 22 });
    };
    const onLeave = () => setTilt({ x: 0, y: 0 });
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("orbit-scene relative aspect-square w-full select-none", className)}
      style={{ perspective: "1100px", perspectiveOrigin: "50% 50%" }}
    >
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out [transform-style:preserve-3d]"
        style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        {/* Orbit rings with nodes riding on them */}
        {RINGS.map((ring, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
            style={{
              width: `${ring.size / 6}%`,
              height: `${ring.size / 6}%`,
              marginLeft: `-${ring.size / 12}%`,
              marginTop: `-${ring.size / 12}%`,
              transform: `rotateX(${ring.rotX}deg) rotateY(${ring.rotY}deg)`,
            }}
          >
            <div
              className="absolute inset-0 [transform-style:preserve-3d]"
              style={{
                animation: `orbit-spin ${ring.duration}s linear infinite${ring.reverse ? " reverse" : ""}`,
              }}
            >
              <div className="absolute inset-0 rounded-full border border-foreground/25" />
              {Array.from({ length: ring.nodes }).map((_, n) => {
                const angle = (360 / ring.nodes) * n;
                return (
                  <div
                    key={n}
                    className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]"
                    style={{ transform: `rotate(${angle}deg) translateX(${ring.size / 2}px)` }}
                  >
                    {/* Undo the parent rotations in reverse order so the node always faces the
                        viewer: first its own angle, then the ring spin, then the ring tilt. */}
                    <div className="[transform-style:preserve-3d]" style={{ transform: `rotateZ(${-angle}deg)` }}>
                      <div
                        className="[transform-style:preserve-3d]"
                        style={{
                          animation: `orbit-spin ${ring.duration}s linear infinite${ring.reverse ? "" : " reverse"}`,
                        }}
                      >
                        <div
                          className="orbit-node -ml-2 -mt-2 size-4 rounded-full bg-primary"
                          style={{ transform: `rotateY(${-ring.rotY}deg) rotateX(${-ring.rotX}deg)` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Wireframe core: three circles crossing in 3D */}
        <div className="absolute left-1/2 top-1/2 size-[22%] -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d]">
          <div
            className="absolute inset-0 [transform-style:preserve-3d]"
            style={{ animation: "orbit-spin 34s linear infinite" }}
          >
            <div className="absolute inset-0 rounded-full border border-foreground/30" style={{ transform: "rotateY(0deg)" }} />
            <div className="absolute inset-0 rounded-full border border-foreground/20" style={{ transform: "rotateY(60deg)" }} />
            <div className="absolute inset-0 rounded-full border border-foreground/20" style={{ transform: "rotateY(120deg)" }} />
            <div className="absolute inset-0 rounded-full border border-foreground/15" style={{ transform: "rotateX(90deg)" }} />
          </div>
          <div className="absolute left-1/2 top-1/2 size-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
        </div>

        {/* The research "plate": two panels offset in depth */}
        <div
          className="absolute left-1/2 top-1/2 h-[54%] w-[16%] -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d]"
          style={{ animation: "drift 9s ease-in-out infinite" }}
        >
          <div className="absolute inset-0 border border-foreground/20" style={{ transform: "translateZ(60px)" }} />
          <div className="absolute inset-0 border border-foreground/10" style={{ transform: "translateZ(-60px)" }} />
          <div className="absolute left-0 right-0 top-1/2 border-t border-foreground/20" style={{ transform: "translateZ(60px)" }} />
        </div>

        {/* Molecule floating in front */}
        <div
          className="absolute left-[16%] top-[20%] [transform-style:preserve-3d]"
          style={{ animation: "drift 7s ease-in-out infinite reverse", transform: "translateZ(120px)" }}
        >
          <svg viewBox="0 0 120 120" className="size-24">
            <line x1="20" y1="24" x2="62" y2="46" className="stroke-foreground/40" strokeWidth="1.5" />
            <line x1="62" y1="46" x2="44" y2="96" className="stroke-foreground/40" strokeWidth="1.5" />
            <circle cx="20" cy="24" r="8" className="fill-card stroke-foreground/50" strokeWidth="1.5" />
            <circle cx="62" cy="46" r="11" className="fill-primary" />
            <circle cx="44" cy="96" r="7" className="fill-card stroke-foreground/50" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Depth-sorted stars */}
        {STARS.map((s, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{ transform: `translate3d(${s.x * 4}px, ${s.y * 4}px, ${s.z}px)` }}
          >
            <svg viewBox="-10 -10 20 20" className="size-4" style={{ animation: `twinkle 3.6s ease-in-out ${s.d}s infinite` }}>
              <path d="M0 -9 L2 -2 L9 0 L2 2 L0 9 L-2 2 L-9 0 L-2 -2 Z" className="fill-foreground" />
            </svg>
          </div>
        ))}
      </div>

      {/* Survey-plate coordinates stay flat on top */}
      <p className="eyebrow absolute bottom-2 right-2 leading-relaxed">
        46.92° N
        <br />
        71.49° E
      </p>
    </div>
  );
}
