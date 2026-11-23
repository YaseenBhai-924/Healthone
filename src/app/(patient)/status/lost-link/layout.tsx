import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resend my status link',
  description:
    'Request a new private status link using your order reference and email. The old link stops working when a new one is sent.',
  alternates: { canonical: '/status/lost-link' },
}

export default function LostLinkLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
