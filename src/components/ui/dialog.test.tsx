import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Dialog, DialogContent, DialogTitle } from './dialog'

function renderDialog() {
  render(
    <Dialog open>
      <DialogContent>
        <DialogTitle>テストダイアログ</DialogTitle>
        <p>本文</p>
      </DialogContent>
    </Dialog>
  )
  return screen.getByRole('dialog')
}

describe('DialogContent', () => {
  it('ビューポート高さを超えないよう最大高さが設定されている', () => {
    expect(renderDialog().className).toContain('max-h-[90dvh]')
  })

  it('本文が収まらない場合にスクロールする領域を持つ', () => {
    const scrollArea = renderDialog().querySelector('[data-slot="dialog-body"]')
    expect(scrollArea).not.toBeNull()
    expect(scrollArea!.className).toContain('overflow-y-auto')
  })

  it('スクロール領域の左にフォーカスリング分の余白がある', () => {
    // overflow-y:auto は overflow-x も auto に計算されるため、余白がないと
    // 端に接した input のフォーカスリングが左右で切れる
    const scrollArea = renderDialog().querySelector('[data-slot="dialog-body"]')!
    expect(scrollArea.className).toContain('-ml-2')
    expect(scrollArea.className).toContain('pl-2')
  })

  it('スクロールバーが閉じるボタンと重ならないよう右端まで広げる', () => {
    // スクロールバーはスクロール領域の右端に出る。領域を閉じるボタンより
    // 内側で止めるとボタンの下に潜り込むため、パディングを打ち消して
    // ダイアログの縁まで広げ、内側の pr-6 で本文との間隔を保つ
    const scrollArea = renderDialog().querySelector('[data-slot="dialog-body"]')!
    expect(scrollArea.className).toContain('-mr-6')
    expect(scrollArea.className).toContain('pr-6')
  })

  it('閉じるボタンはスクロール領域の外にあり常に表示される', () => {
    const dialog = renderDialog()
    const closeButton = screen.getByRole('button', { name: 'Close' })
    expect(dialog.querySelector('[data-slot="dialog-body"]')!.contains(closeButton)).toBe(false)
  })

  it('閉じるボタンはスクロールバーの幅を避けた位置にある', () => {
    renderDialog()
    const closeButton = screen.getByRole('button', { name: 'Close' })
    expect(closeButton.className).toContain('right-4')
  })
})

describe('DialogContent の表示アニメーション', () => {
  it('斜めに動くスライドではなくフェード + わずかな拡大で表示する', () => {
    const className = renderDialog().className
    expect(className).toContain('data-[state=open]:fade-in-0')
    expect(className).toContain('data-[state=open]:zoom-in-95')
    expect(className).not.toContain('slide-in-from-left')
  })

  it('中央寄せに transform を使わない (アニメーションの移動と打ち消し合うため)', () => {
    const className = renderDialog().className
    expect(className).not.toContain('translate-x-[-50%]')
    expect(className).not.toContain('translate-y-[-50%]')
  })
})
