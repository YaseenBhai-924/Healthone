'use client'

import { useId } from 'react'
import { cn } from '@/lib/cn'

export type SegmentOption<T extends string> = {
  value: T
  label: string
}

/**
 * Static class maps (no inline styles): the app's nonce-based CSP blocks
 * server-rendered style="" attributes, so layout must come from classes.
 */
const columns: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}
const thumbWidth: Record<number, string> = {
  1: 'w-[calc(100%-0.5rem)]',
  2: 'w-[calc((100%-0.5rem)/2)]',
  3: 'w-[calc((100%-0.5rem)/3)]',
  4: 'w-[calc((100%-0.5rem)/4)]',
}
const thumbOffset = ['translate-x-0', 'translate-x-[100%]', 'translate-x-[200%]', 'translate-x-[300%]']

/** Pill segmented control with a sliding thumb (2 to 4 options). Native radios underneath. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: readonly SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
  className?: string
}) {
  const name = useId()
  const count = Math.min(4, Math.max(1, options.length))
  const index = Math.min(
    3,
    Math.max(
      0,
      options.findIndex((o) => o.value === value),
    ),
  )

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        'relative grid rounded-full border border-line bg-white/80 p-1 shadow-sm backdrop-blur',
        columns[count],
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute bottom-1 left-1 top-1 rounded-full bg-ink-950 shadow-md transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
          thumbWidth[count],
          thumbOffset[index],
        )}
      />
      {options.map((opt) => {
        const checked = opt.value === value
        return (
          <label
            key={opt.value}
            className={cn(
              'relative z-[1] flex min-h-11 cursor-pointer items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors duration-200',
              'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-600',
              checked ? 'text-white' : 'text-ink-muted hover:text-ink',
            )}
          >
            <input
              type="radio"
              className="sr-only"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
            />
            {opt.label}
          </label>
        )
      })}
    </div>
  )
}
