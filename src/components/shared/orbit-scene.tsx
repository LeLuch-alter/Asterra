import { cn } from "@/lib/utils";

/**
 * Decorative "research orbit": concentric rings, orbiting nodes and twinkling stars.
 * Pure SVG + CSS transforms, flat colours, no gradients. Used on auth pages and the home hero.
 */
export function OrbitScene({ className }: { className?: string }) {
  const ring = "fill-none stroke-foreground/25";
  const node = "fill-primary";
  const star = "fill-foreground";

  return (
    <div className={cn("orbit-scene relative aspect-square w-full select-none", className)} aria-hidden>
      <svg viewBox="0 0 600 600" className="size-full">
        {/* Central "sample" — a plain disc with a hairline halo */}
        <circle cx="300" cy="300" r="46" className="fill-card stroke-foreground/30" strokeWidth="1" />
        <circle cx="300" cy="300" r="14" className={node} />
        <circle cx="300" cy="300" r="70" className="fill-none stroke-foreground/12" strokeWidth="1" strokeDasharray="2 6" />

        {/* Ring 1 — tilted ellipse, slow spin */}
        <g style={{ transformOrigin: "300px 300px", animation: "orbit-spin 28s linear infinite" }}>
          <ellipse cx="300" cy="300" rx="150" ry="52" className={ring} strokeWidth="1" transform="rotate(-18 300 300)" />
          <g transform="rotate(-18 300 300)">
            <circle cx="450" cy="300" r="7" className={node} />
            <circle cx="450" cy="300" r="13" className="fill-none stroke-primary/40" strokeWidth="1" />
          </g>
        </g>

        {/* Ring 2 — wider, reverse spin */}
        <g style={{ transformOrigin: "300px 300px", animation: "orbit-spin-reverse 44s linear infinite" }}>
          <ellipse cx="300" cy="300" rx="230" ry="82" className={ring} strokeWidth="1" transform="rotate(-18 300 300)" />
          <g transform="rotate(-18 300 300)">
            <circle cx="70" cy="300" r="5" className="fill-foreground/80" />
            <circle cx="530" cy="300" r="4" className="fill-foreground/60" />
          </g>
        </g>

        {/* Ring 3 — outer, very slow */}
        <g style={{ transformOrigin: "300px 300px", animation: "orbit-spin 70s linear infinite" }}>
          <ellipse cx="300" cy="300" rx="285" ry="108" className="fill-none stroke-foreground/15" strokeWidth="1" transform="rotate(-18 300 300)" />
          <g transform="rotate(-18 300 300)">
            <circle cx="585" cy="300" r="6" className={node} />
          </g>
        </g>

        {/* Vertical "panel" hairline like the reference plate */}
        <g style={{ animation: "drift 9s ease-in-out infinite" }}>
          <rect x="262" y="120" width="76" height="360" rx="2" className="fill-none stroke-foreground/18" strokeWidth="1" />
          <line x1="262" y1="300" x2="338" y2="300" className="stroke-foreground/18" strokeWidth="1" />
        </g>

        {/* Molecule cluster */}
        <g style={{ animation: "drift 7s ease-in-out infinite reverse" }}>
          <line x1="120" y1="150" x2="165" y2="185" className="stroke-foreground/35" strokeWidth="1" />
          <line x1="165" y1="185" x2="150" y2="235" className="stroke-foreground/35" strokeWidth="1" />
          <circle cx="120" cy="150" r="9" className="fill-card stroke-foreground/50" strokeWidth="1" />
          <circle cx="165" cy="185" r="12" className={node} />
          <circle cx="150" cy="235" r="7" className="fill-card stroke-foreground/50" strokeWidth="1" />
        </g>

        {/* Four-point stars, twinkling out of phase */}
        {[
          [480, 110, 0],
          [90, 420, 1.3],
          [520, 470, 2.1],
          [400, 60, 0.7],
        ].map(([x, y, delay], i) => (
          <path
            key={i}
            d="M0 -9 L2 -2 L9 0 L2 2 L0 9 L-2 2 L-9 0 L-2 -2 Z"
            transform={`translate(${x} ${y})`}
            className={star}
            style={{ transformOrigin: `${x}px ${y}px`, animation: `twinkle 3.6s ease-in-out ${delay}s infinite` }}
          />
        ))}

        {/* Coordinate labels like a survey plate */}
        <text x="500" y="560" className="fill-muted-foreground" style={{ font: "10px var(--font-mono-face)", letterSpacing: "0.12em" }}>
          46.92° N
        </text>
        <text x="500" y="576" className="fill-muted-foreground" style={{ font: "10px var(--font-mono-face)", letterSpacing: "0.12em" }}>
          71.49° E
        </text>
      </svg>
    </div>
  );
}
