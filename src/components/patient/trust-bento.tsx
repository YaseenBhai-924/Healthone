import { Check, EyeOff, Link2, Lock, ShieldCheck, Store } from 'lucide-react'
import { trustCards } from '@/lib/patient/copy'
import { cn } from '@/lib/cn'
import { Reveal } from './reveal'
import { SpotCard } from './spot-card'

function Tile({
  className,
  children,
  delayMs = 0,
}: {
  className?: string
  children: React.ReactNode
  delayMs?: number
}) {
  return (
    <Reveal delayMs={delayMs} className={className}>
      <SpotCard
        className="group h-full [--sd-spot-color:rgb(96_165_250/0.18)] rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm transition-[transform,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] sm:p-8"
      >
        {children}
      </SpotCard>
    </Reveal>
  )
}

function TileHeading({ title, body }: { title: string; body: string }) {
  return (
    <>
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2.5 max-w-sm text-[15px] leading-relaxed text-white/70">{body}</p>
    </>
  )
}

function IconTile({ icon: Icon }: { icon: typeof Lock }) {
  return (
    <span className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-brand-200 ring-1 ring-white/15">
      <Icon className="h-5 w-5" aria-hidden />
    </span>
  )
}

function LockVisual() {
  return (
    <svg viewBox="0 0 160 160" className="h-40 w-40 shrink-0 sm:h-48 sm:w-48" aria-hidden>
      <circle cx="80" cy="84" r="62" fill="rgb(37 99 235 / 0.22)" />
      <circle cx="80" cy="84" r="44" fill="rgb(56 189 248 / 0.16)" />
      <path
        className="sd-lock-shackle"
        d="M56 74V56a24 24 0 0 1 48 0v18"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.9"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <rect x="38" y="72" width="84" height="66" rx="18" fill="var(--color-brand-500)" />
      <rect x="38" y="72" width="84" height="30" rx="15" fill="#fff" opacity="0.12" />
      <circle cx="80" cy="100" r="8" fill="#fff" />
      <rect x="77" y="104" width="6" height="16" rx="3" fill="#fff" />
    </svg>
  )
}

export function TrustBento() {
  const [noAccount, partner, payAfter, privateLink] = trustCards

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* No account: wide, animated lock */}
      <Tile className="lg:col-span-2" delayMs={0}>
        <div className="flex h-full flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <IconTile icon={Lock} />
            <TileHeading title={noAccount.title} body={noAccount.body} />
            <div className="mt-6 flex flex-wrap gap-2">
              {['No password', 'No login', 'Just your details'].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/10 px-3 py-1 text-[13px] font-medium text-white/85 ring-1 ring-white/10"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <LockVisual />
        </div>
      </Tile>

      {/* Partner pharmacy */}
      <Tile delayMs={80}>
        <IconTile icon={Store} />
        <TileHeading title={partner.title} body={partner.body} />
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-mint-500 text-white">
            <span className="sd-pulse-ring absolute inset-0 rounded-xl text-mint-500" aria-hidden />
            <svg viewBox="0 0 24 24" className="relative h-5 w-5" aria-hidden>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </span>
          <div>
            <p className="text-[13px] font-semibold">Your partner pharmacy</p>
            <p className="text-[12px] text-white/60">Dispenses your script</p>
          </div>
        </div>
      </Tile>

      {/* Pay after verification */}
      <Tile delayMs={0}>
        <IconTile icon={ShieldCheck} />
        <TileHeading title={payAfter.title} body={payAfter.body} />
        <ul className="mt-6 space-y-2.5">
          {[
            { label: 'Script verified', done: true },
            { label: 'Payment link emailed', done: true },
            { label: 'You pay', done: false },
          ].map((s) => (
            <li key={s.label} className="flex items-center gap-2.5 text-[13px] text-white/85">
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full',
                  s.done ? 'bg-mint-500 text-white' : 'bg-white/10 text-white/60 ring-1 ring-white/20',
                )}
              >
                {s.done ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> : null}
              </span>
              {s.label}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs font-medium text-white/60">Payments by Stripe</p>
      </Tile>

      {/* Private status link: wide */}
      <Tile className="lg:col-span-2" delayMs={80}>
        <div className="flex h-full flex-col justify-between gap-6">
          <div>
            <IconTile icon={Link2} />
            <TileHeading title={privateLink.title} body={privateLink.body} />
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-ink-950/70 px-4 py-3.5 ring-1 ring-white/10">
            <Lock className="h-4 w-4 shrink-0 text-mint-300" aria-hidden />
            <span className="min-w-0 truncate font-mono text-[13px] text-white/80">
              /status#<span className="text-white/40">••••••••••••••••••••</span>
            </span>
            <EyeOff className="ml-auto h-4 w-4 shrink-0 text-white/50" aria-hidden />
          </div>
        </div>
      </Tile>
    </div>
  )
}
