import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/site'
import { ctaBand } from '@/lib/patient/copy'
import { cn } from '@/lib/cn'
import { Reveal } from './reveal'

/** Decorative capsule (echoes the logo). Rotation comes in via className. */
function Capsule({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute block h-9 w-[5.5rem] overflow-hidden rounded-full shadow-[0_18px_30px_-12px_rgb(7_23_44/0.5)]',
        className,
      )}
    >
      <span className="absolute inset-y-0 left-0 w-1/2 bg-white" />
      <span className="absolute inset-y-0 right-0 w-1/2 bg-brand-200" />
      <span className="absolute inset-y-1 left-1 w-1/3 rounded-full bg-white/70" />
    </span>
  )
}

/**
 * Closing call to action: an inset gradient card that overlaps the footer by
 * 4rem. `sd-dark` supplies the white heading + light italic accent.
 */
export function CtaBand() {
  const parts = ctaBand.title.split(ctaBand.highlight)

  return (
    <section className="relative z-10 -mb-16 px-5 pb-0 pt-4 sm:px-8">
      <Container className="px-0 sm:px-0">
        <Reveal>
          <div className="sd-dark relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 px-6 py-16 text-center text-white shadow-[0_50px_100px_-40px_rgb(30_64_175/0.8)] sm:rounded-[2.75rem] sm:px-12 sm:py-24">
            <div className="sd-grid-lines-dark absolute inset-0 -z-10 opacity-70" aria-hidden />
            <div className="sd-orb sd-orb-2 -right-24 -top-24 -z-10 h-80 w-80 opacity-70" aria-hidden />
            <div className="sd-orb sd-orb-3 -bottom-28 -left-16 -z-10 h-72 w-72 opacity-80" aria-hidden />
            <div className="sd-noise absolute inset-0 -z-10 opacity-30" aria-hidden />

            <Capsule className="sd-float left-[6%] top-[14%] hidden -rotate-[28deg] sm:block" />
            <Capsule className="sd-float-slow bottom-[14%] right-[7%] hidden rotate-[24deg] sm:block" />
            <Capsule className="sd-float-slow right-[26%] top-[9%] hidden rotate-[62deg] scale-75 lg:block" />

            <h2 className="sd-display sd-display-lg mx-auto max-w-3xl">
              {parts[0]}
              <em>{ctaBand.highlight}</em>
              {parts[1]}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-brand-100">
              {ctaBand.body}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/order"
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-white pl-7 pr-2 text-base font-semibold text-brand-800 shadow-[0_18px_36px_-14px_rgb(7_23_44/0.6)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 focus-ring"
              >
                {ctaBand.primary}
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
              <Link
                href="/status/lost-link"
                className="inline-flex h-14 items-center rounded-full border border-white/30 bg-white/10 px-7 text-base font-semibold text-white backdrop-blur transition-colors duration-200 hover:bg-white/20 focus-ring"
              >
                {ctaBand.secondary}
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
