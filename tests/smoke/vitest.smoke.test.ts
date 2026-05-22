describe('Vitest smoke test', () => {
  it('テスト環境が正常に動作する', () => {
    expect(1 + 1).toBe(2)
  })

  it('jsdom 環境が有効', () => {
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
  })
})
