/**
 * Drawn-in-code covers for research that has no screenshot. Each is a small,
 * honest diagram of what the thing does, drawn in ink on the page's own
 * paper with one ember accent, so it sits in the page instead of punching a
 * dark hole in it. Animated with CSS only.
 */

const INK = "#0d0d0d";
const EMBER = "#ff5a1f";

function Grid({ id, w, h }: { id: string; w: number; h: number }) {
  return (
    <>
      <defs>
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M16 0H0V16" fill="none" stroke="rgba(13,13,13,0.07)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={w} height={h} fill="#ebe8df" />
      <rect width={w} height={h} fill={`url(#${id})`} />
    </>
  );
}

export function GradMeshVisual() {
  // A coordinator in the middle, eight worker GPUs around it, gradients pulsing in.
  const nodes = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    return { x: 200 + Math.cos(a) * 130, y: 112 + Math.sin(a) * 74, i };
  });
  return (
    <div className="wvis" aria-hidden="true">
      <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
        <Grid id="gm-grid" w={400} h={225} />
        {nodes.map((n) => (
          <g key={n.i}>
            <line x1="200" y1="112" x2={n.x} y2={n.y} stroke="rgba(13,13,13,0.22)" strokeWidth="1" />
            <line
              className="wvis__pulse"
              x1={n.x}
              y1={n.y}
              x2="200"
              y2="112"
              stroke={EMBER}
              strokeWidth="2"
              style={{ animationDelay: `${n.i * 0.22}s` }}
            />
            <rect x={n.x - 18} y={n.y - 11} width="36" height="22" rx="4" fill="#fff" stroke="rgba(13,13,13,0.45)" />
            <text x={n.x} y={n.y + 3.5} textAnchor="middle" fontSize="9" fill={INK} fontFamily="monospace">
              GPU{n.i + 1}
            </text>
          </g>
        ))}
        <rect x="170" y="96" width="60" height="32" rx="5" fill={EMBER} />
        <text x="200" y="116" textAnchor="middle" fontSize="10" fill="#fff" fontFamily="monospace" fontWeight="700">
          COORD
        </text>
        <text x="14" y="214" fontSize="9.5" fill="rgba(13,13,13,0.55)" fontFamily="monospace">
          up to 1.8× vs a single node · 4 GPU nodes
        </text>
      </svg>
    </div>
  );
}

export function ViksitVisual() {
  return (
    <div className="wvis" aria-hidden="true">
      <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
        <Grid id="vk-grid" w={400} h={225} />
        <text x="200" y="152" textAnchor="middle" fontSize="118" fontWeight="700" fill="none" stroke={EMBER} strokeWidth="1.6" fontFamily="sans-serif" letterSpacing="-6">
          2047
        </text>
        <text x="16" y="30" fontSize="9.5" fill="rgba(13,13,13,0.6)" fontFamily="monospace">
          AI FOR VIKSIT BHARAT · BOOK CHAPTER
        </text>
        <text x="16" y="208" fontSize="9.5" fill="rgba(13,13,13,0.6)" fontFamily="monospace">
          MNNIT ALLAHABAD · NATIONAL VOLUME
        </text>
      </svg>
    </div>
  );
}

export function VendorsVisual() {
  const chips = [
    { x: 70, label: "CUDA", sub: "NVIDIA" },
    { x: 200, label: "Intel", sub: "GPU" },
    { x: 330, label: "Metal", sub: "Apple Silicon" },
  ];
  return (
    <div className="wvis" aria-hidden="true">
      <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
        <Grid id="vd-grid" w={400} h={225} />
        <rect x="120" y="24" width="160" height="34" rx="5" fill={INK} />
        <text x="200" y="45" textAnchor="middle" fontSize="11" fill="#fff" fontFamily="monospace" fontWeight="700">
          ONE ORCHESTRATOR
        </text>
        {chips.map((c, i) => (
          <g key={c.label}>
            <path d={`M200 58 L${c.x} 132`} stroke="rgba(13,13,13,0.22)" strokeWidth="1" />
            <path className="wvis__pulse" d={`M200 58 L${c.x} 132`} stroke={EMBER} strokeWidth="2" style={{ animationDelay: `${i * 0.3}s` }} />
            <rect x={c.x - 46} y="132" width="92" height="58" rx="5" fill="#fff" stroke="rgba(13,13,13,0.4)" />
            <text x={c.x} y="159" textAnchor="middle" fontSize="15" fill={INK} fontWeight="600" fontFamily="sans-serif">
              {c.label}
            </text>
            <text x={c.x} y="177" textAnchor="middle" fontSize="9" fill="rgba(13,13,13,0.55)" fontFamily="monospace">
              {c.sub}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function OssVisual() {
  return (
    <div className="wvis" aria-hidden="true">
      <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
        <Grid id="os-grid" w={400} h={225} />
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            <rect x={26 + i * 52} y={150 - i * 12} width="40" height={40 + i * 12} rx="3" fill={i === 6 ? EMBER : "rgba(13,13,13,0.14)"} />
            <text x={46 + i * 52} y="212" textAnchor="middle" fontSize="9" fill="rgba(13,13,13,0.55)" fontFamily="monospace">
              PR{i + 1}
            </text>
          </g>
        ))}
        <text x="24" y="42" fontSize="20" fill={INK} fontWeight="600" fontFamily="sans-serif">
          7 merged in October
        </text>
        <text x="24" y="60" fontSize="9.5" fill="rgba(13,13,13,0.55)" fontFamily="monospace">
          LITMUSCHAOS · HACKTOBERFEST 2025
        </text>
      </svg>
    </div>
  );
}
