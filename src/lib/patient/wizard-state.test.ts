import { afterEach, describe, expect, it } from 'vitest'
import type { DetailsFormValues } from './schema'
import {
  clearWizard,
  hasResumableWizard,
  loadWizard,
  prefillForAnotherOrder,
  saveWizard,
} from './wizard-state'

const details: DetailsFormValues = {
  prescriptionMethod: 'escript',
  escriptToken: '4K7M9PX2LQ8D',
  patientName: 'Jane Smith',
  mobile: '0412345678',
  email: 'jane@example.com',
  fulfilmentType: 'Collection',
  notesToPharmacy: 'Leave at door',
  scriptFileName: '',
}

afterEach(() => {
  sessionStorage.clear()
})

describe('wizard-state', () => {
  it('persists and loads an in-progress wizard', () => {
    saveWizard('demo', { details, step: 1, requestId: 'req-1' })
    const loaded = loadWizard('demo')
    expect(loaded?.step).toBe(1)
    expect(loaded?.requestId).toBe('req-1')
    expect(loaded?.details.patientName).toBe('Jane Smith')
    expect(hasResumableWizard(loaded)).toBe(true)
  })

  it('clears legacy pay/confirmation snapshots instead of resuming them', () => {
    sessionStorage.setItem(
      'sd-wizard:demo',
      JSON.stringify({ details, step: 2, statusToken: 'tok' }),
    )
    expect(loadWizard('demo')).toBeNull()
    expect(sessionStorage.getItem('sd-wizard:demo')).toBeNull()
  })

  it('ignores save attempts for confirmation step', () => {
    saveWizard('demo', {
      details,
      // @ts-expect-error intentional invalid step for guard
      step: 2,
    })
    expect(loadWizard('demo')).toBeNull()
  })

  it('prefills contact fields for another order and clears script fields', () => {
    const next = prefillForAnotherOrder(details)
    expect(next.patientName).toBe('Jane Smith')
    expect(next.email).toBe('jane@example.com')
    expect(next.escriptToken).toBe('')
    expect(next.notesToPharmacy).toBe('')
    expect(next.prescriptionMethod).toBe('escript')
  })

  it('clearWizard removes storage', () => {
    saveWizard('demo', { details, step: 1 })
    clearWizard('demo')
    expect(loadWizard('demo')).toBeNull()
  })
})
