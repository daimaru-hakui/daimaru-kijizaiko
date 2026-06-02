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
