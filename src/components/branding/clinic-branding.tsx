'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { type ClinicBrand, defaultBrand, primaryTextColor } from '@/lib/branding'

/* ── Context ────────────────────────────────────────────── */

const ClinicBrandingContext = createContext<ClinicBrand>(defaultBrand)

/* ── Provider ───────────────────────────────────────────── */

export interface ClinicBrandingProviderProps {
  brand: ClinicBrand
  children: ReactNode
}

/**
 * Provides clinic branding down the tree.
 * Also injects CSS custom properties onto the wrapper div so Tailwind
 * arbitrary values can reference `var(--brand-primary)` in children.
 */
export function ClinicBrandingProvider({
  brand,
  children,
}: ClinicBrandingProviderProps) {
  const textColor = primaryTextColor(brand)

  return (
    <ClinicBrandingContext.Provider value={brand}>
      <div
        style={
          {
            '--brand-primary': brand.primaryColor,
            '--brand-primary-text': textColor,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </ClinicBrandingContext.Provider>
  )
}

/* ── Hook ───────────────────────────────────────────────── */

/**
 * Returns the current clinic brand. Falls back to defaultBrand if no
 * ClinicBrandingProvider is present in the tree.
 */
export function useClinicBranding(): ClinicBrand {
  return useContext(ClinicBrandingContext)
}
