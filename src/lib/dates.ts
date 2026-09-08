export function getTodayDate(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function get3monthsAgo(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 3)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}-01`
}

/** 日付入力は途中の値も onChange で流れてくるため、YYYY-MM-DD が揃ったかを見る */
export function isCompleteDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

/** 一覧の期間検索の既定値 (3ヶ月前の月初〜今日) */
export function getDefaultPeriod(): { start: string; end: string } {
  return { start: get3monthsAgo(), end: getTodayDate() }
}

/**
 * 発注書など帳票に載せる発行日時。
 * 本番はサーバーが UTC で動くため、日本時間で固定して整形する。
 */
export function formatJstDateTime(date: Date): string {
  // sv-SE は "YYYY-MM-DD HH:mm" 形式で返る
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}
