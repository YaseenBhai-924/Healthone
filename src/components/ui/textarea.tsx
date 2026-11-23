'use client'

import { type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: React.Ref<HTMLTextAreaElement>
  hasError?: boolean
}

export function Textarea({ className, hasError, ref, ...props }: TextareaProps) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-3 py-2.5 rounded-control',
        'bg-surface text-fg',
        'border border-control',
        'text-sm font-normal',
        'resize-vertical min-h-[6rem]',
        'transition-[border-color,box-shadow] duration-[150ms] ease-out',
        'motion-reduce:transition-none',
        'placeholder:text-fg-muted',
        'focus-ring',
        'disabled:bg-surface-muted disabled:text-fg-muted disabled:cursor-not-allowed',
        hasError && 'border-danger-fg',
        className,
      )}
      aria-invalid={hasError || undefined}
      {...props}
    />
  )
}
