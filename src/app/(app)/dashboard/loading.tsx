/**
 * ダッシュボードのローディング表示。
 * page.tsx は Firestore の 6 コレクションを全件取得するため、データが揃うまで
 * 数秒かかる。ページと同じ骨組みを先に描き、数値部分だけをプレースホルダーにして
 * 「遷移した」ことをすぐに伝える。
 */

const ACCENT_BARS = {
  blue: 'bg-blue-800',
  emerald: 'bg-emerald-600',
  violet: 'bg-violet-600',
  cyan: 'bg-cyan-600',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
} as const

type Accent = keyof typeof ACCENT_BARS

/** 数値の代わりに置く脈動するブロック。装飾なので支援技術からは隠す */
function ValuePlaceholder({ className }: { className: string }) {
  return (
    <span
      data-testid="skeleton-value"
      aria-hidden="true"
      className={`block rounded-md bg-slate-200/80 animate-pulse ${className}`}
    />
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-[11px] font-bold text-slate-400 tracking-[0.18em] uppercase">
        {children}
      </h2>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  )
}

function CountBadgeSkeleton({ divider = true }: { divider?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 sm:gap-3 flex-1 min-w-0 ${
        divider ? 'border-r border-slate-100 pr-2 sm:pr-4' : ''
      }`}
    >
      <ValuePlaceholder className="shrink-0 h-8 w-8 rounded-lg" />
      <div className="min-w-0 flex-1">
        <ValuePlaceholder className="h-2.5 w-16" />
        <ValuePlaceholder className="mt-2.5 h-6 w-14" />
      </div>
    </div>
  )
}

function StatCardSkeleton({ color, size }: { color: Accent; size: '4xl' | '3xl' }) {
  const valueHeight = size === '4xl' ? 'h-8 sm:h-9 md:h-10' : 'h-5 sm:h-6 md:h-8'
  return (
    <div className="relative flex-1 bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm overflow-hidden">
      <div className={`absolute inset-y-0 left-0 w-1.5 rounded-l-xl ${ACCENT_BARS[color]}`} />
      <div className="pl-2">
        <ValuePlaceholder className="h-2.5 w-20" />
        <ValuePlaceholder className={`mt-3 w-3/4 ${valueHeight}`} />
      </div>
    </div>
  )
}

const BREAKDOWN_COLORS: Accent[] = ['violet', 'cyan', 'amber', 'rose']

export default function DashboardLoading() {
  return (
    <div
      role="status"
      aria-label="読み込み中"
      aria-busy="true"
      className="w-full min-h-screen bg-slate-50 px-4 pb-16"
    >
      <div className="max-w-7xl mx-auto pt-8">
        {/* ページヘッダー: 静的なので即時表示 */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">在庫ダッシュボード</h1>
          <p className="mt-1 text-sm text-slate-500">生地在庫・仕掛・発注の概況</p>
        </div>

        {/* カウントカード */}
        <SectionHeading>登録・仕掛 件数</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
            <CountBadgeSkeleton />
            <CountBadgeSkeleton divider={false} />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
            <CountBadgeSkeleton />
            <CountBadgeSkeleton />
            <CountBadgeSkeleton divider={false} />
          </div>
        </div>

        {/* TOTAL */}
        <SectionHeading>在庫合計</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <StatCardSkeleton color="blue" size="4xl" />
          <StatCardSkeleton color="emerald" size="4xl" />
        </div>

        {/* 詳細 breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <SectionHeading>数量内訳（m）</SectionHeading>
            <div className="grid grid-cols-2 gap-4">
              {BREAKDOWN_COLORS.map((color) => (
                <StatCardSkeleton key={color} color={color} size="3xl" />
              ))}
            </div>
          </div>
          <div>
            <SectionHeading>金額内訳（円）</SectionHeading>
            <div className="grid grid-cols-2 gap-4">
              {BREAKDOWN_COLORS.map((color) => (
                <StatCardSkeleton key={color} color={color} size="3xl" />
              ))}
            </div>
          </div>
        </div>

        {/* ランキングチャート */}
        <SectionHeading>使用・購入ランキング</SectionHeading>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ValuePlaceholder className="h-72 rounded-xl" />
          <ValuePlaceholder className="h-72 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
