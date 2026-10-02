/**
 * Drawn-in-code covers for work that has no screenshot. Each is a small,
 * honest diagram of what the thing does, animated with CSS only.
 */

export function GradMeshVisual() {
  // A coordinator in the middle, eight worker GPUs around it, gradients pulsing in.
  const nodes = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    return { x: 200 + Math.cos(a) * 128, y: 150 + Math.sin(a) * 96, i };
  });
  return (
    <div className="wvis wvis--mesh" aria-hidden="true">
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="gm-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff5a1f" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ff5a1f" stopOpacity="0" />
          </radialGradient>
          <pattern id="gm-grid" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M16 0H0V16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill="url(#gm-grid)" />
        <circle cx="200" cy="150" r="110" fill="url(#gm-glow)" />
        {nodes.map((n) => (
          <g key={n.i}>
            <line x1="200" y1="150" x2={n.x} y2={n.y} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <line
              className="wvis__pulse"
              x1={n.x}
              y1={n.y}
              x2="200"
              y2="150"
              stroke="#ff7a3d"
              strokeWidth="2"
              style={{ animationDelay: `${n.i * 0.22}s` }}
            />
            <rect x={n.x - 17} y={n.y - 11} width="34" height="22" rx="3" fill="#141414" stroke="rgba(255,255,255,0.4)" />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="9" fill="#fff" fontFamily="monospace">
              GPU{n.i + 1}
            </text>
          </g>
        ))}
        <rect x="168" y="132" width="64" height="36" rx="4" fill="#ff5a1f" />
        <text x="200" y="154" textAnchor="middle" fontSize="10" fill="#fff" fontFamily="monospace" fontWeight="700">
          COORD
        </text>
        <text x="16" y="284" fontSize="10" fill="rgba(255,255,255,0.55)" fontFamily="monospace">
          up to 1.8× vs single node · 4 GPU nodes
        </text>
      </svg>
    </div>
  );
}

export function BlockPartyVisual() {
  const steps = [
    { x: 40, label: "Bounty", sub: "created" },
    { x: 150, label: "Webhook", sub: "auto-wired" },
    { x: 260, label: "PR", sub: "watched live" },
    { x: 370, label: "Merged", sub: "bounty paid" },
  ];
  return (
    <div className="wvis wvis--flow" aria-hidden="true">
      <svg viewBox="0 0 410 300" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="bp-dots" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.08)" />
          </pattern>
        </defs>
        <rect width="410" height="300" fill="url(#bp-dots)" />
        <path d="M40 150 H370" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 6" />
        <path className="wvis__flow" d="M40 150 H370" stroke="#ff5a1f" strokeWidth="2.5" fill="none" />
        {steps.map((s, i) => (
          <g key={s.label}>
            <circle cx={s.x} cy="150" r="16" fill={i === 3 ? "#ff5a1f" : "#141414"} stroke="#fff" strokeOpacity="0.5" />
            <text x={s.x} y="155" textAnchor="middle" fontSize="12" fill="#fff" fontFamily="monospace">
              {i === 3 ? "✓" : i + 1}
            </text>
            <text x={s.x} y="196" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="600" fontFamily="sans-serif">
              {s.label}
            </text>
            <text x={s.x} y="213" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.55)" fontFamily="monospace">
              {s.sub}
            </text>
          </g>
        ))}
        <text x="20" y="60" fontSize="22" fill="#fff" fontWeight="600" fontFamily="sans-serif">
          git merge → paid.
        </text>
        <text x="20" y="80" fontSize="10" fill="rgba(255,255,255,0.55)" fontFamily="monospace">
          GitHub OAuth · role-based access · webhooks
        </text>
      </svg>
    </div>
  );
}

export function ViksitVisual() {
  return (
    <div className="wvis wvis--type" aria-hidden="true">
      <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="225" fill="#130604" />
        <text x="200" y="150" textAnchor="middle" fontSize="120" fontWeight="700" fill="none" stroke="#ff7a3d" strokeOpacity="0.55" fontFamily="sans-serif" letterSpacing="-6">
          2047
        </text>
        <text x="20" y="32" fontSize="10" fill="rgba(255,255,255,0.6)" fontFamily="monospace">
          AI FOR VIKSIT BHARAT · BOOK CHAPTER
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
    <div className="wvis wvis--vendors" aria-hidden="true">
      <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="225" fill="#0d0d0d" />
        <rect x="120" y="22" width="160" height="34" rx="4" fill="#ff5a1f" />
        <text x="200" y="44" textAnchor="middle" fontSize="12" fill="#fff" fontFamily="monospace" fontWeight="700">
          ONE ORCHESTRATOR
        </text>
        {chips.map((c, i) => (
          <g key={c.label}>
            <path className="wvis__pulse" d={`M200 56 L${c.x} 130`} stroke="#ff7a3d" strokeWidth="2" style={{ animationDelay: `${i * 0.3}s` }} />
            <path d={`M200 56 L${c.x} 130`} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <rect x={c.x - 46} y="130" width="92" height="58" rx="4" fill="#1a1a1a" stroke="rgba(255,255,255,0.35)" />
            <text x={c.x} y="157" textAnchor="middle" fontSize="15" fill="#fff" fontWeight="600" fontFamily="sans-serif">
              {c.label}
            </text>
            <text x={c.x} y="175" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.55)" fontFamily="monospace">
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
    <div className="wvis wvis--oss" aria-hidden="true">
      <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice">
        <rect width="400" height="225" fill="#0d0d0d" />
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i}>
            <rect x={26 + i * 52} y={150 - i * 12} width="40" height={40 + i * 12} rx="3" fill={i === 6 ? "#ff5a1f" : "#262626"} />
            <text x={46 + i * 52} y="212" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.55)" fontFamily="monospace">
              PR{i + 1}
            </text>
          </g>
        ))}
        <text x="24" y="40" fontSize="20" fill="#fff" fontWeight="600" fontFamily="sans-serif">
          7 merged in October
        </text>
        <text x="24" y="58" fontSize="10" fill="rgba(255,255,255,0.55)" fontFamily="monospace">
          LITMUSCHAOS · HACKTOBERFEST 2025
        </text>
      </svg>
    </div>
  );
}
