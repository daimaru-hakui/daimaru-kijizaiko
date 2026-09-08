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
import { NavLinks } from './nav-links'
import type { UserRoles } from './types'

export type { UserRoles }

type Props = {
  userName: string
  roles: UserRoles
  children: React.ReactNode
}

export function AppShell({ userName, roles, children }: Props) {
  const pathname = usePathname() ?? ''
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const signOut = async () => {
    await auth.signOut()
    await fetch('/api/session', { method: 'DELETE' })
    router.refresh()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 h-12 bg-white border-b border-slate-200 z-10 flex items-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 px-5">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="2xl:hidden px-1 aspect-square">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 pt-0 px-0">
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
                <Button variant="outline" size="sm" className="border-slate-200" aria-label="設定">
                  <Settings size={18} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-sm">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">トップページ</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>ログアウト</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Fixed desktop sidebar */}
      <aside className="hidden 2xl:block fixed top-12 left-0 bottom-0 w-60 bg-white border-r border-slate-200 overflow-y-auto z-10 pl-4">
        <NavLinks roles={roles} pathname={pathname} />
      </aside>

      {/* Main content */}
      <main className="pt-12 2xl:pl-60">{children}</main>
    </div>
  )
}
