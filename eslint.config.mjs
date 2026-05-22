import nextConfig from 'eslint-config-next/core-web-vitals'

export default [
  ...nextConfig,
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    rules: {
      // Phase 4 (shadcn/ui 移行) で既存コードを整理するまで warn に下げる
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
]
