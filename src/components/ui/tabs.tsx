'use client'

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/cn'

export type TabItem = {
  id: string
  label: string
  panel: ReactNode
}

export function Tabs({
  items,
  defaultId,
  className,
  onChange,
}: {
  items: TabItem[]
  defaultId?: string
  className?: string
  onChange?: (id: string) => void
}) {
  const baseId = useId()
  const [active, setActive] = useState(defaultId ?? items[0]?.id)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  function select(id: string) {
    setActive(id)
    onChange?.(id)
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const i = items.findIndex((t) => t.id === active)
    if (i < 0) return
    let next = i
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % items.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
      next = (i - 1 + items.length) % items.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = items.length - 1
    else return
    e.preventDefault()
    const id = items[next]?.id
    if (!id) return
    select(id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Sections"
        className="flex flex-wrap gap-2"
        onKeyDown={onKeyDown}
      >
        {items.map((item, index) => {
          const selected = item.id === active
          return (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[index] = el
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              className={cn(
                'min-h-11 rounded-badge px-4 text-sm font-semibold transition-colors duration-180 focus-ring',
                selected
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-brand-50 text-ink-muted hover:bg-brand-100 hover:text-ink',
              )}
              onClick={() => select(item.id)}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={item.id !== active}
          className="mt-4"
        >
          {item.id === active ? item.panel : null}
        </div>
      ))}
    </div>
  )
}
