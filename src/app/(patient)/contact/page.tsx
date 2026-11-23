import type { Metadata } from 'next'
import { PageHero, Container, pageHeroContentClass } from '@/components/site'
import { Card, CardBody, CardTitle } from '@/components/ui'
import { ContactCards } from '@/components/patient/contact-cards'
import { ContactForm } from '@/components/patient/contact-form'
import { contactPage } from '@/lib/patient/copy'

export const metadata: Metadata = {
  title: 'Contact',
  description: contactPage.support,
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <main>
      <PageHero
        eyebrow="Support"
        title={contactPage.headline}
        lead={contactPage.support}
      />
      <Container className={`grid gap-8 lg:grid-cols-2 ${pageHeroContentClass}`}>
        <ContactCards />
        <Card>
          <CardTitle>Send a message</CardTitle>
          <CardBody className="mt-4">
            <ContactForm />
          </CardBody>
        </Card>
      </Container>
    </main>
  )
}
