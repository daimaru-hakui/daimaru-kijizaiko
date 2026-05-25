'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_SECTIONS } from './nav-config'
import type { UserRoles } from './types'

type Props = {
  roles: UserRoles
  pathname: string
  onClose?: () => void
}

function NavItemLink({
  title,
  href,
  pathname,
  onClose,
}: {
  title: string
  href: string
  pathname: string
  onClose?: () => void
}) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    onClose?.()
    router.push(href)
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'block px-0 py-1 rounded text-sm hover:bg-slate-100 transition-colors text-slate-700',
        pathname === href && 'bg-blue-50 text-blue-800 font-semibold'
      )}
    >
      {title}
    </Link>
  )
}

export function NavLinks({ roles, pathname, onClose }: Props) {
  const router = useRouter()

  const handleTopClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    onClose?.()
    router.push('/dashboard')
  }

  const visibleSections = NAV_SECTIONS.filter(
    (section) => !section.visible || section.visible(roles)
  )

  return (
    <nav className="overflow-auto h-full py-6 pr-0 space-y-3 px-3">
      <Link href="/dashboard" onClick={handleTopClick} className="block text-sm hover:underline">
        トップページ
      </Link>

      {visibleSections.map((section) => {
        const visibleItems = section.items.filter(
          (item) => !item.visible || item.visible(roles)
        )
        if (visibleItems.length === 0) return null

        return (
          <div key={section.title}>
            <hr className="-mx-3 mb-3" />
            <p className="text-xs font-bold mb-2 text-muted-foreground">{section.title}</p>
            <div className="pl-2 space-y-0.5">
              {visibleItems.map((item) => (
                <NavItemLink
                  key={item.href}
                  title={item.title}
                  href={item.href}
                  pathname={pathname}
                  onClose={onClose}
                />
              ))}
            </div>
          </div>
        )
      })}
    </nav>
  )
}
