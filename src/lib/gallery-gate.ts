/** Env gate for the internal components gallery (no NEXT_PUBLIC_ vars). */
export function isComponentGalleryEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return (
    env.COMPONENT_GALLERY_ENABLED === 'true' || env.NODE_ENV === 'development'
  )
}
