import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalLayout } from '@/components/site/legal-layout'
import { PRIVACY_VERSION } from '@/lib/patient/policies'
import { contactPage } from '@/lib/patient/copy'

export const metadata: Metadata = {
  title: 'Privacy notice',
  description:
    'How Script Direct collects and uses personal information when you submit an eScript order.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy notice"
      version={PRIVACY_VERSION}
      otherHref="/terms"
      otherLabel="Terms of use"
    >
      <p>
        This notice explains how Script Direct (operated by HealthOne)
        collects and uses personal information when you submit an eScript
        order through this website.
      </p>

      <h2>1. Who we are</h2>
      <p>
        Script Direct is an ordering and communication service. We help
        you send a request to your clinic&apos;s nominated partner
        pharmacy. We do not dispense medicines ourselves.
      </p>

      <h2>2. Information we collect</h2>
      <p>When you place a request we may collect:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Your full name, mobile number and email address</li>
        <li>Delivery address, if you choose delivery</li>
        <li>Your eScript token (stored encrypted)</li>
        <li>
          Consent records (which policy versions you accepted and when)
        </li>
        <li>
          Payment status information from Stripe (we do not store full
          card numbers)
        </li>
      </ul>

      <h2>3. How we use your information</h2>
      <p>We use your information to:</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Create and process your Script Direct request</li>
        <li>Share fulfilment details with the partner pharmacy</li>
        <li>Take payment for the ordering service and delivery fee</li>
        <li>
          Send confirmation and status updates to the email you provide
        </li>
        <li>Meet legal, security and audit obligations</li>
      </ul>

      <h2>4. Sharing</h2>
      <p>
        We share request details with the partner pharmacy linked to
        your clinic so they can dispense and fulfil your prescription.
        Payment is processed by Stripe. We do not sell your personal
        information.
      </p>

      <h2>5. Security and retention</h2>
      <p>
        eScript tokens are encrypted at rest. Status links use an
        unguessable token that is stored only as a hash. We retain
        information only as long as needed for fulfilment, refunds,
        complaints and legal requirements, then purge or de-identify it
        according to our retention schedule.
      </p>

      <h2>6. Your choices</h2>
      <p>
        You can ask us about the personal information we hold, request a
        correction, or ask how to access your status history. For lost
        status links, use{' '}
        <Link
          href="/status/lost-link"
          className="font-semibold text-brand-700 underline"
        >
          Resend my status link
        </Link>
        .
      </p>

      <h2>7. Contact</h2>
      <p>
        Privacy questions:{' '}
        <a
          href={`mailto:${contactPage.email}`}
          className="font-semibold text-brand-700 underline"
        >
          {contactPage.email}
        </a>
        <br />
        Phone: {contactPage.phone}
        <br />
        Address: {contactPage.address}
      </p>
    </LegalLayout>
  )
}
