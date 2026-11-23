'use client'

import { useId, useState, type ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/cn'

export type AccordionItem = { id: string; title: string; content: ReactNode }

/**
 * Single-open accordion (WAI-ARIA disclosure pattern: button + region).
 * Height animates with the grid-template-rows trick, so no measuring and no JS
 * animation. Closed panels are `inert` so links inside cannot take focus.
 */
export function Accordion({
  items,
  className,
  defaultOpenId,
}: {
  items: readonly AccordionItem[]
  className?: string
  defaultOpenId?: string
}) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null)
  const base = useId()

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => {
        const open = item.id === openId
        const buttonId = `${base}-btn-${item.id}`
        const panelId = `${base}-panel-${item.id}`
        return (
          <div
            key={item.id}
            className={cn(
              'overflow-hidden rounded-3xl border bg-white transition-[border-color,box-shadow] duration-300',
              open
                ? 'border-brand-200 shadow-[0_24px_48px_-32px_rgb(37_99_235/0.45)]'
                : 'border-ink/10 hover:border-brand-200',
            )}
          >
            <h3 className="!text-base">
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : item.id)}
                className="group flex min-h-16 w-full items-center justify-between gap-4 px-6 py-4 text-left text-[1.0625rem] font-semibold text-heading focus-ring rounded-3xl"
              >
                <span>{item.title}</span>
                <span
                  aria-hidden
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-[transform,background-color,color] duration-300',
                    open
                      ? 'rotate-45 bg-brand-600 text-white'
                      : 'bg-brand-50 text-brand-700 group-hover:bg-brand-100',
                  )}
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!open}
              inert={!open}
              className={cn(
                'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
                open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
              )}
            >
              <div className="overflow-hidden">
                <div className="prose-measure px-6 pb-6 text-[15px] leading-relaxed text-ink-muted">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
