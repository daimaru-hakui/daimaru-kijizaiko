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
      <TableRow>
        <TableHead>担当</TableHead>
        <TableHead>生地品番</TableHead>
        <TableHead>色</TableHead>
        {showEdit && (
          <>
            {isRD && (
              <>
                <TableHead className="text-right">単価（円）</TableHead>
                <TableHead className="text-right">染め仕掛(m)</TableHead>
                <TableHead className="text-right">外部在庫(m)</TableHead>
                <TableHead className="text-right">入荷待ち(m)</TableHead>
              </>
            )}
            <TableHead className="text-right">徳島在庫(m)</TableHead>
            <TableHead>処理</TableHead>
          </>
        )}
      </TableRow>
    </TableHeader>
  )
}
