import { cn } from '@/lib/cn'

/**
 * Script Direct mark: a rounded tile holding a tilted capsule (the medicine)
 * with a mint status dot (the live tracking). No gradient <defs>, so it is safe
 * to render several times on one page without duplicate ids.
 */
export function BrandMark({
  className,
  tone = 'brand',
}: {
  className?: string
  tone?: 'brand' | 'light'
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] shadow-[0_6px_16px_-6px_rgb(37_99_235/0.7)]',
        tone === 'brand'
          ? 'bg-gradient-to-br from-brand-500 to-brand-700'
          : 'bg-white/10 ring-1 ring-white/20',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]">
        <g transform="rotate(-40 12 12)">
          <rect x="3" y="7.5" width="18" height="9" rx="4.5" fill="#fff" />
          <path d="M12 7.5h4.5a4.5 4.5 0 0 1 0 9H12z" fill="#93C5FD" />
          <rect x="11.35" y="7.5" width="1.3" height="9" fill="#2563EB" opacity="0.35" />
        </g>
      </svg>
      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-mint-500 ring-2 ring-white" />
    </span>
  )
}
