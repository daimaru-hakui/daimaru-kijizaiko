import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SchedulesTable } from './SchedulesTable'
import type { CuttingSchedule } from '../../../types'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/app/(app)/schedules/actions', () => ({
  addScheduleAction: vi.fn().mockResolvedValue({ ok: true }),
  updateScheduleAction: vi.fn().mockResolvedValue({ ok: true }),
  deleteScheduleAction: vi.fn().mockResolvedValue({ ok: true }),
}))

const schedule: CuttingSchedule = {
  id: 's1',
  staff: 'user-1',
  userRef: '',
  processNumber: 'P-100',
  productId: 'prod-1',
  productRef: '',
  itemName: 'テストアイテム',
  quantity: 50,
  scheduledAt: '2024-03-01',
}

const defaultProps = {
  schedules: [schedule],
  usersMap: { 'user-1': '山田太郎' },
  salesUsers: [{ id: 'user-1', name: '山田太郎' }],
  products: [{ id: 'prod-1', productNumber: 'DM-001', colorName: 'ブラック' }],
  productMap: { 'prod-1': { productNumber: 'DM-001', colorName: 'ブラック' } },
}

describe('SchedulesTable', () => {
  it('スケジュールの品番と編集・削除ボタンが表示される', () => {
    render(<SchedulesTable {...defaultProps} />)
    expect(screen.getByText(/DM-001/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument()
  })

  it('スケジュールが空のとき空状態が表示される', () => {
    render(<SchedulesTable {...defaultProps} schedules={[]} />)
    expect(screen.getByText('現在登録された情報はありません。')).toBeInTheDocument()
  })
})
