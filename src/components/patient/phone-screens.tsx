'use client'

import { Check, ClipboardPaste, Mail, Store, Truck } from 'lucide-react'
import { BrandMark } from '@/components/site/brand-mark'
import { useTypeIn } from '@/hooks/use-type-in'
import { cn } from '@/lib/cn'

/**
 * Full-height sample screens for the "How it works" phone. Every screen fills
 * the display (no dead space) and uses text of 12px or larger.
 */

function ScreenShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('sd-pop flex min-h-[430px] flex-col gap-3.5', className)}>{children}</div>
}

function Heading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">{kicker}</p>
      <p className="mt-0.5 text-[20px] font-semibold leading-tight text-ink">{title}</p>
    </div>
  )
}

function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-auto rounded-xl bg-brand-600 px-3 py-3 text-center text-[13px] font-semibold text-white shadow-[var(--shadow-glow)]">
      {children}
    </div>
  )
}

function SkeletonField({ label, width }: { label: string; width: string }) {
  return (
    <div>
      <p className="text-[12px] font-medium text-ink">{label}</p>
      <div className="mt-1 flex h-10 items-center rounded-xl border border-line bg-white px-3">
        <span className={cn('h-2 rounded-full bg-brand-100', width)} />
      </div>
    </div>
  )
}

export function TokenScreen() {
  const typed = useTypeIn('4K7M9PX2LQ8D', { delayMs: 350, stepMs: 70 })
  return (
    <ScreenShell>
      <Heading kicker="Step 1 of 3" title="Your eScript" />
      <div>
        <p className="text-[12px] font-medium text-ink">eScript token</p>
        <div className="mt-1 flex items-center gap-2 rounded-xl border-2 border-brand-500 bg-white px-3 py-3 shadow-[0_0_0_4px_rgb(37_99_235/0.12)]">
          <span className="min-h-[22px] flex-1 font-mono text-[15px] font-semibold tracking-[0.14em] text-ink">
            {typed.visible}
            {!typed.done ? (
              <span className="sd-caret ml-px inline-block h-[15px] w-[2px] translate-y-0.5 bg-brand-600" />
            ) : null}
          </span>
          {typed.done ? (
            <span className="sd-pop flex h-5 w-5 items-center justify-center rounded-full bg-mint-500 text-white">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
          ) : null}
        </div>
        <p
          className={cn(
            'mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-mint-700 transition-opacity duration-300',
            typed.done ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> Token format looks right
        </p>
      </div>
      <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-[12px] font-medium text-brand-700">
        <ClipboardPaste className="h-3.5 w-3.5" aria-hidden /> Paste from clipboard
      </div>
      <SkeletonField label="Full name" width="w-24" />
      <SkeletonField label="Mobile" width="w-20" />
      <PrimaryButton>Continue</PrimaryButton>
    </ScreenShell>
  )
}

export function FulfilmentScreen() {
  return (
    <ScreenShell>
      <Heading kicker="Step 2 of 3" title="How would you like it?" />
      <div className="grid grid-cols-2 gap-2.5">
        <div className="relative rounded-2xl border-2 border-brand-500 bg-brand-50 p-3 shadow-[0_0_0_4px_rgb(37_99_235/0.1)]">
          <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
            <Store className="h-5 w-5" />
          </span>
          <p className="mt-3 text-[14px] font-semibold text-ink">Collect</p>
          <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">From your partner pharmacy</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Truck className="h-5 w-5" />
          </span>
          <p className="mt-3 text-[14px] font-semibold text-ink">Deliver</p>
          <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">To your door</p>
        </div>
      </div>
      <div className="rounded-xl bg-brand-50 px-3 py-2.5 text-[12px] leading-relaxed text-ink-muted">
        No delivery fee on collection. If you choose delivery, the fee is shown before you pay.
      </div>
      <SkeletonField label="Email for your private status link" width="w-32" />
      <PrimaryButton>Submit order</PrimaryButton>
    </ScreenShell>
  )
}

export function EmailScreen() {
  return (
    <ScreenShell>
      <Heading kicker="Inbox" title="Script Direct" />
      <div className="flex items-start gap-3 rounded-2xl border border-line bg-white p-3 shadow-sm">
        <BrandMark className="h-10 w-10" />
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[13px] font-semibold text-ink">Sample Pharmacy A</p>
            <p className="shrink-0 text-[11px] text-ink-muted">now</p>
          </div>
          <p className="text-[13px] font-medium text-ink">Your payment link is ready</p>
          <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
            We checked your script. Pay securely to start dispensing.
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-brand-50 to-white p-4 text-center ring-1 ring-brand-100">
        <span className="sd-pulse-ring relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-brand-600">
          <Mail className="h-6 w-6 text-white" />
        </span>
        <p className="mt-4 text-[15px] font-semibold text-ink">Payment link emailed</p>
        <p className="mt-1 text-[12px] leading-snug text-ink-muted">
          A secure Stripe link was sent to your email.
        </p>
      </div>
      <PrimaryButton>Open Stripe link</PrimaryButton>
    </ScreenShell>
  )
}

export function TrackerScreen() {
  const rows = ['Order submitted', 'Pharmacy verified', 'Paid']
  return (
    <ScreenShell>
      <Heading kicker="Reference" title="SD-7K4M-2QXP" />
      <div className="flex items-center gap-3 rounded-2xl bg-ink-950 p-3.5 text-white">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint-500">
          <Store className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[14px] font-semibold">Ready for collection</p>
          <p className="text-[12px] text-white/70">Your partner pharmacy</p>
        </div>
      </div>
      <ol className="space-y-2.5">
        {rows.map((row) => (
          <li key={row} className="flex items-center gap-2.5 text-[13px] text-ink">
            <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-brand-600 text-white">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            {row}
          </li>
        ))}
        <li className="flex items-center gap-2.5 text-[13px] font-semibold text-ink">
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white text-[10px] font-bold text-mint-700 ring-2 ring-mint-500">
            4
          </span>
          Ready to collect
        </li>
      </ol>
      <div className="rounded-xl bg-brand-50 px-3 py-2.5 text-[12px] leading-relaxed text-ink-muted">
        Show your reference at the counter. Bookmark this private link to check again any time.
      </div>
      <PrimaryButton>Done</PrimaryButton>
    </ScreenShell>
  )
}

export const stepScreens = [TokenScreen, FulfilmentScreen, EmailScreen, TrackerScreen] as const
