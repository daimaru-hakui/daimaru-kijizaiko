import { cn } from '@/lib/utils'

/**
 * ページ全体の背景と中央寄せの器。
 * maxWidth はフォーム系の狭いページ (max-w-xl 等) がページごとに指定する。
 */
export function PageContainer({
  children,
  className,
  maxWidth = 'max-w-7xl',
}: {
  children: React.ReactNode
  className?: string
  maxWidth?: string
}) {
  return (
    <div className={cn('w-full min-h-screen bg-slate-50 px-4 pb-16', className)}>
      <div className={cn('mx-auto pt-6', maxWidth)}>{children}</div>
    </div>
  )
}
