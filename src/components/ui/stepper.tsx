'use client'

import { cn } from '@/lib/cn'

export interface StepperStep {
  label: string
  /** Short description (optional) */
  description?: string
}

export interface StepperProps {
  steps: StepperStep[]
  /** 0-indexed current step */
  currentStep: number
  className?: string
}

/**
 * Linear progress stepper — accessible via aria-current and visually
 * distinguishes completed, current and upcoming steps.
 *
 * Displays horizontally on wider screens and collapses to a compact
 * "Step N of M" label on narrow viewports (≤ 400 px).
 */
export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={cn('w-full', className)}>
      {/* Compact label for narrow viewports */}
      <p className="sm:hidden text-sm text-fg-muted text-center mb-3">
        Step {currentStep + 1} of {steps.length}
        {steps[currentStep] && (
          <span className="font-semibold text-fg"> — {steps[currentStep].label}</span>
        )}
      </p>

      {/* Full horizontal stepper */}
      <ol className="hidden sm:flex items-center w-full" role="list">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <li
              key={step.label}
              className={cn('flex items-center', index < steps.length - 1 && 'flex-1')}
            >
              {/* Step indicator */}
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                    'transition-colors duration-[150ms] ease-out',
                    isCompleted && 'bg-brand-600 text-white',
                    isCurrent && 'border-2 border-brand-600 bg-white text-brand-600',
                    isUpcoming && 'border-2 border-subtle bg-surface text-fg-muted',
                  )}
                  aria-hidden="true"
                >
                  {isCompleted ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2 7l3.5 3.5L12 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="hidden md:block">
                  <p
                    className={cn(
                      'text-xs font-semibold',
                      isCompleted && 'text-fg-secondary',
                      isCurrent && 'text-brand-600',
                      /*
                       * Upcoming steps use fg-muted directly (5.16:1 on bg-page).
                       * Using opacity-50 would compute to ~2.1:1 contrast — fails AA.
                       */
                      isUpcoming && 'text-fg-muted',
                    )}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-fg-muted">{step.description}</p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-3 h-0.5 flex-1 transition-colors duration-[150ms]',
                    isCompleted ? 'bg-brand-600' : 'bg-subtle',
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>

      {/* Progress bar (mobile only, for visual indication) */}
      <div
        className="sm:hidden h-1.5 rounded-full bg-subtle overflow-hidden"
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label={`Step ${currentStep + 1} of ${steps.length}`}
      >
        <div
          className="h-full bg-brand-600 rounded-full transition-[width] duration-[300ms] ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </nav>
  )
}
