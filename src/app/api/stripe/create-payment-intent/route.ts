import { NextResponse } from 'next/server'

/** Demo product — Smoke Rehabilitation Starter Kit (AUD). */
const AMOUNT_CENTS = 8900
const CURRENCY = 'aud'

/**
 * Dummy PaymentIntent for the upfront demo (no Stripe SDK / secret required).
 */
export async function POST() {
  const id = `pi_dummy_${Date.now()}`
  return NextResponse.json({
    clientSecret: `${id}_secret_dummy`,
    amountCents: AMOUNT_CENTS,
    currency: CURRENCY,
    paymentIntentId: id,
    dummy: true,
  })
}
