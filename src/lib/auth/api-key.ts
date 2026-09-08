/**
 * 外部システム (daimaru-portal) 向け API の認可。
 * ブラウザからのアクセスではなくサーバー間通信なのでセッションクッキーを持てず、
 * 従来から `?API_KEY=` クエリで認可している。互換性のため方式を変更できない。
 */
export function verifyApiKey(request: Request): boolean {
  const expected = process.env.BACKEND_API_KEY
  if (!expected) return false

  const provided = new URL(request.url).searchParams.get('API_KEY')
  return provided === expected
}
