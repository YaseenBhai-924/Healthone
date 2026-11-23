/** Compact flat-duotone SVGs (brand-600 / brand-200). Keep each under ~3KB. */

export function SmsTokenArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect x="8" y="12" width="48" height="36" rx="10" fill="#BFDBFE" />
      <rect x="14" y="18" width="36" height="20" rx="4" fill="#fff" />
      <path d="M24 48 L32 40 L40 48" fill="#BFDBFE" />
      <text x="32" y="32" textAnchor="middle" fontSize="8" fontFamily="ui-monospace,monospace" fill="#2563EB">
        4K7M
      </text>
    </svg>
  )
}

export function EmailLinkArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect x="6" y="16" width="52" height="34" rx="6" fill="#BFDBFE" />
      <path d="M6 22 L32 38 L58 22" fill="none" stroke="#2563EB" strokeWidth="3" />
      <rect x="20" y="28" width="24" height="6" rx="2" fill="#2563EB" opacity="0.85" />
    </svg>
  )
}

export function PharmacyBagArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path d="M18 24 h28 l4 28 H14 z" fill="#BFDBFE" />
      <path d="M22 24 V18 a10 10 0 0 1 20 0 v6" fill="none" stroke="#2563EB" strokeWidth="3" />
      <rect x="28" y="34" width="8" height="12" rx="1" fill="#2563EB" />
    </svg>
  )
}

export function DeliveryVanArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect x="6" y="26" width="34" height="18" rx="3" fill="#BFDBFE" />
      <path d="M40 30 h12 l6 10 H40 z" fill="#93C5FD" />
      <circle cx="18" cy="46" r="5" fill="#2563EB" />
      <circle cx="48" cy="46" r="5" fill="#2563EB" />
    </svg>
  )
}

export function ShieldCheckArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path
        d="M32 8 L52 16 V32 C52 44 40 52 32 56 C24 52 12 44 12 32 V16 Z"
        fill="#BFDBFE"
      />
      <path
        d="M22 32 L29 39 L44 22"
        fill="none"
        stroke="#2563EB"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function EnvelopeLinkArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 64" className={className} aria-hidden>
      <rect x="8" y="12" width="64" height="40" rx="8" fill="#BFDBFE" />
      <path d="M8 20 L40 40 L72 20" fill="none" stroke="#2563EB" strokeWidth="3" />
      <rect x="28" y="28" width="24" height="8" rx="2" fill="#2563EB" />
    </svg>
  )
}
