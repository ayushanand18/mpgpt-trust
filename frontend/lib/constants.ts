export const ROLES = {
  SUPERUSER: 'superuser',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]
