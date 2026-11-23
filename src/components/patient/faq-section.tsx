import Link from 'next/link'
import { ArrowUpRight, MessageCircleQuestion } from 'lucide-react'
import { Accordion } from '@/components/ui'
import { Container, Eyebrow } from '@/components/site'
import { faqItems } from '@/lib/patient/copy'
import { Reveal } from './reveal'

/** FAQ: sticky heading + help card on the left, accordion on the right. */
export function FaqSection() {
  return (
    <section id="faq" className="sd-section bg-brand-50/70">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="sd-display sd-display-lg mt-4">
            Common <em className="text-brand-600">questions</em>
          </h2>
          <p className="lead prose-measure mt-4 text-ink-muted">
            Straight answers about tokens, payment, and tracking your order.
          </p>

          <div className="mt-8 flex max-w-sm items-start gap-4 rounded-3xl border border-ink/10 bg-white p-5 shadow-[0_24px_48px_-32px_rgb(15_42_74/0.35)]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <MessageCircleQuestion className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="font-semibold text-heading">Still unsure?</p>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                The HealthOne team can help with your order.
              </p>
              <Link
                href="/contact"
                className="group mt-3 inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-brand-700 focus-ring rounded-sm"
              >
                Contact us
                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>
          </div>
        </div>

        <Reveal>
          <Accordion items={faqItems} defaultOpenId={faqItems[0].id} />
        </Reveal>
      </Container>
    </section>
  )
}
