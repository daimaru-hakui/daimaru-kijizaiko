'use client'

import { createContext, useContext } from 'react'
import type { UserRoles } from './types'

/** プロバイダの外では権限なしとして扱い、権限付きの UI を出さない */
const NO_ROLES: UserRoles = {
  admin: false,
  rd: false,
  tokushima: false,
  accounting: false,
  sales: false,
}

const UserRolesContext = createContext<UserRoles>(NO_ROLES)

export function UserRolesProvider({
  roles,
  children,
}: {
  roles: UserRoles
  children: React.ReactNode
}) {
  return (
    <UserRolesContext.Provider value={roles}>
      {children}
    </UserRolesContext.Provider>
  )
}

/** ログイン中のユーザーの権限。一覧ごとに props で配らずに済むよう context で配る */
export function useUserRoles(): UserRoles {
  return useContext(UserRolesContext)
}
