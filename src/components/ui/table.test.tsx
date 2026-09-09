import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'

function renderTable() {
  render(
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>加工指示書NO.</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>17-0000132</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

describe('Table', () => {
  it('スクロール枠の class を呼び出し側から差し替えられる', () => {
    // 高さ制限を外側の div に持たせると Table 内側の overflow-auto が
    // スクロール枠になり、sticky なヘッダーが追従しない
    render(
      <Table containerClassName="max-h-[300px]">
        <TableBody>
          <TableRow>
            <TableCell>17-0000132</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    const container = screen.getByRole('cell').closest('div')!
    expect(container.className).toContain('max-h-[300px]')
    expect(container.className).toContain('overflow-auto')
  })
})

describe('TableHead', () => {
  it('見出しが折り返さない', () => {
    renderTable()
    expect(screen.getByRole('columnheader').className).toContain('whitespace-nowrap')
  })

  it('呼び出し側の className で折り返しを戻せる', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-normal">長い見出し</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    )
    const head = screen.getByRole('columnheader').className
    expect(head).toContain('whitespace-normal')
    expect(head).not.toContain('whitespace-nowrap')
  })
})
