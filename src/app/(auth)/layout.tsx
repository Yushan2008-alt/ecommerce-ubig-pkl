import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl tracking-tight text-foreground">
            <span className="bg-primary text-primary-foreground w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shadow-sm">
              U
            </span>
            <span>Marketplace Ubig</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
