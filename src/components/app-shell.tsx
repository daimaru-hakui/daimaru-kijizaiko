'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase/client'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Menu, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export type UserRoles = {
  admin: boolean
  rd: boolean
  tokushima: boolean
  accounting: boolean
  sales: boolean
}

type Props = {
  userName: string
  roles: UserRoles
  children: React.ReactNode
}

function NavLinks({
  roles,
  pathname,
  onClose,
}: {
  roles: UserRoles
  pathname: string
  onClose?: () => void
}) {
  const item = (title: string, href: string) => (
    <Link
      key={href}
      href={href}
      onClick={onClose}
      className={cn(
        'block px-2 py-1 rounded text-sm hover:bg-slate-100 transition-colors text-slate-700',
        pathname === href && 'bg-blue-50 text-blue-800 font-semibold'
      )}
    >
      {title}
    </Link>
  )

  return (
    <nav className="overflow-auto h-full py-6 pr-6 space-y-3">
      <Link
        href="/dashboard"
        onClick={onClose}
        className="block text-sm hover:underline"
      >
        トップページ
      </Link>

      <hr />

      <div>
        <p className="text-xs font-bold mb-2 text-muted-foreground">生地</p>
        <div className="pl-2 space-y-0.5">
          {item('生地一覧', '/products')}
          {item('染色仕掛一覧', '/products/fabric-dyeing/orders')}
          {item('染色履歴一覧', '/products/fabric-dyeing/confirms')}
          {item('入荷予定一覧', '/products/fabric-purchase/orders')}
          {item('入荷履歴一覧', '/products/fabric-purchase/confirms')}
          {item('マスター登録', '/products/new')}
        </div>
      </div>

      {(roles.rd || roles.sales) && (
        <>
          <hr />
          <div>
            <p className="text-xs font-bold mb-2 text-muted-foreground">キバタ</p>
            <div className="pl-2 space-y-0.5">
              {item('キバタ一覧', '/gray-fabrics')}
              {item('キバタ仕掛一覧', '/gray-fabrics/orders')}
              {item('キバタ仕掛履歴', '/gray-fabrics/confirms')}
              {roles.rd && item('マスター登録', '/gray-fabrics/new')}
            </div>
          </div>
        </>
      )}

      <hr />

      <div>
        <p className="text-xs font-bold mb-2 text-muted-foreground">徳島工場</p>
        <div className="pl-2 space-y-0.5">
          {(roles.tokushima || roles.rd) &&
            item('入荷予定一覧', '/tokushima/fabric-purchase/orders')}
          {(roles.tokushima || roles.rd) &&
            item('入荷履歴一覧', '/tokushima/fabric-purchase/confirms')}
          {item('裁断生地一覧', '/tokushima/cutting-reports/history')}
          {item('裁断報告書一覧', '/tokushima/cutting-reports')}
          {(roles.tokushima || roles.rd) &&
            item('裁断報告書作成', '/tokushima/cutting-reports/new')}
          {item('使用予定一覧', '/schedules')}
        </div>
      </div>

      {roles.accounting && (
        <>
          <hr />
          <div>
            <p className="text-xs font-bold mb-2 text-muted-foreground">経理</p>
            <div className="pl-2 space-y-0.5">
              {item('金額確認', '/accounting-dept/orders')}
              {item('処理済み', '/accounting-dept/confirms')}
            </div>
          </div>
        </>
      )}

      {(roles.rd || roles.tokushima) && (
        <>
          <hr />
          <div>
            <p className="text-xs font-bold mb-2 text-muted-foreground">調整</p>
            <div className="pl-2 space-y-0.5">
              {item('生地在庫調整', '/adjustment/products')}
              {roles.rd && item('キバタ在庫調整', '/adjustment/gray-fabrics')}
            </div>
          </div>
        </>
      )}

      {roles.rd && (
        <>
          <hr />
          <div>
            <p className="text-xs font-bold mb-2 text-muted-foreground">設定</p>
            <div className="pl-2 space-y-0.5">
              {item('仕入先', '/settings/suppliers')}
              {item('送り先', '/settings/stock-places')}
              {item('組織名', '/settings/material-names')}
              {item('色', '/settings/colors')}
              {item('保管場所', '/settings/locations')}
            </div>
          </div>
        </>
      )}

      {roles.admin && (
        <>
          <hr />
          <div>
            <p className="text-xs font-bold mb-2 text-muted-foreground">権限</p>
            <div className="pl-2 space-y-0.5">
              {item('権限', '/settings/auth')}
              {item('伝票NO.管理', '/serialnumbers')}
            </div>
          </div>
        </>
      )}
    </nav>
  )
}

export function AppShell({ userName, roles, children }: Props) {
  const pathname = usePathname() ?? ''
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const signOut = async () => {
    await auth.signOut()
    await fetch('/api/session', { method: 'DELETE' })
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 h-12 bg-white border-b border-slate-200 z-10 flex items-center px-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="2xl:hidden px-1">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 pt-0">
                <SheetTitle className="sr-only">メインメニュー</SheetTitle>
                <SheetDescription className="sr-only">
                  アプリ全体のナビゲーションメニュー
                </SheetDescription>
                <NavLinks
                  roles={roles}
                  pathname={pathname}
                  onClose={() => setOpen(false)}
                />
              </SheetContent>
            </Sheet>
            <Link href="/dashboard" className="text-base font-bold text-blue-900 tracking-tight">
              生地在庫WEB
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden 2xl:block">{userName}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-200">
                  <Settings size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-sm">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">トップページ</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden 2xl:block w-60 min-h-screen bg-white border-r border-slate-200 sticky top-0 flex-shrink-0 pl-4 pt-12">
          <NavLinks roles={roles} pathname={pathname} />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
