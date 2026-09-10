'use client'

import { ToastContainer, toast } from 'react-toastify'

/** Server Action の共通結果型。src/lib/actions.ts の ActionResult / ActionResultWith<T> と同じ形 */
type ResultLike = { ok: true } | { ok: false; error: string }

/** 更新系操作の成功メッセージ。3回以上同じ文言が出るためここに集約する (DRY 3回ルール) */
export const TOAST = {
  created: '登録しました',
  updated: '更新しました',
  deleted: '削除しました',
  ordered: '発注しました',
  confirmed: '確定しました',
} as const

/** 全画面共通のトースト表示領域。src/app/layout.tsx に一度だけ配置する */
export function AppToastContainer() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      theme="colored"
      className="no-print"
    />
  )
}

export function notifySuccess(message: string): void {
  toast.success(message)
}

export function notifyError(message: string): void {
  toast.error(message, { autoClose: 5000 })
}

/**
 * Server Action の結果をトーストで通知する。
 * 成功時は successMessage、失敗時は result.error を表示する。
 * 型述語になっており、呼び出し側で `if (!notifyResult(result, ...)) return` とすると
 * 以降 result は ok: true 側に絞り込まれる (ActionResultWith<T> の data を参照できる)。
 */
export function notifyResult<T extends ResultLike>(
  result: T,
  successMessage: string,
): result is Extract<T, { ok: true }> {
  if (result.ok) {
    notifySuccess(successMessage)
    return true
  }
  notifyError(result.error)
  return false
}
