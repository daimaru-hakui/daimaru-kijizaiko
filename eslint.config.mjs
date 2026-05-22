import nextConfig from 'eslint-config-next/core-web-vitals'

export default [
  ...nextConfig,
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      // react-hook-form の watch() は React Compiler と非互換だが動作上の問題なし
      'react-hooks/incompatible-library': 'off',
    },
  },
]
