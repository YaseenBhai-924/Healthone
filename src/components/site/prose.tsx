import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Prose({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'prose-measure space-y-4 text-base leading-relaxed text-ink',
        '[&_h2]:scroll-mt-28 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-heading [&_h2]:mt-10',
        '[&_h3]:font-display [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-heading [&_h3]:mt-6',
        '[&_a]:font-semibold [&_a]:text-brand-700 [&_a]:underline-offset-2 hover:[&_a]:underline',
        '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2',
        '[&_p]:text-ink-muted',
        className,
      )}
      {...props}
    />
  )
}
