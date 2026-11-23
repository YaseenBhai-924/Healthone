import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Shared button class factory — safe for Server and Client Components.
 * Keep interactive Button in button.tsx ('use client').
 */
export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 font-semibold',
    'rounded-control border',
    'transition-[color,background-color,border-color,box-shadow,transform] duration-[180ms] ease-out',
    'focus-ring',
    'disabled:pointer-events-none disabled:opacity-40',
    'motion-reduce:transition-none motion-reduce:transform-none',
    'select-none',
    'active:scale-[0.98]',
    'min-h-11',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'bg-brand-600 text-white border-transparent',
          'hover:bg-brand-700 hover:shadow-[var(--shadow-glow)]',
          'active:bg-brand-800',
        ].join(' '),
        secondary: [
          'bg-surface text-brand-700 border-line',
          'hover:bg-brand-50 hover:border-brand-300',
        ].join(' '),
        ghost: [
          'bg-transparent text-brand-700 border-transparent',
          'hover:bg-brand-50',
        ].join(' '),
        danger: [
          'bg-danger-bg text-danger border-danger/30',
          'hover:bg-danger/10',
        ].join(' '),
        link: [
          'bg-transparent text-brand-600 border-transparent',
          'underline-offset-4 hover:underline',
          'h-auto! min-h-0! p-0! active:scale-100',
        ].join(' '),
      },
      size: {
        sm: 'h-11 min-h-11 px-3 text-sm',
        md: 'h-11 min-h-11 px-4 text-sm',
        lg: 'h-12 min-h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>
