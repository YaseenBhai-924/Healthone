'use client'

import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileUp, Hash } from 'lucide-react'
import {
  Button,
  ErrorText,
  Field,
  HintText,
  Input,
  Label,
  Select,
  Textarea,
} from '@/components/ui'
import {
  AU_STATE_OPTIONS,
  detailsSchema,
  type DetailsFormValues,
  type PrescriptionMethod,
} from '@/lib/patient/schema'
import { cn } from '@/lib/cn'

const METHOD_OPTIONS: {
  value: PrescriptionMethod
  title: string
  description: string
  icon: typeof Hash
}[] = [
  {
    value: 'escript',
    title: 'I have an eScript',
    description: 'Token from your SMS or email',
    icon: Hash,
  },
  {
    value: 'upload',
    title: "I'll upload my script",
    description: 'Photo or PDF of your script',
    icon: FileUp,
  },
]

const ACCEPT_SCRIPT = 'image/jpeg,image/png,image/webp,application/pdf'
const MAX_SCRIPT_BYTES = 10 * 1024 * 1024

export function DetailsStep({
  defaultValues,
  onContinue,
  onBack,
}: {
  defaultValues?: Partial<DetailsFormValues>
  onContinue: (values: DetailsFormValues, scriptFile: File | null) => void
  onBack: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scriptFileRef = useRef<File | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      prescriptionMethod: 'escript',
      fulfilmentType: 'Delivery',
      escriptToken: '',
      scriptFileName: '',
      notesToPharmacy: '',
      patientName: '',
      mobile: '',
      email: '',
      address: {
        line1: '',
        line2: '',
        suburb: '',
        state: 'NSW',
        postcode: '',
      },
      ...defaultValues,
    },
  })

  const fulfilment = watch('fulfilmentType')
  const method = watch('prescriptionMethod')
  const scriptFileName = watch('scriptFileName')

  function selectMethod(next: PrescriptionMethod) {
    setValue('prescriptionMethod', next, { shouldValidate: true })
    if (next === 'escript') {
      setValue('scriptFileName', '', { shouldValidate: false })
      scriptFileRef.current = null
      if (fileInputRef.current) fileInputRef.current.value = ''
    } else {
      setValue('escriptToken', '', { shouldValidate: false })
    }
  }

  function onFileChange(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) {
      scriptFileRef.current = null
      setValue('scriptFileName', '', { shouldValidate: true })
      return
    }
    if (file.size > MAX_SCRIPT_BYTES) {
      scriptFileRef.current = null
      setValue('scriptFileName', '', { shouldValidate: true })
      return
    }
    scriptFileRef.current = file
    setValue('scriptFileName', file.name, { shouldValidate: true })
  }

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onContinue(
          values,
          values.prescriptionMethod === 'upload' ? scriptFileRef.current : null,
        ),
      )}
      className="space-y-5"
      noValidate
    >
      <div>
        <h2 className="font-display !text-xl font-bold text-heading sm:!text-2xl">
          Prescription details
        </h2>
        <p className="mt-1 text-sm text-fg-muted">
          How would you like to provide your prescription?
        </p>
      </div>

      <fieldset>
        <legend className="sr-only">Prescription method</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {METHOD_OPTIONS.map((opt) => {
            const selected = method === opt.value
            const Icon = opt.icon
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                className={cn(
                  'flex items-start gap-3 rounded-card border px-4 py-3.5 text-left transition-colors focus-ring',
                  selected
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-subtle bg-surface hover:border-brand-200 hover:bg-brand-50/40',
                )}
                onClick={() => selectMethod(opt.value)}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border-2',
                    selected
                      ? 'border-brand-600 bg-brand-600'
                      : 'border-control bg-surface',
                  )}
                  aria-hidden
                >
                  {selected && (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-semibold text-heading">
                    <Icon className="h-4 w-4 text-brand-700" aria-hidden />
                    {opt.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-fg-muted">
                    {opt.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        <input type="hidden" {...register('prescriptionMethod')} />
        {errors.prescriptionMethod && (
          <ErrorText className="mt-2">
            {errors.prescriptionMethod.message}
          </ErrorText>
        )}
      </fieldset>

      {method === 'escript' && (
        <Field>
          <Label htmlFor="escriptToken">eScript number</Label>
          <Input
            id="escriptToken"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="e-Script number"
            aria-invalid={!!errors.escriptToken}
            {...register('escriptToken')}
          />
          <HintText>Letters and digits only. We normalise spacing for you.</HintText>
          {errors.escriptToken && (
            <ErrorText>{errors.escriptToken.message}</ErrorText>
          )}
        </Field>
      )}

      {method === 'upload' && (
        <div className="space-y-3">
          <Field>
            <Label htmlFor="scriptFile">Upload your script</Label>
            <input
              ref={fileInputRef}
              id="scriptFile"
              type="file"
              accept={ACCEPT_SCRIPT}
              className="sr-only"
              onChange={(e) => onFileChange(e.target.files)}
            />
            <button
              type="button"
              className={cn(
                'flex w-full flex-col items-center justify-center gap-2 rounded-card border border-dashed px-4 py-8 text-center transition-colors focus-ring',
                errors.scriptFileName
                  ? 'border-danger-fg bg-danger-subtle'
                  : 'border-subtle bg-surface-muted/60 hover:border-brand-300 hover:bg-brand-50/50',
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-6 w-6 text-brand-700" aria-hidden />
              <span className="text-sm font-semibold text-heading">
                {scriptFileName ? scriptFileName : 'Choose a photo or PDF'}
              </span>
              <span className="text-xs text-fg-muted">
                JPEG, PNG, WebP or PDF up to 10 MB
              </span>
            </button>
            <input type="hidden" {...register('scriptFileName')} />
            {errors.scriptFileName && (
              <ErrorText>{errors.scriptFileName.message}</ErrorText>
            )}
          </Field>
        </div>
      )}

      <Field>
        <Label htmlFor="notesToPharmacy">Notes to pharmacy</Label>
        <HintText>
          Delivery day preference, carer details, or any other information
        </HintText>
        <Textarea
          id="notesToPharmacy"
          rows={3}
          placeholder="Any additional information…"
          aria-invalid={!!errors.notesToPharmacy}
          {...register('notesToPharmacy')}
        />
        {errors.notesToPharmacy && (
          <ErrorText>{errors.notesToPharmacy.message}</ErrorText>
        )}
      </Field>

      <div className="border-t border-subtle pt-5">
        <h3 className="text-sm font-semibold text-heading">Your details</h3>
        <p className="mt-1 text-sm text-fg-muted">
          How we can reach you about this request.
        </p>
      </div>

      <Field>
        <Label htmlFor="patientName">Full name</Label>
        <Input
          id="patientName"
          autoComplete="name"
          aria-invalid={!!errors.patientName}
          {...register('patientName')}
        />
        {errors.patientName && (
          <ErrorText>{errors.patientName.message}</ErrorText>
        )}
      </Field>

      <Field>
        <Label htmlFor="mobile">Mobile</Label>
        <Input
          id="mobile"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="0412 345 678"
          aria-invalid={!!errors.mobile}
          {...register('mobile')}
        />
        {errors.mobile && <ErrorText>{errors.mobile.message}</ErrorText>}
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
        <HintText>We send your private status link here.</HintText>
        {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
      </Field>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-fg-secondary">
          Fulfilment
        </legend>
        <div className="flex flex-wrap gap-2" role="group">
          {(['Delivery', 'Collection'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              className={cn(
                'rounded-badge border px-4 py-2 text-sm font-semibold transition-colors focus-ring',
                fulfilment === opt
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-subtle bg-surface text-fg-secondary hover:bg-brand-50',
              )}
              aria-pressed={fulfilment === opt}
              onClick={() =>
                setValue('fulfilmentType', opt, { shouldValidate: true })
              }
            >
              {opt === 'Delivery' ? 'Delivery' : 'Collection'}
            </button>
          ))}
        </div>
        <input type="hidden" {...register('fulfilmentType')} />
      </fieldset>

      {fulfilment === 'Delivery' && (
        <div className="space-y-3 rounded-card border border-subtle bg-surface-muted/50 p-4">
          <p className="text-sm font-semibold text-heading">Delivery address</p>
          <Field>
            <Label htmlFor="line1">Street address</Label>
            <Input
              id="line1"
              autoComplete="address-line1"
              aria-invalid={!!errors.address?.line1}
              {...register('address.line1')}
            />
            {errors.address?.line1 && (
              <ErrorText>{errors.address.line1.message}</ErrorText>
            )}
          </Field>
          <Field>
            <Label htmlFor="line2">Apartment, suite (optional)</Label>
            <Input
              id="line2"
              autoComplete="address-line2"
              {...register('address.line2')}
            />
          </Field>
          <Field>
            <Label htmlFor="suburb">Suburb</Label>
            <Input
              id="suburb"
              autoComplete="address-level2"
              aria-invalid={!!errors.address?.suburb}
              {...register('address.suburb')}
            />
            {errors.address?.suburb && (
              <ErrorText>{errors.address.suburb.message}</ErrorText>
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <Label htmlFor="state">State</Label>
              <Select
                id="state"
                aria-invalid={!!errors.address?.state}
                {...register('address.state')}
              >
                {AU_STATE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
              {errors.address?.state && (
                <ErrorText>{errors.address.state.message}</ErrorText>
              )}
            </Field>
            <Field>
              <Label htmlFor="postcode">Postcode</Label>
              <Input
                id="postcode"
                autoComplete="postal-code"
                inputMode="numeric"
                maxLength={4}
                aria-invalid={!!errors.address?.postcode}
                {...register('address.postcode')}
              />
              {errors.address?.postcode && (
                <ErrorText>{errors.address.postcode.message}</ErrorText>
              )}
            </Field>
          </div>
          {errors.address &&
            typeof errors.address.message === 'string' && (
              <ErrorText>{errors.address.message}</ErrorText>
            )}
        </div>
      )}

      <div className="flex justify-between gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  )
}
