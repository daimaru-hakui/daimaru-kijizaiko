export type UserClaims = {
  uid: string
  admin?: boolean
  rd?: boolean
  sales?: boolean
  accounting?: boolean
  tokushima?: boolean
  order?: boolean
}

type RouteRule =
  | { public: true }
  | { authenticated: true }
  | { roles: (keyof Omit<UserClaims, 'uid'>)[] }

const pathRoleMatrix: Array<{ pattern: RegExp; rule: RouteRule }> = [
  { pattern: /^\/_next\//, rule: { public: true } },
  { pattern: /^\/api\/session/, rule: { public: true } },
  { pattern: /^\/favicon\.ico$/, rule: { public: true } },
  { pattern: /^\/$/, rule: { public: true } },
  { pattern: /^\/login$/, rule: { public: true } },
  { pattern: /^\/dashboard/, rule: { authenticated: true } },
  { pattern: /^\/tokushima/, rule: { roles: ['tokushima', 'admin'] } },
  { pattern: /^\/settings\/auth/, rule: { roles: ['admin'] } },
  { pattern: /^\/settings/, rule: { roles: ['admin'] } },
  { pattern: /^\/accounting-dept/, rule: { roles: ['accounting', 'admin'] } },
  { pattern: /^\/gray-fabrics/, rule: { authenticated: true } },
  { pattern: /^\/products/, rule: { authenticated: true } },
  { pattern: /^\/schedules/, rule: { authenticated: true } },
  { pattern: /^\/serialnumbers/, rule: { roles: ['admin'] } },
  { pattern: /^\/adjustment/, rule: { authenticated: true } },
  { pattern: /^\/complete/, rule: { authenticated: true } },
]

export function matchRoute(pathname: string, user: UserClaims | null): boolean {
  const entry = pathRoleMatrix.find(({ pattern }) => pattern.test(pathname))

  if (!entry) return user !== null

  const { rule } = entry

  if ('public' in rule) return true
  if (user === null) return false
  if ('authenticated' in rule) return true
  return rule.roles.some((role) => !!user[role])
}
