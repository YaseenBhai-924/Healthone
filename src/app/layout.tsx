import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

const allowIndex = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Script Direct',
    template: '%s | Script Direct',
  },
  description:
    "Repeat script ordering fulfilled by your clinic's partner pharmacy. Pay after verification via a secure Stripe link.",
  openGraph: {
    type: 'website',
    siteName: 'Script Direct',
    title: 'Script Direct',
    description:
      "Repeat script ordering fulfilled by your clinic's partner pharmacy. Pay after verification via a secure Stripe link.",
  },
  robots: allowIndex
    ? { index: true, follow: true }
    : { index: false, follow: false },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Reading headers() opts the tree into dynamic rendering so middleware
  // nonces can be applied to Next.js scripts (task 6.4.5).
  await headers()

  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable}`}
      data-density="comfortable"
    >
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
