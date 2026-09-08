import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SEARCH_DEBOUNCE_MS } from './useDebounce'
import { getDefaultPeriod, isCompleteDate } from '@/lib/dates'

/**
 * 期間 (開始日・終了日) での再取得を担う。
 * 検索ボタンは持たず、入力が落ち着いたら自動で取得し直す。
 */
export function usePeriodSearch(basePath: string, startDay: string, endDay: string) {
  const router = useRouter()
  const [start, setStart] = useState(startDay)
  const [end, setEnd] = useState(endDay)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearScheduled = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }

  const schedule = (nextStart: string, nextEnd: string) => {
    clearScheduled()
    timer.current = setTimeout(() => {
      if (!isCompleteDate(nextStart) || !isCompleteDate(nextEnd)) return
      router.push(`${basePath}?start=${nextStart}&end=${nextEnd}`)
    }, SEARCH_DEBOUNCE_MS)
  }

  useEffect(() => clearScheduled, [])

  return {
    start,
    end,
    setStart: (value: string) => {
      setStart(value)
      schedule(value, end)
    },
    setEnd: (value: string) => {
      setEnd(value)
      schedule(start, value)
    },
    resetPeriod: () => {
      clearScheduled()
      const period = getDefaultPeriod()
      setStart(period.start)
      setEnd(period.end)
      router.push(basePath)
    },
  }
}
