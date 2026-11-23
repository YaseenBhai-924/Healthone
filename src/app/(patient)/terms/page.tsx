import type { Metadata } from 'next'
import Link from 'next/link'
import { LegalLayout } from '@/components/site/legal-layout'
import { TERMS_VERSION } from '@/lib/patient/policies'
import { contactPage } from '@/lib/patient/copy'

export const metadata: Metadata = {
  title: 'Terms of use',
  description:
    'Terms that apply when you use Script Direct to submit an eScript ordering request.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of use"
      version={TERMS_VERSION}
      otherHref="/privacy"
      otherLabel="Privacy notice"
    >
      <p>
        These terms apply when you use Script Direct to submit an eScript
        ordering request to a partner pharmacy.
      </p>

      <h2>1. The service</h2>
      <p>
        Script Direct is an ordering and communication layer between you
        and a nominated partner pharmacy. It does not replace the
        national eScript system and does not dispense medicines.
        Dispensing is performed by the pharmacy in its own authorised
        systems.
      </p>

      <h2>2. Eligibility and accuracy</h2>
      <p>
        You confirm that the eScript token and contact details you submit
        belong to you, or that you are authorised to order on someone
        else&apos;s behalf. You must provide accurate information. False
        or incomplete details may delay or stop fulfilment.
      </p>

      <h2>3. Fees and payment</h2>
      <p>
        Fees shown at checkout cover the Script Direct ordering service
        and any optional delivery fee. Payment is taken through Stripe
        before the pharmacy is alerted. Medication co-payments or other
        pharmacy charges, if any, are handled separately by the pharmacy
        under PBS and pharmacy policy.
      </p>

      <h2>4. Fulfilment and status</h2>
      <p>
        After payment, the partner pharmacy reviews your request and may
        accept, progress, or reject it. You can track progress with the
        private status link emailed to you. If a request is rejected
        after payment, a refund is started to your original payment
        method according to our refund process.
      </p>

      <h2>5. Acceptable use</h2>
      <p>
        You must not misuse the service, attempt to access another
        person&apos;s request without authority, or interfere with the
        security or availability of Script Direct.
      </p>

      <h2>6. Privacy</h2>
      <p>
        How we handle personal information is described in our{' '}
        <Link
          href="/privacy"
          className="font-semibold text-brand-700 underline"
        >
          Privacy notice
        </Link>
        .
      </p>

      <h2>7. Limitation</h2>
      <p>
        To the extent permitted by Australian law, Script Direct is not
        liable for pharmacy dispensing decisions, medicine availability,
        or delivery delays outside our reasonable control. Nothing in
        these terms excludes rights you have under the Australian
        Consumer Law that cannot be excluded.
      </p>

      <h2>8. Contact</h2>
      <p>
        Questions about these terms:{' '}
        <a
          href={`mailto:${contactPage.email}`}
          className="font-semibold text-brand-700 underline"
        >
          {contactPage.email}
        </a>
        . Phone {contactPage.phone}.
      </p>
    </LegalLayout>
  )
}
