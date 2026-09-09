export function canEditRecord(
  record: { createUser: string },
  userId: string,
  isPrivileged: boolean,
): boolean {
  return isPrivileged || record.createUser === userId
}

export function canEditAccountingRecord(
  record: { createUser: string; accounting?: boolean },
  userId: string,
  isPrivileged: boolean,
): boolean {
  return (isPrivileged || record.createUser === userId) && record.accounting !== true
}

/** 一覧の CSV は在庫や単価をまとめて持ち出せるため、R&D (と管理者) だけに許可する */
export function canDownloadCsv(roles: {
  rd: boolean
  admin: boolean
}): boolean {
  return roles.rd || roles.admin
}
