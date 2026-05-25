import type { UserRoles } from './types'

export type NavItem = {
  title: string
  href: string
  /** undefined = 常に表示 */
  visible?: (roles: UserRoles) => boolean
}

export type NavSection = {
  title: string
  visible?: (roles: UserRoles) => boolean
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: '生地',
    items: [
      { title: '生地一覧', href: '/products' },
      { title: '染色仕掛一覧', href: '/products/fabric-dyeing/orders' },
      { title: '染色履歴一覧', href: '/products/fabric-dyeing/confirms' },
      { title: '入荷予定一覧', href: '/products/fabric-purchase/orders' },
      { title: '入荷履歴一覧', href: '/products/fabric-purchase/confirms' },
      { title: 'マスター登録', href: '/products/new' },
    ],
  },
  {
    title: 'キバタ',
    visible: (roles) => roles.rd || roles.sales,
    items: [
      { title: 'キバタ一覧', href: '/gray-fabrics' },
      { title: 'キバタ仕掛一覧', href: '/gray-fabrics/orders' },
      { title: 'キバタ仕掛履歴', href: '/gray-fabrics/confirms' },
      { title: 'マスター登録', href: '/gray-fabrics/new', visible: (roles) => roles.rd },
    ],
  },
  {
    title: '徳島工場',
    items: [
      {
        title: '入荷予定一覧',
        href: '/tokushima/fabric-purchase/orders',
        visible: (roles) => roles.tokushima || roles.rd,
      },
      {
        title: '入荷履歴一覧',
        href: '/tokushima/fabric-purchase/confirms',
        visible: (roles) => roles.tokushima || roles.rd,
      },
      { title: '裁断生地一覧', href: '/tokushima/cutting-reports/history' },
      { title: '裁断報告書一覧', href: '/tokushima/cutting-reports' },
      {
        title: '裁断報告書作成',
        href: '/tokushima/cutting-reports/new',
        visible: (roles) => roles.tokushima || roles.rd,
      },
      { title: '使用予定一覧', href: '/schedules' },
    ],
  },
  {
    title: '経理',
    visible: (roles) => roles.accounting,
    items: [
      { title: '金額確認', href: '/accounting-dept/orders' },
      { title: '処理済み', href: '/accounting-dept/confirms' },
    ],
  },
  {
    title: '調整',
    visible: (roles) => roles.rd || roles.tokushima,
    items: [
      { title: '生地在庫調整', href: '/adjustment/products' },
      { title: 'キバタ在庫調整', href: '/adjustment/gray-fabrics', visible: (roles) => roles.rd },
    ],
  },
  {
    title: '設定',
    visible: (roles) => roles.rd,
    items: [
      { title: '仕入先', href: '/settings/suppliers' },
      { title: '送り先', href: '/settings/stock-places' },
      { title: '組織名', href: '/settings/material-names' },
      { title: '色', href: '/settings/colors' },
      { title: '保管場所', href: '/settings/locations' },
    ],
  },
  {
    title: '権限',
    visible: (roles) => roles.admin,
    items: [
      { title: '権限', href: '/settings/auth' },
      { title: '伝票NO.管理', href: '/serialnumbers' },
    ],
  },
]
