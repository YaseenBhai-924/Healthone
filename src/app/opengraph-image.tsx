import { ImageResponse } from 'next/og'

export const alt = 'Script Direct'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72,
          background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 45%, #DBEAFE 100%)',
          color: '#0F2A4A',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: '#2563EB',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            SD
          </div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>Script Direct</div>
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, maxWidth: 900 }}>
          Your script, delivered or ready to collect.
        </div>
        <div style={{ marginTop: 24, fontSize: 28, color: '#4B6584', maxWidth: 820 }}>
          Pay after pharmacy verification via a secure Stripe link. No account needed.
        </div>
      </div>
    ),
    { ...size },
  )
}
