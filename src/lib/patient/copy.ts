/** Patient-facing marketing and flow copy. Pay after pharmacy verification. */

export const brandName = 'Script Direct'

export const homeHero = {
  eyebrow: 'Repeat scripts, simplified',
  headline: 'Your script, delivered or ready to collect.',
  highlightWord: 'delivered',
  support:
    'No account needed. Paste your eScript token, choose delivery or collection, and track progress with a private email link. The pharmacy emails you a secure payment link after verifying your script.',
  primaryCta: 'Start online order',
  secondaryCta: 'Track my order',
  qrHint:
    "Have a clinic QR code? Scan it to open your clinic's ordering page.",
}

export const howItWorks = [
  {
    title: 'Enter your eScript token',
    body: 'Copy the token from your SMS or email prescription and paste it into the form.',
  },
  {
    title: 'Choose delivery or collection',
    body: "Your clinic's partner pharmacy prepares the script. Collect in store or have it delivered.",
  },
  {
    title: 'Pharmacy verifies, then sends a payment link',
    body: 'After checking your script, the pharmacy emails a secure Stripe payment link.',
  },
  {
    title: 'Pay and track',
    body: 'Pay through the link and follow progress with your private status link. No login.',
  },
] as const

export const trustPoints = [
  {
    title: 'Secure and private',
    body: 'Your details stay with HealthOne and your partner pharmacy. No public status pages.',
  },
  {
    title: 'Partner pharmacy',
    body: "Scripts are dispensed by your clinic's nominated community pharmacy, not by us.",
  },
  {
    title: 'Pay after verification',
    body: 'You are only charged after the pharmacy checks your script and sends a secure Stripe payment link.',
  },
] as const

export const trustCards = [
  {
    title: 'No account',
    body: 'Order once with your contact details. We never ask you to create a password.',
  },
  {
    title: 'Partner pharmacy',
    body: "Scripts are dispensed by your clinic's nominated community pharmacy, not by us.",
  },
  {
    title: 'Pay after verification',
    body: 'You are only charged after the pharmacy checks your script and sends a secure Stripe payment link.',
  },
  {
    title: 'Private status link',
    body: 'Track your order with a link only you receive by email. There are no public status pages.',
  },
] as const

/** Short, non-duplicated facts for the ribbon under the hero. */
export const proofPoints = [
  'Prices shown before you pay',
  'Private email tracking',
  'Pay only after verification',
  "Your clinic's partner pharmacy",
] as const

/** Small reassurance chips under the hero CTAs. */
export const heroChips = [
  'No account',
  'Pay after verification',
  'Private tracking link',
] as const

export const ctaBand = {
  title: 'Ready to request your script?',
  highlight: 'your script',
  body: 'Start online in minutes. Pay only after your pharmacy verifies the script and sends a secure payment link.',
  primary: 'Start your request',
  secondary: 'Track my order',
} as const

export const faqItems = [
  {
    id: 'token',
    title: 'What is an eScript token?',
    content:
      'It is the short code from your SMS or email prescription. You paste it into the order form so the pharmacy can retrieve your script.',
  },
  {
    id: 'account',
    title: 'Do I need an account?',
    content:
      'No. Script Direct does not use patient logins. You track your order with a private link sent by email.',
  },
  {
    id: 'pay',
    title: 'When do I pay?',
    content:
      'After the pharmacy verifies your script and emails a Stripe payment link. You are not charged at submit.',
  },
  {
    id: 'lost',
    title: 'What if I lose my status link?',
    content:
      'Use Resend my status link with your reference and email. If the details match, we send a new private link.',
  },
  {
    id: 'reject',
    title: 'What if the pharmacy cannot fill my script?',
    content:
      'You are not charged for an order rejected before payment. If you already paid, a refund is started.',
  },
] as const

export const orderPage = {
  headline: 'Order your script online',
  support:
    "Fast, private eScript ordering with your clinic's partner pharmacy. Submit your details and pay securely upfront.",
  cta: 'Continue to order',
  payNote: 'You pay securely upfront when you place the order.',
}

export const contactPage = {
  headline: 'Contact us',
  support:
    'Questions about Script Direct or need help with an order? Reach the HealthOne team using the details below.',
  phone: '+61 2 9965 9600',
  phoneHref: 'tel:+61299659600',
  email: 'newthinking@healthone.com.au',
  address: '906/6a Glen Street, Milsons Point NSW 2061',
  mapsHref:
    'https://www.google.com/maps/search/?api=1&query=906%2F6a%20Glen%20Street%2C%20Milsons%20Point%20NSW%202061',
  hours: 'Monday to Friday, 9am to 5pm Sydney time',
}

/** Wizard only: Details → Review → Payment (upfront) → Done */
export const wizardSteps = [
  { label: 'Details' },
  { label: 'Review' },
  { label: 'Payment' },
  { label: 'Done' },
] as const
