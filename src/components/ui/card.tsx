'use client'

import { useRef, type HTMLAttributes, type MouseEvent } from 'react'
import { cn } from '@/lib/cn'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>
  /** Subtle lift on hover */
  interactive?: boolean
  /** Pointer-fine only tilt (max ~4deg) */
  tilt?: boolean
}

export function Card({
  className,
  ref,
  interactive,
  tilt,
  onMouseMove,
  onMouseLeave,
  ...props
}: CardProps) {
  const localRef = useRef<HTMLDivElement | null>(null)

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    onMouseMove?.(e)
    if (!tilt) return
    const el = localRef.current
    if (!el) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(800px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-2px)`
  }

  function handleLeave(e: MouseEvent<HTMLDivElement>) {
    onMouseLeave?.(e)
    if (localRef.current) localRef.current.style.transform = ''
  }

  return (
    <div
      ref={(node) => {
        localRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as { current: HTMLDivElement | null }).current = node
      }}
      className={cn(
        'rounded-card border border-line bg-surface p-5 shadow-[var(--shadow-card)]',
        'transition-[transform,box-shadow] duration-200 ease-out will-change-transform',
        interactive && 'hover:-translate-y-1 hover:shadow-md',
        className,
      )}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...props}
    />
  )
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>
}

export function CardHeader({ className, ref, ...props }: CardHeaderProps) {
  return (
    <div
      ref={ref}
      className={cn('mb-4', className)}
      {...props}
    />
  )
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  ref?: React.Ref<HTMLHeadingElement>
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export function CardTitle({ className, as: Tag = 'h3', ref, ...props }: CardTitleProps) {
  return (
    <Tag
      ref={ref as React.Ref<HTMLHeadingElement>}
      className={cn('!text-lg font-semibold leading-snug text-heading', className)}
      {...props}
    />
  )
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>
}

export function CardBody({ className, ref, ...props }: CardBodyProps) {
  return (
    <div
      ref={ref}
      className={cn('text-sm text-fg', className)}
      {...props}
    />
  )
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>
}

export function CardFooter({ className, ref, ...props }: CardFooterProps) {
  return (
    <div
      ref={ref}
      className={cn('mt-4 flex items-center gap-3', className)}
      {...props}
    />
  )
}
