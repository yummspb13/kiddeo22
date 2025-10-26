// src/lib/rbac.ts
import { redirect } from "next/navigation"
import type { Session } from "./auth-server"
import { AppRole, ScopeType } from "@prisma/client"

export type RoleAssignmentDto = {
  id?: number
  userId?: number
  role: AppRole
  scopeType: ScopeType
  scopeId?: number | null
  cityId?: number | null
  categoryId?: number | null
  vendorId?: number | null
}

export function getUserRoles(session: Session | null | undefined): RoleAssignmentDto[] {
  const roles = (session?.user as any)?.roles as RoleAssignmentDto[] | undefined
  return Array.isArray(roles) ? roles : []
}

export function hasGlobalRole(session: Session | null | undefined, roles: AppRole | AppRole[]): boolean {
  const list = Array.isArray(roles) ? roles : [roles]
  return getUserRoles(session).some(r => r.scopeType === ScopeType.GLOBAL && list.includes(r.role))
}

export function hasScopedRole(
  session: Session | null | undefined,
  role: AppRole,
  scope: { type: "CITY"; id: number } | { type: "CATEGORY"; id: number } | { type: "VENDOR"; id: number },
): boolean {
  const roles = getUserRoles(session)
  if (scope.type === "CITY") return roles.some(r => r.role === role && r.scopeType === "CITY" && (r.cityId === scope.id || r.scopeId === scope.id))
  if (scope.type === "CATEGORY") return roles.some(r => r.role === role && r.scopeType === "CATEGORY" && (r.categoryId === scope.id || r.scopeId === scope.id))
  if (scope.type === "VENDOR") return roles.some(r => r.role === role && r.scopeType === "VENDOR" && (r.vendorId === scope.id || r.scopeId === scope.id))
  return false
}

export function requireAnyRole(session: Session | null | undefined, roles: AppRole | AppRole[]) {
  if (hasGlobalRole(session, roles)) return
  redirect("/auth/forbidden")
}

export function requireRoleOrScope(
  session: Session | null | undefined,
  opts: { global?: AppRole | AppRole[]; scoped?: { role: AppRole; scope: { type: ScopeType; id: number } } },
) {
  if (opts.global && hasGlobalRole(session, opts.global)) return
  if (opts.scoped && hasScopedRole(session, opts.scoped.role, opts.scoped.scope as any)) return
  redirect("/auth/forbidden")
}
