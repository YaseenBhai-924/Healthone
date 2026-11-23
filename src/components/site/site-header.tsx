'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Menu, X } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { cn } from '@/lib/cn'
import { brandName } from '@/lib/patient/copy'
import { BrandMark } from './brand-mark'
import { SkipLink } from './skip-link'
import { ScrollProgress } from './scroll-progress'

const links = [
  { href: '/#how-it-works', label: 'How it works', section: 'how-it-works' },
  { href: '/status/lost-link', label: 'Track order', match: '/status' },
  { href: '/contact', label: 'Contact', match: '/contact' },
] as const

/**
 * Floating pill navbar.
 * - Active state on the home page is scroll-spied ("How it works" only lights
 *   while that section is on screen), elsewhere it follows the pathname.
 * - One sliding indicator follows hover/focus and returns to the active link.
 * - Mobile: full-screen sheet with focus trap, Escape, and scroll lock.
 */
export function SiteHeader({ showProgress = true }: { showProgress?: boolean }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [inHowItWorks, setInHowItWorks] = useState(false)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null)
  const panelId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const openRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Scroll-spy for the in-page "How it works" anchor (home only).
  useEffect(() => {
    if (pathname !== '/') {
      setInHowItWorks(false)
      return
    }
    const el = document.getElementById('how-it-works')
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => setInHowItWorks(Boolean(entry?.isIntersecting)),
      { rootMargin: '-35% 0px -55% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [pathname])

  const activeIdx = links.findIndex((link) => {
    if ('section' in link) return pathname === '/' && inHowItWorks
    return pathname === link.match || pathname.startsWith(`${link.match}/`)
  })

  const targetIdx = hoverIdx ?? (activeIdx >= 0 ? activeIdx : null)

  useEffect(() => {
    const measure = () => {
      const el = targetIdx === null ? null : linkRefs.current[targetIdx]
      if (!el) {
        setIndicator(null)
        return
      }
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [targetIdx])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const menuButton = openRef.current
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      menuButton?.focus()
    }
  }, [open])

  const trapFocus = useCallback(
    (e: ReactKeyboardEvent) => {
      if (e.key !== 'Tab' || !open) return
      const root = document.getElementById(panelId)
      if (!root) return
      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    },
    [open, panelId],
  )

  const hoverIsActive = targetIdx !== null && targetIdx === activeIdx

  return (
    <>
      <SkipLink />
      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
        <div
          className={cn(
            'relative mx-auto flex max-w-5xl items-center justify-between gap-3 overflow-hidden rounded-full border pl-3 pr-2 transition-[height,background-color,box-shadow,border-color] duration-300 ease-out',
            'bg-white/90 backdrop-blur-xl backdrop-saturate-150',
            scrolled
              ? 'h-14 border-white/70 shadow-[0_12px_32px_-12px_rgb(15_42_74/0.28)]'
              : 'h-16 border-white/60 shadow-[0_8px_28px_-14px_rgb(15_42_74/0.2)]',
          )}
        >
          <Link
            href="/"
            className="group flex items-center gap-2.5 rounded-full py-1 pr-3 focus-ring"
            aria-label={`${brandName} home`}
          >
            <BrandMark className="transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-105" />
            <span className="text-[1.05rem] font-semibold tracking-tight text-ink">
              {brandName}
            </span>
          </Link>

          <nav
            ref={navRef}
            className="relative hidden items-center md:flex"
            aria-label="Primary"
            onPointerLeave={() => setHoverIdx(null)}
          >
            {/* Client-only (indicator is measured after mount): style is applied via the CSSOM, which the CSP allows. */}
            {indicator ? (
              <span
                aria-hidden
                className={cn(
                  'absolute inset-y-0 my-auto h-9 rounded-full transition-[transform,width,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  hoverIsActive ? 'bg-brand-100/80' : 'bg-ink/[0.06]',
                )}
                style={{
                  width: indicator.width,
                  transform: `translateX(${indicator.left}px)`,
                }}
              />
            ) : null}
            {links.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                ref={(el) => {
                  linkRefs.current[i] = el
                }}
                aria-current={i === activeIdx ? 'page' : undefined}
                onPointerEnter={() => setHoverIdx(i)}
                onFocus={() => setHoverIdx(i)}
                onBlur={() => setHoverIdx(null)}
                className={cn(
                  'relative z-[1] rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 focus-ring',
                  i === activeIdx ? 'text-brand-700' : 'text-ink-muted hover:text-ink',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <Link
              href="/order"
              className="sd-sheen group inline-flex h-11 items-center gap-2 rounded-full bg-ink-950 pl-5 pr-2 text-sm font-semibold text-white transition-[background-color,box-shadow] duration-200 hover:bg-brand-700 hover:shadow-[var(--shadow-glow)] focus-ring"
            >
              Start order
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </span>
            </Link>
          </div>

          <button
            ref={openRef}
            type="button"
            className={cn(
              'inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/80 text-ink md:hidden focus-ring',
              open && 'invisible pointer-events-none',
            )}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          {showProgress ? <ScrollProgress /> : null}
        </div>
      </header>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="sd-dark fixed inset-0 z-[60] flex flex-col overflow-hidden bg-ink-950 text-white md:hidden"
          onKeyDown={trapFocus}
        >
          <div className="sd-orb sd-orb-1 -left-24 top-10 h-72 w-72" aria-hidden />
          <div className="sd-orb sd-orb-2 -right-20 bottom-20 h-72 w-72" aria-hidden />
          <div className="relative flex h-[76px] items-center justify-between px-5 pt-3">
            <span className="flex items-center gap-2.5">
              <BrandMark tone="light" />
              <span className="text-[1.05rem] font-semibold tracking-tight">{brandName}</span>
            </span>
            <button
              ref={closeRef}
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white focus-ring"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="relative flex flex-1 flex-col justify-center gap-1 px-6" aria-label="Mobile">
            {links.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className="sd-enter-left group flex items-center justify-between border-b border-white/10 py-5 font-[family-name:var(--font-editorial)] text-4xl tracking-tight text-white focus-ring"
                style={{ animationDelay: `${80 + i * 70}ms` }}
                onClick={() => setOpen(false)}
              >
                {link.label}
                <ArrowRight
                  className="h-6 w-6 text-brand-300 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            ))}
          </nav>
          <div className="relative p-5 pb-8">
            <Link
              href="/order"
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white text-base font-semibold text-ink-950 focus-ring"
              onClick={() => setOpen(false)}
            >
              Start order
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      ) : null}
    </>
  )
}
