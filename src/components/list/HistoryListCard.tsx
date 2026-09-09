import { ListCard, ListCardPane } from '@/components/list/ListCard'
import { InlineStat, Chip } from '@/components/products/shared'
import { CommentModal } from '@/components/CommentModal'
import { formatSerialNumber } from '@/lib/serialnumbers/format'
import { calcAmount } from '@/lib/numbers'

export type HistoryListCardProps = {
  /** 生地の History / キバタの GrayFabricHistory のどちらも受け取れる最小の形 */
  history: {
    productNumber: string
    productName: string
    serialNumber: number
    createUser: string
    orderedAt: string
    quantity: number
    price: number
    comment: string
    stockPlace?: string
  }
  usersMap: Record<string, string>
  /** 品番の横に出すチップ。生地は色名、キバタは仕入先名 */
  chipLabel?: string
  /** 発注日の下に出す日付の見出し。仕上 / 入荷 / 入荷予定 / 納期 など */
  dateLabel: string
  dateValue: string
  /** 出荷先を表示する。生地仕入・徳島・経理の一覧だけが持つ */
  showStockPlace?: boolean
  /** キバタは単価を持たないため数量だけを表示する */
  quantityOnly?: boolean
  /** コメントをダイアログで開くボタンも置く (キバタ一覧) */
  withCommentModal?: boolean
  actions: React.ReactNode
}

/**
 * 発注 / 入荷履歴の 1 行。
 * 品番・担当と日付・数値・コメント・アクションの 5 ペインで構成する。
 */
export function HistoryListCard({
  history,
  usersMap,
  chipLabel,
  dateLabel,
  dateValue,
  showStockPlace,
  quantityOnly,
  withCommentModal,
  actions,
}: HistoryListCardProps) {
  return (
    <ListCard
      mdCols={
        quantityOnly
          ? 'md:grid-cols-[2fr_1.5fr_1fr_2.5fr_7rem]'
          : 'md:grid-cols-[2fr_1.5fr_2.5fr_1.5fr_7rem]'
      }
    >
      {/* ペイン1: 品番・チップ・品名 */}
      <ListCardPane>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-slate-900 text-sm leading-none">
            {history.productNumber}
          </span>
          {chipLabel && <Chip label={chipLabel} />}
        </div>
        <div
          className="text-xs text-slate-700 truncate leading-none"
          title={history.productName}
        >
          {history.productName}
        </div>
        <div className="text-xs text-slate-400 leading-none">
          NO.{formatSerialNumber(history.serialNumber)}
        </div>
      </ListCardPane>

      {/* ペイン2: 担当・日付 */}
      <ListCardPane>
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs text-slate-500 leading-none shrink-0">担当</span>
          <Chip
            label={usersMap[history.createUser] ?? history.createUser}
            variant="indigo"
          />
        </div>
        <div className="text-xs text-slate-600 leading-none">
          発注: {history.orderedAt}
        </div>
        <div className="text-xs text-slate-600 leading-none">
          {dateLabel}: {dateValue}
        </div>
      </ListCardPane>

      {/* ペイン3: 数値 */}
      {quantityOnly ? (
        <ListCardPane stat className="grid-cols-1">
          <InlineStat label="数量" value={history.quantity} unit="m" />
        </ListCardPane>
      ) : (
        <ListCardPane stat className="grid-cols-3">
          <InlineStat label="数量" value={history.quantity} unit="m" />
          <InlineStat label="単価" value={history.price} unit="円" />
          <InlineStat
            label="金額"
            value={calcAmount(history.quantity, history.price)}
            unit="円"
          />
        </ListCardPane>
      )}

      {/* ペイン4: 出荷先・コメント */}
      <ListCardPane className={withCommentModal ? 'flex-row items-center' : undefined}>
        {showStockPlace && history.stockPlace && (
          <div className="text-xs text-slate-500 truncate leading-none">
            出荷先: {history.stockPlace}
          </div>
        )}
        {withCommentModal && <CommentModal comment={history.comment ?? ''} />}
        <div
          className="text-xs text-slate-600 truncate"
          title={history.comment ?? ''}
        >
          {history.comment}
        </div>
      </ListCardPane>

      {/* ペイン5: アクション */}
      <ListCardPane action className="md:flex-col md:justify-center">
        {actions}
      </ListCardPane>
    </ListCard>
  )
}
