'use client'

import { useMemo, useState, type FormEvent } from 'react'
import {
  AnimatedCheck,
  Alert,
  Button,
  Field,
  HintText,
  Input,
  Label,
  Textarea,
  ErrorText,
} from '@/components/ui'
import { useToast } from '@/components/ui/toast'

const MAX = 1000

export function ContactForm() {
  const { addToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const errors = useMemo(() => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Enter your name.'
    if (!email.trim()) e.email = 'Enter your email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email.'
    if (!message.trim()) e.message = 'Enter a message.'
    else if (message.length > MAX) e.message = `Keep messages under ${MAX} characters.`
    return e
  }, [name, email, message])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched({ name: true, email: true, message: true })
    const first = Object.keys(errors)[0]
    if (first) {
      document.getElementById(`contact-${first}`)?.focus()
      return
    }
    setLoading(true)
    // No backend endpoint yet: simulate success UX for the showcase.
    await new Promise((r) => setTimeout(r, 700))
    setLoading(false)
    setSent(true)
    addToast({
      message: 'Thanks. We will reply within one business day.',
      variant: 'success',
    })
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center" role="status">
        <AnimatedCheck />
        <p className="font-display text-lg font-bold text-heading">
          Thanks, we will reply within one business day.
        </p>
      </div>
    )
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      <Alert variant="warning" title="Do not include prescription tokens or clinical details in this form">
        Use this form for general questions only.
      </Alert>

      {Object.keys(errors).length > 0 && Object.values(touched).some(Boolean) ? (
        <div className="rounded-control border border-danger/30 bg-danger-bg px-3 py-2 text-sm text-danger" role="alert">
          Please fix the highlighted fields.
        </div>
      ) : null}

      <Field>
        <Label htmlFor="contact-name">Name</Label>
        <Input
          id="contact-name"
          name="name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          aria-invalid={touched.name && !!errors.name}
          aria-describedby={touched.name && errors.name ? 'contact-name-err' : undefined}
        />
        {touched.name && errors.name ? (
          <ErrorText id="contact-name-err">{errors.name}</ErrorText>
        ) : null}
      </Field>

      <Field>
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          aria-invalid={touched.email && !!errors.email}
          aria-describedby={touched.email && errors.email ? 'contact-email-err' : undefined}
        />
        {touched.email && errors.email ? (
          <ErrorText id="contact-email-err">{errors.email}</ErrorText>
        ) : null}
      </Field>

      <Field>
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          maxLength={MAX + 50}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, message: true }))}
          aria-invalid={touched.message && !!errors.message}
          aria-describedby="contact-message-hint contact-message-err"
        />
        <HintText id="contact-message-hint">
          {message.length}/{MAX} characters
        </HintText>
        {touched.message && errors.message ? (
          <ErrorText id="contact-message-err">{errors.message}</ErrorText>
        ) : null}
      </Field>

      <Button type="submit" loading={loading} className="w-full">
        Send message
      </Button>
    </form>
  )
}
