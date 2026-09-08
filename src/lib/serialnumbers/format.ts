export function formatSerialNumber(n: number): string {
  return ("0000000000" + String(n)).slice(-10);
}
