import { act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, vi } from 'vitest'
import { SEARCH_DEBOUNCE_MS } from '@/hooks/useDebounce'

/** 検索デバウンスを検証するテストのタイマー設定 */
export function setupSearchDebounceTimers() {
  beforeEach(() => {
    // shouldAdvanceTime を付けないと userEvent の待機とデッドロックする
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })
  afterEach(() => {
    vi.useRealTimers()
  })
}

/** 偽タイマー下でも動く userEvent */
export const setupUser = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

/** デバウンス待ちを解消して絞り込みを走らせる */
export const flushSearchDebounce = () =>
  act(() => {
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
  })
