import { describe, it, expect } from 'vitest'
import { formatSerialNumber } from './format'

describe('formatSerialNumber', () => {
  it('10桁にゼロパディングする', () => {
    expect(formatSerialNumber(123)).toBe('0000000123')
  })

  it('ちょうど10桁の場合はそのまま返す', () => {
    expect(formatSerialNumber(1234567890)).toBe('1234567890')
  })

  it('0 は 0000000000 を返す', () => {
    expect(formatSerialNumber(0)).toBe('0000000000')
  })

  it('1桁の場合は先頭に9個のゼロを付ける', () => {
    expect(formatSerialNumber(1)).toBe('0000000001')
  })

  it('10桁超え (11桁) の場合は下位10桁を返す', () => {
    // 仕様: オーバーフロー時は下位10桁を返す (運用上カウンタが10桁超えることはないが明示)
    expect(formatSerialNumber(12345678901)).toBe('2345678901')
  })
})
