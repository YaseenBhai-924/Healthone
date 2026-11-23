import { ShieldCheck, Store, CreditCard } from 'lucide-react'
import { trustPoints } from '@/lib/patient/copy'
import { Reveal } from './reveal'

const icons = [ShieldCheck, Store, CreditCard]

export function TrustStrip() {
  return (
    <section aria-labelledby="trust-heading">
      <Reveal>
        <h2
          id="trust-heading"
          className="font-display text-center text-3xl font-bold tracking-tight text-brand-800 sm:text-4xl"
        >
          Built for trust
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-fg-muted">
          Calm, private, and clinic-led, without the noise of consumer pharmacy
          apps.
        </p>
      </Reveal>
      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {trustPoints.map((point, i) => {
          const Icon = icons[i]!
          return (
            <Reveal key={point.title} as="li" delayMs={i * 80}>
              <div className="flex h-full gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_36px_-28px_rgba(15,23,42,0.35)]">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-brand-700">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-brand-800">
                    {point.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                    {point.body}
                  </p>
                </div>
              </div>
            </Reveal>
          )
        })}
      </ul>
    </section>
  )
}
