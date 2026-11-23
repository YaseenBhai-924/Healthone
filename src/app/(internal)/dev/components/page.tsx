/**
 * Component Gallery — only available when:
 *   COMPONENT_GALLERY_ENABLED === 'true'  OR
 *   NODE_ENV === 'development'
 *
 * In production with the flag off this page returns 404.
 * force-dynamic so the env gate is evaluated per request, not at build time.
 */
import { notFound } from 'next/navigation'
import { isComponentGalleryEnabled } from '@/lib/gallery-gate'
import { GalleryContent } from './gallery-content'

export const dynamic = 'force-dynamic'

export default function ComponentsGalleryPage() {
  if (!isComponentGalleryEnabled()) notFound()
  return <GalleryContent />
}
