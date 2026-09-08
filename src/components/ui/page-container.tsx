import { cn } from '@/lib/utils'

export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('w-full min-h-screen bg-slate-50 px-4 pb-16', className)}>
      <div className="max-w-7xl mx-auto pt-6">{children}</div>
    </div>
  )
}
