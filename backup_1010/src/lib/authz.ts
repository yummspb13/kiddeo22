import { getServerSession } from './auth-server'
import { redirect } from 'next/navigation'

type Role = 'ADMIN' | 'MODERATOR' | 'VENDOR' | 'USER'

export async function requireRoles(roles: Role[]) {
  const session = await getServerSession()
  if (!session?.user) redirect('/auth/signin?callbackUrl=/admin')
  const role = session.user.role as Role || 'USER'
  if (!roles.includes(role)) redirect('/auth/forbidden')
  return session
}
