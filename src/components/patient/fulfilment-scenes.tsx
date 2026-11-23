/**
 * Inline SVG scenes for the delivery / collection section. Decorative only
 * (aria-hidden at the call site). Colours come from the brand scale so clinic
 * branding can still re-tint them.
 */

export function CollectScene({ className }: { className?: string }) {
  const stripes = Array.from({ length: 6 })
  return (
    <svg viewBox="0 0 480 340" className={className} aria-hidden>
      {/* ground */}
      <ellipse cx="240" cy="304" rx="210" ry="14" fill="var(--color-brand-200)" opacity="0.55" />

      {/* storefront */}
      <rect x="36" y="118" width="236" height="176" rx="20" fill="#fff" />
      <rect x="36" y="118" width="236" height="176" rx="20" fill="none" stroke="var(--color-brand-100)" strokeWidth="2" />
      {/* awning */}
      <g>
        {stripes.map((_, i) => (
          <rect
            key={i}
            x={36 + i * (236 / 6)}
            y="118"
            width={236 / 6}
            height="40"
            fill={i % 2 === 0 ? 'var(--color-brand-600)' : '#fff'}
          />
        ))}
        <path
          d={Array.from({ length: 6 }, (_, i) => `M${36 + i * (236 / 6)} 158 q${236 / 12} 16 ${236 / 6} 0`).join(' ')}
          fill="none"
          stroke="var(--color-brand-200)"
          strokeWidth="2"
        />
        <rect x="36" y="118" width="236" height="40" rx="20" fill="none" stroke="var(--color-brand-200)" strokeWidth="2" />
      </g>
      {/* sign */}
      <rect x="84" y="70" width="140" height="36" rx="18" fill="var(--color-ink-950)" />
      <rect x="98" y="80" width="16" height="16" rx="4" fill="var(--color-mint-500)" />
      <path d="M106 83v10M101 88h10" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <text x="124" y="93" fontSize="13" fontWeight="600" fill="#fff" fontFamily="var(--font-sans)">
        Pharmacy
      </text>
      {/* door + windows */}
      <rect x="124" y="190" width="64" height="104" rx="10" fill="var(--color-brand-100)" />
      <circle cx="176" cy="244" r="3.5" fill="var(--color-brand-600)" />
      <rect x="54" y="184" width="56" height="62" rx="10" fill="var(--color-brand-50)" stroke="var(--color-brand-200)" strokeWidth="2" />
      <rect x="202" y="184" width="56" height="62" rx="10" fill="var(--color-brand-50)" stroke="var(--color-brand-200)" strokeWidth="2" />

      {/* pickup counter */}
      <rect x="300" y="246" width="148" height="48" rx="14" fill="var(--color-ink)" />
      <rect x="300" y="240" width="148" height="14" rx="7" fill="var(--color-brand-600)" />

      {/* bag */}
      <g>
        <path d="M338 176h72l8 64h-88z" fill="#fff" stroke="var(--color-brand-200)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M356 176v-12a18 18 0 0 1 36 0v12" fill="none" stroke="var(--color-brand-600)" strokeWidth="4" strokeLinecap="round" />
        <rect x="350" y="196" width="48" height="22" rx="6" fill="var(--color-brand-50)" />
        <text x="374" y="211" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--color-brand-700)" fontFamily="var(--font-mono)">
          SD-7K4M
        </text>
      </g>

      {/* ready bubble */}
      <g>
        <circle className="sd-ping" cx="438" cy="120" r="11" fill="var(--color-mint-500)" />
        <circle cx="438" cy="120" r="11" fill="var(--color-mint-500)" />
        <path d="M433 120l3.6 3.6 6.4-7" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="318" y="100" width="104" height="40" rx="20" fill="#fff" stroke="var(--color-brand-100)" strokeWidth="2" />
        <text x="370" y="125" textAnchor="middle" fontSize="13" fontWeight="600" fill="var(--color-ink)" fontFamily="var(--font-sans)">
          Ready
        </text>
      </g>
    </svg>
  )
}

export function DeliveryScene({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 340" className={className} aria-hidden>
      {/* map blocks */}
      <g fill="#fff" opacity="0.75">
        <rect x="20" y="30" width="110" height="70" rx="14" />
        <rect x="150" y="20" width="90" height="60" rx="14" />
        <rect x="270" y="26" width="80" height="48" rx="14" />
        <rect x="30" y="140" width="80" height="60" rx="14" />
        <rect x="236" y="214" width="120" height="76" rx="14" />
        <rect x="372" y="206" width="84" height="84" rx="14" />
        <rect x="120" y="290" width="90" height="36" rx="14" />
      </g>
      <g fill="var(--color-mint-100)" opacity="0.8">
        <circle cx="64" cy="302" r="26" />
        <rect x="380" y="150" width="70" height="30" rx="15" />
      </g>

      {/* route */}
      <path
        d="M70 250 C 135 250, 150 175, 240 170 S 340 108, 410 100"
        fill="none"
        stroke="var(--color-brand-200)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        className="sd-route"
        d="M70 250 C 135 250, 150 175, 240 170 S 340 108, 410 100"
        fill="none"
        stroke="var(--color-brand-600)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* origin: pharmacy */}
      <g>
        <circle cx="70" cy="250" r="20" fill="#fff" />
        <circle cx="70" cy="250" r="20" fill="none" stroke="var(--color-brand-200)" strokeWidth="2" />
        <rect x="60" y="240" width="20" height="20" rx="5" fill="var(--color-mint-500)" />
        <path d="M70 244v12M64 250h12" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      </g>

      {/* destination: home */}
      <g>
        <circle className="sd-ping" cx="410" cy="100" r="22" fill="var(--color-brand-500)" />
        <circle cx="410" cy="100" r="22" fill="var(--color-brand-600)" />
        <path
          d="M399 101l11-10 11 10v11a2 2 0 0 1-2 2h-18a2 2 0 0 1-2-2z"
          fill="#fff"
        />
        <rect x="406" y="104" width="8" height="10" rx="1.5" fill="var(--color-brand-600)" />
        <rect x="352" y="46" width="108" height="30" rx="15" fill="var(--color-ink-950)" />
        <text x="406" y="66" textAnchor="middle" fontSize="12" fontWeight="600" fill="#fff" fontFamily="var(--font-sans)">
          Arriving soon
        </text>
      </g>

      {/* courier bubble (animated along the route; rests at the destination) */}
      {/* transform attribute = resting place (reduced motion); CSS animation overrides it */}
      <g className="sd-drive" transform="translate(410 100)">
        <circle r="23" fill="#fff" />
        <circle r="23" fill="none" stroke="var(--color-brand-600)" strokeWidth="2.5" />
        <g transform="translate(-13 -9)">
          <rect x="0" y="2" width="16" height="11" rx="2" fill="var(--color-brand-600)" />
          <path d="M16 5h5l4 4v4H16z" fill="var(--color-brand-400)" />
          <circle cx="6" cy="15" r="2.6" fill="var(--color-ink)" />
          <circle cx="20" cy="15" r="2.6" fill="var(--color-ink)" />
        </g>
      </g>
    </svg>
  )
}
