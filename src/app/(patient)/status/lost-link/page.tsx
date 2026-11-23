'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Link2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Button,
  Card,
  CardBody,
  ErrorText,
  Field,
  HintText,
  IconBadge,
  Input,
  Label,
} from '@/components/ui'
import { EnvelopeLinkArt } from '@/components/patient/illustrations'
import { resendStatusLink } from '@/lib/api/public-client'
import { lostLinkSchema } from '@/lib/patient/schema'
import { z } from 'zod'

type FormValues = z.infer<typeof lostLinkSchema>
const COOLDOWN_SEC = 30

function formatReference(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (cleaned.startsWith('SD')) {
    const rest = cleaned.slice(2)
    const a = rest.slice(0, 4)
    const b = rest.slice(4, 8)
    return ['SD', a, b].filter(Boolean).join('-').slice(0, 12)
  }
  const a = cleaned.slice(0, 4)
  const b = cleaned.slice(4, 8)
  return ['SD', a, b].filter(Boolean).join('-').slice(0, 12)
}

export default function LostLinkPage() {
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(lostLinkSchema),
    defaultValues: { reference: '', email: '' },
  })

  const reference = watch('reference')
  const formattedOk = useMemo(
    () => /^SD-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(reference ?? ''),
    [reference],
  )

  useEffect(() => {
    if (cooldown <= 0) return
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => window.clearTimeout(t)
  }, [cooldown])

  async function onSubmit(values: FormValues) {
    if (cooldown > 0) return
    setSubmitting(true)
    setRateLimited(false)
    const result = await resendStatusLink(values.reference, values.email)
    setSubmitting(false)
    if (!result.ok && result.error.status === 429) {
      setRateLimited(true)
      return
    }
    setDone(true)
    setCooldown(COOLDOWN_SEC)
  }

  return (
    <main className="relative overflow-hidden px-4 py-12">
      <div className="sd-blob sd-blob-a left-1/2 top-0 -translate-x-1/2 opacity-60" aria-hidden />
      <div className="relative mx-auto w-full max-w-md">
        <Card className="sd-glass border-white/70">
          <CardBody>
            <IconBadge icon={Link2} />
            <h1 className="font-display mt-4 !text-2xl font-bold leading-snug text-heading sm:!text-3xl">
              Resend my status link
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              Enter the reference from your confirmation and the email you used.
              If they match, we send a new private link and the old one stops
              working.
            </p>

            {done ? (
              <div className="mt-6 space-y-3 text-center" role="status">
                <EnvelopeLinkArt className="mx-auto h-16 w-20" />
                <Alert variant="success" title="Request received">
                  If those details match an order, we have sent a new private
                  link. The old link no longer works.
                </Alert>
                {cooldown > 0 ? (
                  <p className="text-xs font-semibold text-ink-muted">
                    You can request again in {cooldown}s.
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => setDone(false)}
                  >
                    Send another request
                  </Button>
                )}
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-4 space-y-4"
                noValidate
              >
                {rateLimited ? (
                  <Alert variant="warning" title="Too many attempts">
                    Please try again in a few minutes.
                  </Alert>
                ) : null}
                <Field>
                  <Label htmlFor="reference">Reference</Label>
                  <div className="relative">
                    <Input
                      id="reference"
                      placeholder="SD-7K4M-2QXP"
                      autoComplete="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      className="font-mono uppercase"
                      aria-invalid={!!errors.reference}
                      {...register('reference')}
                      onChange={(e) => {
                        const next = formatReference(e.target.value)
                        setValue('reference', next, { shouldValidate: true })
                      }}
                    />
                    {formattedOk ? (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-success" aria-hidden>
                        ✓
                      </span>
                    ) : null}
                  </div>
                  {errors.reference ? (
                    <ErrorText>{errors.reference.message}</ErrorText>
                  ) : null}
                </Field>
                <Field>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    {...register('email')}
                  />
                  <HintText>We always show the same confirmation message.</HintText>
                  {errors.email ? <ErrorText>{errors.email.message}</ErrorText> : null}
                </Field>
                <Button
                  type="submit"
                  className="w-full"
                  loading={submitting}
                  disabled={cooldown > 0}
                >
                  {cooldown > 0 ? `Wait ${cooldown}s` : 'Send link'}
                </Button>
              </form>
            )}
          </CardBody>
        </Card>
        <p className="mt-4 text-center text-sm text-ink-muted">
          Can&apos;t find your reference?{' '}
          <Link href="/contact" className="font-semibold text-brand-700 hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </main>
  )
}
