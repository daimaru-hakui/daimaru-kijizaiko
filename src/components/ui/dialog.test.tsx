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

  it('閉じるボタンはスクロール領域の外にあり常に表示される', () => {
    const dialog = renderDialog()
    const closeButton = screen.getByRole('button', { name: 'Close' })
    expect(dialog.querySelector('[data-slot="dialog-body"]')!.contains(closeButton)).toBe(false)
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
