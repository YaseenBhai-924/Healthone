'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/cn'

export type ToastVariant = 'info' | 'success' | 'warning' | 'danger'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

export interface ToastContextValue {
  /**
   * Show a toast. Messages must be short and must never contain personal data
   * or eScript / status tokens — only generic operational copy.
   */
  addToast: (toast: { message: string; variant?: ToastVariant }) => string
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const icons: Record<ToastVariant, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
}

const variantStyles: Record<ToastVariant, string> = {
  info: 'bg-brand-700 text-white',
  success: 'bg-success-fg text-white',
  warning: 'bg-warning-fg text-white',
  danger: 'bg-danger-fg text-white',
}

const AUTO_DISMISS_MS = 5000
const MAX_TOASTS = 3

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const { id, message, variant } = toast
  const Icon = icons[variant]
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const remainingRef = useRef(AUTO_DISMISS_MS)
  const startedRef = useRef(0)
  const pausedRef = useRef(false)

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const startTimer = useCallback(() => {
    if (variant === 'danger') return
    clearTimer()
    startedRef.current = Date.now()
    timerRef.current = setTimeout(() => onRemove(id), remainingRef.current)
  }, [id, onRemove, variant])

  const pause = () => {
    if (variant === 'danger' || pausedRef.current) return
    pausedRef.current = true
    remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedRef.current))
    clearTimer()
  }

  const resume = () => {
    if (variant === 'danger' || !pausedRef.current) return
    pausedRef.current = false
    startTimer()
  }

  useEffect(() => {
    startTimer()
    return clearTimer
  }, [startTimer])

  const assertive = variant === 'danger'

  return (
    <li
      className={cn(
        'flex items-start gap-3 rounded-card px-4 py-3 shadow-lg min-w-[280px] max-w-sm',
        'transition-opacity duration-[150ms] ease-out',
        variantStyles[variant],
      )}
      role={assertive ? 'alert' : 'status'}
      aria-live={assertive ? 'assertive' : 'polite'}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="shrink-0 rounded p-0.5 opacity-80 hover:opacity-100 focus-ring"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </li>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const baseId = useId()
  const counterRef = useRef(0)

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    ({ message, variant = 'info' }: { message: string; variant?: ToastVariant }) => {
      counterRef.current += 1
      const id = `${baseId}-toast-${counterRef.current}`
      setToasts((prev) => {
        const next = [...prev, { id, message, variant }]
        return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next
      })
      return id
    },
    [baseId],
  )

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ul
        aria-label="Notifications"
        aria-live="polite"
        aria-relevant="additions text"
        className={cn(
          'fixed z-50 flex flex-col gap-2 pointer-events-none',
          'bottom-6 left-1/2 -translate-x-1/2 items-center',
          'md:bottom-auto md:top-6 md:right-6 md:left-auto md:translate-x-0 md:items-end',
        )}
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </ul>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>')
  return ctx
}
