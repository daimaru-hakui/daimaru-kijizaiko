import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { usePeriodSearch } from './usePeriodSearch'
import { getDefaultPeriod } from '@/lib/dates'
import { SEARCH_DEBOUNCE_MS } from './useDebounce'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: (...args: unknown[]) => push(...args) }),
}))

const setup = () =>
  renderHook(() => usePeriodSearch('/histories', '2024-01-01', '2024-03-01'))

const advance = () =>
  act(() => {
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
  })

beforeEach(() => {
  push.mockClear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('usePeriodSearch', () => {
  it('初期表示では取得し直さない', () => {
    setup()
    advance()
    expect(push).not.toHaveBeenCalled()
  })

  it('日付を変えるとデバウンス後に期間付きで取得し直す', () => {
    const { result } = setup()

    act(() => result.current.setStart('2024-02-01'))
    expect(push).not.toHaveBeenCalled()

    advance()
    expect(push).toHaveBeenCalledWith('/histories?start=2024-02-01&end=2024-03-01')
  })

  it('入力途中の不完全な日付では取得し直さない', () => {
    const { result } = setup()

    act(() => result.current.setStart('0002-02-01'))
    advance()
    expect(push).toHaveBeenCalledTimes(1)

    push.mockClear()
    act(() => result.current.setEnd(''))
    advance()
    expect(push).not.toHaveBeenCalled()
  })

  it('resetPeriod で既定の期間に戻し、絞り込み無しで取得し直す', () => {
    const { result } = setup()

    act(() => result.current.resetPeriod())

    const { start, end } = getDefaultPeriod()
    expect(result.current.start).toBe(start)
    expect(result.current.end).toBe(end)
    expect(push).toHaveBeenCalledWith('/histories')

    // リセット直後にデバウンスが走っても取得し直さない
    push.mockClear()
    advance()
    expect(push).not.toHaveBeenCalled()
  })
})
