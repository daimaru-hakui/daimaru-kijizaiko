import {
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Props = {
  isRD: boolean
  isTokushima: boolean
}

export function AdjustmentProductHeader({ isRD, isTokushima }: Props) {
  const showEdit = isRD || isTokushima
  return (
    <TableHeader className="sticky top-0 bg-white z-10">
      <TableRow className="bg-slate-50">
        <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">担当</TableHead>
        <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">生地品番</TableHead>
        <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">色</TableHead>
        {showEdit && (
          <>
            {isRD && (
              <>
                <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">単価（円）</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">染め仕掛(m)</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">外部在庫(m)</TableHead>
                <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">入荷待ち(m)</TableHead>
              </>
            )}
            <TableHead className="text-right text-xs font-semibold text-slate-500 tracking-wider">徳島在庫(m)</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 tracking-wider">処理</TableHead>
          </>
        )}
      </TableRow>
    </TableHeader>
  )
}
