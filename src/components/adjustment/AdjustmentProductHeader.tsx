import { TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { HEAD } from '@/components/ui/table-styles'

type Props = {
  isRD: boolean
  isTokushima: boolean
}

export function AdjustmentProductHeader({ isRD, isTokushima }: Props) {
  const showEdit = isRD || isTokushima
  return (
    <TableHeader className="sticky top-0 z-10 bg-slate-50 shadow-[inset_0_-1px_0_#e2e8f0]">
      <TableRow className="bg-slate-50 hover:bg-slate-50">
        <TableHead className={HEAD}>担当</TableHead>
        <TableHead className={HEAD}>生地品番</TableHead>
        <TableHead className={HEAD}>色</TableHead>
        {showEdit && (
          <>
            {isRD && (
              <>
                <TableHead className={HEAD}>単価（円）</TableHead>
                <TableHead className={HEAD}>染め仕掛(m)</TableHead>
                <TableHead className={HEAD}>外部在庫(m)</TableHead>
                <TableHead className={HEAD}>入荷待ち(m)</TableHead>
              </>
            )}
            <TableHead className={HEAD}>徳島在庫(m)</TableHead>
            <TableHead className={HEAD}>処理</TableHead>
          </>
        )}
      </TableRow>
    </TableHeader>
  )
}
