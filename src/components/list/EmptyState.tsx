import { cn } from '@/lib/utils'

/** 一覧が空のときのプレースホルダ */
export function EmptyState({
  children = '現在登録された情報はありません。',
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-sm py-12 text-center text-slate-400 text-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}
