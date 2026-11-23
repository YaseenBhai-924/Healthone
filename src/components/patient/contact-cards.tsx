'use client'

import { useEffect, useState } from 'react'
import { Clock, Copy, Mail, MapPin, Phone } from 'lucide-react'
import { Card, IconBadge } from '@/components/ui'
import { useToast } from '@/components/ui/toast'
import { contactPage } from '@/lib/patient/copy'

function isOpenNowSydney(): boolean {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(new Date())
  const weekday = parts.find((p) => p.type === 'weekday')?.value
  const hour = Number(parts.find((p) => p.type === 'hour')?.value)
  const weekdayOk = weekday !== 'Sat' && weekday !== 'Sun'
  return weekdayOk && hour >= 9 && hour < 17
}

export function ContactCards() {
  const { addToast } = useToast()
  const [open, setOpen] = useState<boolean | null>(null)

  useEffect(() => {
    setOpen(isOpenNowSydney())
  }, [])

  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
      addToast({ message: `${label} copied.`, variant: 'success' })
    } catch {
      addToast({ message: 'Copy failed. Select and copy manually.', variant: 'danger' })
    }
  }

  return (
    <div className="space-y-3">
      <Card interactive className="flex items-start gap-3">
        <IconBadge icon={Phone} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Phone</p>
          <a href={contactPage.phoneHref} className="font-semibold text-brand-700 hover:underline">
            {contactPage.phone}
          </a>
          <button
            type="button"
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink focus-ring rounded-sm"
            aria-label="Copy phone"
            onClick={() => copy('Phone', contactPage.phone)}
          >
            <Copy className="h-3.5 w-3.5" aria-hidden /> Copy
          </button>
        </div>
      </Card>

      <Card interactive className="flex items-start gap-3">
        <IconBadge icon={Mail} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Email</p>
          <a
            href={`mailto:${contactPage.email}`}
            className="break-all font-semibold text-brand-700 hover:underline"
          >
            {contactPage.email}
          </a>
          <button
            type="button"
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink focus-ring rounded-sm"
            aria-label="Copy email"
            onClick={() => copy('Email', contactPage.email)}
          >
            <Copy className="h-3.5 w-3.5" aria-hidden /> Copy
          </button>
        </div>
      </Card>

      <Card interactive className="flex items-start gap-3">
        <IconBadge icon={MapPin} />
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Address</p>
          <p className="font-semibold text-ink">{contactPage.address}</p>
          <a
            href={contactPage.mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs font-semibold text-brand-700 hover:underline"
          >
            Get directions
          </a>
        </div>
      </Card>

      <Card interactive className="flex items-start gap-3">
        <IconBadge icon={Clock} />
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Hours</p>
          <p className="font-semibold text-ink">{contactPage.hours}</p>
          {open !== null ? (
            <span
              className={
                open
                  ? 'mt-2 inline-flex rounded-badge bg-success-bg px-2 py-0.5 text-xs font-bold text-success'
                  : 'mt-2 inline-flex rounded-badge bg-warning-bg px-2 py-0.5 text-xs font-bold text-warning'
              }
            >
              {open ? 'Open now' : 'Closed now'}
            </span>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
