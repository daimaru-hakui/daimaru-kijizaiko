import { describe, it, expect } from 'vitest'
import { buildScheduleCsv } from './csv'
import type { CuttingSchedule } from '../../../types'

const schedule: CuttingSchedule = {
  id: 'c1',
  staff: 'uid1',
  userRef: '',
  processNumber: '1234',
  productId: 'p1',
  productRef: '',
  itemName: 'ブルゾン',
  quantity: 30,
  scheduledAt: '2026-10-01',
}

const usersMap = { uid1: '田中' }
const productMap = { p1: { productNumber: 'A-001', colorName: '白' } }

describe('buildScheduleCsv', () => {
  it('生地品番と色は productMap から解決する', () => {
    const csv = buildScheduleCsv([schedule], usersMap, productMap).replace('﻿', '')
    expect(csv.split('\n')[1]).toBe(
      '"A-001","白","田中","1234","ブルゾン","2026-10-01","30"',
    )
  })

  it('productMap にない生地は productId をそのまま出す', () => {
    const csv = buildScheduleCsv([schedule], usersMap, {})
    expect(csv).toContain('"p1"')
  })

  it('0件のときヘッダー行だけ返す', () => {
    expect(buildScheduleCsv([], usersMap, productMap).replace('﻿', '').split('\n')).toHaveLength(1)
  })
})
