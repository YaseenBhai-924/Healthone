import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google'

/**
 * Patient-shell fonts, loaded outside the root layout so admin and HQ do not
 * preload them. All three are self-hosted by next/font at build time (CSP
 * `font-src 'self'` stays valid).
 *
 *   Geist             UI + body
 *   Geist Mono        references, eScript tokens
 *   Instrument Serif  large editorial headlines (weight 400 only)
 */
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument',
  display: 'swap',
})

/** Apply to any wrapper that also carries `patient-atmosphere`. */
export const patientFontClass = `${geist.variable} ${geistMono.variable} ${instrumentSerif.variable}`
