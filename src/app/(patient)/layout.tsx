import { SiteFooter } from '@/components/patient/site-footer'
import { SiteHeader } from '@/components/patient/site-header'
import { patientFontClass } from '@/lib/patient/fonts'

/**
 * Patient route group: public marketing + order flow.
 * No authentication. Atmosphere + shell shared across patient pages.
 */
export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className={`${patientFontClass} patient-atmosphere flex min-h-svh flex-col`}
    >
      <SiteHeader />
      <div id="main-content" className="relative flex flex-1 flex-col">
        {children}
      </div>
      <SiteFooter />
    </div>
  )
}
