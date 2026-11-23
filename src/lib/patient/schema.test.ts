import { describe, expect, it } from 'vitest'
import {
  detailsSchema,
  lostLinkSchema,
  toCreateRequestBody,
  toCreateRequestPayload,
} from './schema'
import { PRIVACY_VERSION, TERMS_VERSION } from './policies'

describe('detailsSchema', () => {
  const valid = {
    prescriptionMethod: 'escript' as const,
    escriptToken: '4K7M9PX2LQ8D',
    patientName: 'Jane Smith',
    mobile: '0412 345 678',
    email: 'jane@example.com',
    fulfilmentType: 'Collection' as const,
  }

  it('accepts a valid collection request', () => {
    expect(detailsSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects short eScript tokens', () => {
    const r = detailsSchema.safeParse({ ...valid, escriptToken: 'ABC' })
    expect(r.success).toBe(false)
  })

  it('accepts upload when a file name is present', () => {
    const r = detailsSchema.safeParse({
      ...valid,
      prescriptionMethod: 'upload',
      escriptToken: '',
      scriptFileName: 'script.pdf',
    })
    expect(r.success).toBe(true)
  })

  it('rejects upload without a file name', () => {
    const r = detailsSchema.safeParse({
      ...valid,
      prescriptionMethod: 'upload',
      escriptToken: '',
      scriptFileName: '',
    })
    expect(r.success).toBe(false)
  })

  it('rejects non-Australian mobiles', () => {
    const r = detailsSchema.safeParse({ ...valid, mobile: '0212345678' })
    expect(r.success).toBe(false)
  })

  it('requires address for delivery', () => {
    const r = detailsSchema.safeParse({
      ...valid,
      fulfilmentType: 'Delivery',
    })
    expect(r.success).toBe(false)
  })

  it('accepts delivery with a full address', () => {
    const r = detailsSchema.safeParse({
      ...valid,
      fulfilmentType: 'Delivery',
      address: {
        line1: '12 Example St',
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
      },
    })
    expect(r.success).toBe(true)
  })
})

describe('toCreateRequestPayload', () => {
  it('normalises the token and attaches policy versions', () => {
    const body = toCreateRequestPayload(
      'test-clinic-a',
      {
        prescriptionMethod: 'escript',
        escriptToken: '  abcd1234ef  ',
        patientName: 'Jane',
        mobile: '0412345678',
        email: 'jane@example.com',
        fulfilmentType: 'Collection',
      },
      { privacyPolicyAccepted: true, termsAccepted: true },
    )
    expect(body.scriptSource).toBe('Escript')
    expect(body.escriptToken).toBe('ABCD1234EF')
    expect(body.consent.privacyVersion).toBe(PRIVACY_VERSION)
    expect(body.consent.termsVersion).toBe(TERMS_VERSION)
    expect(body.address).toBeNull()
  })

  it('maps upload method without an eScript token', () => {
    const body = toCreateRequestPayload(
      'test-clinic-a',
      {
        prescriptionMethod: 'upload',
        escriptToken: '',
        scriptFileName: 'rx.pdf',
        patientName: 'Jane',
        mobile: '0412345678',
        email: 'jane@example.com',
        fulfilmentType: 'Collection',
        notesToPharmacy: 'Leave with neighbour',
      },
      { privacyPolicyAccepted: true, termsAccepted: true },
    )
    expect(body.scriptSource).toBe('UploadedScript')
    expect(body.escriptToken).toBeUndefined()
    expect(body.notesToPharmacy).toBe('Leave with neighbour')
  })
})

describe('toCreateRequestBody', () => {
  it('still supports eScript JSON clients', () => {
    const body = toCreateRequestBody(
      'test-clinic-a',
      {
        prescriptionMethod: 'escript',
        escriptToken: 'abcd1234ef',
        patientName: 'Jane',
        mobile: '0412345678',
        email: 'jane@example.com',
        fulfilmentType: 'Collection',
      },
      { privacyPolicyAccepted: true, termsAccepted: true },
    )
    expect(body.escriptToken).toBe('ABCD1234EF')
  })
})

describe('lostLinkSchema', () => {
  it('requires reference and email', () => {
    expect(lostLinkSchema.safeParse({ reference: '', email: '' }).success).toBe(
      false,
    )
    expect(
      lostLinkSchema.safeParse({
        reference: 'SD-7K4M-2QXP',
        email: 'jane@example.com',
      }).success,
    ).toBe(true)
  })
})
