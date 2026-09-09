/**
 * Firestore Admin SDK の最小スタブ。
 * where / orderBy / startAt / endAt は呼び出しを記録するだけで、
 * get() は collections に渡したドキュメントをそのまま返す。
 * 「どの条件で引いたか」と「取得後に lib が何を絞り込んだか」を分けて検証するため。
 */
export type FakeDoc = { id: string; data: () => Record<string, unknown> }

export type QueryCall = {
  collection: string
  where: Array<[string, string, unknown]>
  orderBy: Array<[string, string]>
  startAt?: unknown
  endAt?: unknown
}

export function doc(id: string, data: Record<string, unknown>): FakeDoc {
  return { id, data: () => data }
}

export function createFakeDb(collections: Record<string, FakeDoc[]>) {
  const calls: QueryCall[] = []

  const collection = (name: string) => {
    const call: QueryCall = { collection: name, where: [], orderBy: [] }
    calls.push(call)
    const docs = () => collections[name] ?? []

    const query = {
      where(field: string, op: string, value: unknown) {
        call.where.push([field, op, value])
        return query
      },
      orderBy(field: string, direction = 'asc') {
        call.orderBy.push([field, direction])
        return query
      },
      startAt(value: unknown) {
        call.startAt = value
        return query
      },
      endAt(value: unknown) {
        call.endAt = value
        return query
      },
      async get() {
        return { docs: docs(), size: docs().length }
      },
      doc(id: string) {
        return {
          async get() {
            const found = docs().find((d) => d.id === id)
            return { id, exists: Boolean(found), data: () => found?.data() }
          },
        }
      },
    }
    return query
  }

  /** 記録されたクエリのうち、指定コレクションの最後の 1 件 */
  const callFor = (name: string) => calls.filter((c) => c.collection === name).at(-1)

  return { db: { collection }, calls, callFor }
}
