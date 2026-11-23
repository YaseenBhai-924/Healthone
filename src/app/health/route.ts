/**
 * GET /health
 *
 * Basic liveness check. Returns 200 with a timestamp.
 * Cache-Control: no-store is set by the middleware; also set explicitly here.
 */
export function GET() {
  return Response.json(
    { status: 'ok', timestamp: new Date().toISOString() },
    {
      headers: {
        'Cache-Control': 'no-store, private',
      },
    },
  )
}
