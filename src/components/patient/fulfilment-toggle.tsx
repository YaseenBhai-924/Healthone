'use client'

import { useState, type ReactNode } from 'react'
import { Check, Store, Truck } from 'lucide-react'
import { SegmentedControl } from '@/components/ui'
import { CollectionPharmacyAddress } from '@/components/patient/collection-pharmacy-address'
import type { PharmacyAddressDto } from '@/lib/api/public-types'
import { CollectScene, DeliveryScene } from './fulfilment-scenes'
import { cn } from '@/lib/cn'

function FulfilmentPanel({
  active,
  title,
  bullets,
  icon,
  chip,
  scene,
  footer,
}: {
  active: boolean
  title: string
  bullets: string[]
  icon: ReactNode
  chip: string
  scene: ReactNode
  footer?: ReactNode
}) {
  return (
    <div
      className={cn(
        'col-start-1 row-start-1 grid transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none lg:grid-cols-2',
        active ? 'opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
      )}
      aria-hidden={!active}
      inert={!active}
    >
      <div className="relative z-[1] flex flex-col justify-center p-7 sm:p-10 lg:p-12">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-[var(--shadow-glow)]">
          {icon}
        </span>
        <h3 className="sd-display sd-display-md mt-6">{title}</h3>
        <ul className="mt-5 max-w-md space-y-3">
          {bullets.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-ink-muted">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint-100 text-mint-700">
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
              </span>
              {item}
            </li>
          ))}
        </ul>
        {footer ? <div className="mt-5">{footer}</div> : null}
        <p className="mt-6 inline-flex w-fit items-center rounded-full bg-brand-50 px-3.5 py-1.5 text-[13px] font-medium text-brand-700 ring-1 ring-brand-100">
          {chip}
        </p>
      </div>

      <div
        className="relative min-h-[280px] overflow-hidden bg-gradient-to-br from-brand-50 via-sky-50 to-mint-50 lg:min-h-[400px]"
        aria-hidden
      >
        <div className="absolute inset-0 sd-dot-grid opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10">
          {scene}
        </div>
      </div>
    </div>
  )
}

export function FulfilmentToggle({
  pharmacyName,
  pharmacyAddress,
}: {
  pharmacyName?: string | null
  pharmacyAddress?: PharmacyAddressDto | null
} = {}) {
  const [mode, setMode] = useState<'collection' | 'delivery'>('collection')

  return (
    <div>
      <SegmentedControl
        label="Fulfilment option"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'collection', label: 'Click and collect' },
          { value: 'delivery', label: 'Home delivery' },
        ]}
        className="max-w-md"
      />

      <div className="mt-8 grid overflow-hidden rounded-[2rem] border border-ink/5 bg-white shadow-[0_40px_80px_-40px_rgb(15_42_74/0.35)] sm:rounded-[2.5rem]">
        <FulfilmentPanel
          active={mode === 'collection'}
          title="Click and collect"
          icon={<Store className="h-6 w-6" aria-hidden />}
          chip="No delivery fee on collection orders"
          scene={<CollectScene className="h-auto w-full max-w-[460px]" />}
          footer={
            <CollectionPharmacyAddress
              pharmacyName={pharmacyName}
              pharmacyAddress={pharmacyAddress}
            />
          }
          bullets={[
            "Pick up from your clinic's partner pharmacy when ready.",
            'Status updates arrive on your private email link.',
            'Show your reference at the counter.',
          ]}
        />

        <FulfilmentPanel
          active={mode === 'delivery'}
          title="Home delivery"
          icon={<Truck className="h-6 w-6" aria-hidden />}
          chip="A delivery fee may apply and is shown before you pay"
          scene={<DeliveryScene className="h-auto w-full max-w-[460px]" />}
          bullets={[
            'Add your address when you submit the order.',
            'The pharmacy packs and sends after payment is confirmed.',
            'Track progress with the same private status link.',
          ]}
        />
      </div>
    </div>
  )
}
