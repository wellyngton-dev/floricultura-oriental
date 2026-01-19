export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export function verificarAuth(password: string): boolean {
  return password === ADMIN_PASSWORD
}
