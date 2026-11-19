import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 min-w-0 w-full max-w-full">{children}</main>
      <SiteFooter />
    </div>
  )
}
