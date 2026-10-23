import { timingSafeEqual } from 'node:crypto'

/**
 * 外部システム (daimaru-portal) 向け API の認可。
 * ブラウザからのアクセスではなくサーバー間通信なのでセッションクッキーを持てない。
 * キーは `Authorization: Bearer` ヘッダーで受け取る。
 * 従来の `?API_KEY=` クエリは URL ごとログに残るため、portal が送らなくなるまでの移行期間だけ受け付ける。
 */
export function verifyApiKey(request: Request): boolean {
  const expected = process.env.BACKEND_API_KEY
  if (!expected) return false

  const provided = readProvidedKey(request)
  if (provided === null) return false

  // 文字列比較 (===) は一致した桁数で処理時間が変わり、キーを推測する手掛かりになる
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

function readProvidedKey(request: Request): string | null {
  const authorization = request.headers.get('authorization')
  // ヘッダーがあればクエリは見ない。不一致のヘッダーをクエリで救済しない
  if (authorization !== null) {
    const match = authorization.match(/^Bearer (.+)$/)
    return match ? match[1] : null
  }
  // TODO: portal がクエリ送信をやめたら削除する
  return new URL(request.url).searchParams.get('API_KEY')
}
