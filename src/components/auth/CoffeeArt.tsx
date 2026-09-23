/** Hand-drawn style takeaway cup with steam, beans and sparkles, drawn in one ink colour. */
export function CoffeeArt() {
  return (
    <svg className="coffee-art" viewBox="0 0 360 330" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g className="coffee-steam">
        <path d="M152 92c-10-12 8-22-2-36s8-24 2-34" />
        <path d="M182 84c-12-14 10-26-1-42s9-28 1-40" />
        <path d="M212 92c-10-12 8-22-2-36s8-24 2-34" />
      </g>

      <path d="M128 128c4-20 26-30 52-30s48 10 52 30" />
      <path d="M196 106c6 1 12 4 14 8" />
      <rect x="112" y="128" width="136" height="18" rx="9" />
      <path d="M124 146l14 128c1 8 6 12 14 12h56c8 0 13-4 14-12l14-128" />
      <path d="M131 172h98" opacity=".35" />
      <ellipse cx="180" cy="222" rx="18" ry="24" fill="currentColor" transform="rotate(-8 180 222)" />
      <path d="M175 200c8 10-6 22 4 44" stroke="var(--art-bg)" strokeWidth="3" />

      <g className="coffee-bubble">
        <path d="M268 92a24 24 0 1 1 10 20l-16 10 5-16a24 24 0 0 1 1-14z" />
        <path d="M286 100c-6-4-12-8-12-13a5 5 0 0 1 12-2 5 5 0 0 1 12 2c0 5-6 9-12 13z" fill="currentColor" />
      </g>

      <path className="coffee-spark" d="M74 128l6 16 16 6-16 6-6 16-6-16-16-6 16-6z" />
      <path className="coffee-spark coffee-spark-b" d="M284 176l4 12 12 4-12 4-4 12-4-12-12-4 12-4z" />

      <g transform="rotate(-24 70 262)">
        <ellipse cx="70" cy="262" rx="30" ry="18" />
        <path d="M44 258c16 6 36 6 52 0" />
        <path d="M58 270l2 6M68 272l1 6M78 271l0 6" strokeWidth="2.4" />
      </g>
      <g transform="rotate(20 272 272)">
        <ellipse cx="272" cy="272" rx="24" ry="20" />
        <path d="M262 258c10 8 10 20 0 28" />
      </g>
      <g transform="rotate(-14 316 280)">
        <ellipse cx="316" cy="280" rx="18" ry="22" />
        <path d="M310 262c8 8 8 26 0 36" />
      </g>
      <ellipse cx="104" cy="206" rx="6" ry="9" transform="rotate(20 104 206)" />
      <ellipse cx="120" cy="296" rx="6" ry="9" transform="rotate(-30 120 296)" />
      <ellipse cx="262" cy="148" rx="6" ry="9" transform="rotate(30 262 148)" />
    </svg>
  );
}
