import { beforeEach, describe, expect, it } from 'vitest'
import {
  getDefaultStaticClinic,
  resetStaticStore,
  toPublicClinicDto,
} from './store'
import { PHARMACY_A_ID } from './seed'

describe('toPublicClinicDto', () => {
  beforeEach(() => {
    resetStaticStore()
  })

  it('includes pharmacyName and pharmacyAddress from the joined pharmacy', () => {
    const clinic = getDefaultStaticClinic()
    expect(clinic).not.toBeNull()
    const dto = toPublicClinicDto(clinic!)
    expect(dto.pharmacyName).toBe('Shaheen Chemist')
    expect(dto.pharmacyAddress).toMatchObject({
      suburb: 'Sydney',
      state: 'NSW',
      postcode: '2000',
    })
    expect(dto.pharmacyAddress?.line1).toBeTruthy()
    expect(clinic?.pharmacyId).toBe(PHARMACY_A_ID)
  })
})
