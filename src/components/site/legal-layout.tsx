'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ArrowUp, Link as LinkIcon } from 'lucide-react'
import { Container } from './container'
import { cn } from '@/lib/cn'

export function LegalLayout({
  title,
  version,
  children,
  otherHref,
  otherLabel,
}: {
  title: string
  version: string
  children: ReactNode
  otherHref: string
  otherLabel: string
}) {
  const [heads, setHeads] = useState<{ id: string; text: string }[]>([])
  const [active, setActive] = useState('')
  const [showTop, setShowTop] = useState(false)
  const draft = version.includes('placeholder') || version.startsWith('0.')

  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLHeadingElement>('#legal-prose h2'),
    )
    const mapped = nodes.map((h, i) => {
      if (!h.id) h.id = `section-${i + 1}`
      return { id: h.id, text: h.textContent ?? `Section ${i + 1}` }
    })
    setHeads(mapped)

    const onScroll = () => {
      setShowTop(window.scrollY > 400)
      let current = mapped[0]?.id ?? ''
      for (const { id } of mapped) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= 140) current = id
      }
      if (current) setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const toc = useMemo(() => heads, [heads])

  async function copySection(id: string) {
    const url = `${window.location.origin}${window.location.pathname}#${id}`
    await navigator.clipboard.writeText(url)
  }

  return (
    <main className="relative">
      <div className="border-b border-line bg-brand-50/60">
        <Container className="py-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-badge bg-brand-100 px-2.5 py-0.5 text-xs font-bold text-brand-700">
              Version {version}
            </span>
            {draft ? (
              <span className="rounded-badge bg-warning-bg px-2.5 py-0.5 text-xs font-bold text-warning">
                Draft
              </span>
            ) : null}
          </div>
          <h1 className="sd-display sd-display-lg mt-3">{title}</h1>
        </Container>
      </div>

      <Container className="grid gap-10 py-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="no-print lg:sticky lg:top-28 lg:self-start">
          <details className="rounded-card border border-line bg-surface p-3 lg:hidden">
            <summary className="cursor-pointer font-semibold text-heading">
              On this page
            </summary>
            <nav className="mt-3 space-y-1" aria-label="Table of contents">
              {toc.map((h) => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  className="block rounded-sm px-2 py-1.5 text-sm text-ink-muted hover:text-brand-700"
                >
                  {h.text}
                </a>
              ))}
            </nav>
          </details>
          <nav className="hidden lg:block" aria-label="Table of contents">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
              On this page
            </p>
            <ul className="mt-3 space-y-1">
              {toc.map((h) => (
                <li key={h.id}>
                  <a
                    href={`#${h.id}`}
                    className={cn(
                      'relative block border-l-2 py-1.5 pl-3 text-sm transition-colors',
                      active === h.id
                        ? 'border-brand-600 font-semibold text-brand-700'
                        : 'border-transparent text-ink-muted hover:text-ink',
                    )}
                  >
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div>
          <div
            id="legal-prose"
            className="prose-measure space-y-4 text-base leading-relaxed text-ink-muted [&_h2]:group [&_h2]:relative [&_h2]:mt-10 [&_h2]:scroll-mt-28 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-heading"
            onClick={(e) => {
              const h = (e.target as HTMLElement).closest('h2')
              if (h?.id) void copySection(h.id)
            }}
          >
            {children}
          </div>

          <div className="mt-12 rounded-card border border-line bg-brand-50/50 p-5 no-print">
            <p className="font-semibold text-heading">Related</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link href={otherHref} className="font-semibold text-brand-700 hover:underline">
                  {otherLabel}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="font-semibold text-brand-700 hover:underline">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      {showTop ? (
        <button
          type="button"
          className="fixed bottom-6 right-6 z-40 inline-flex min-h-11 items-center gap-2 rounded-badge border border-line bg-surface px-3 text-sm font-semibold text-ink shadow-md focus-ring no-print"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUp className="h-4 w-4" aria-hidden />
          Back to top
        </button>
      ) : null}

      <span className="sr-only">
        <LinkIcon />
      </span>
    </main>
  )
}
