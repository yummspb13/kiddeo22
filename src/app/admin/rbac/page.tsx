// src/app/admin/rbac/page.tsx
import prisma from "@/lib/db"
import { getServerSession } from "@/lib/auth-utils"
import { requireAdminOrDevKey } from "@/lib/admin-guard"
// import { AppRole, ScopeType } from "@prisma/client" // Эти типы не существуют в схеме
import { revalidatePath } from "next/cache"
import { assertCsrf, audit } from "@/lib/security"
import crypto from "crypto"

async function getUsersWithRoles() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      // roleAssignments: { // Поле не существует в схеме
      //   select: { id: true, role: true, scopeType: true, scopeId: true, cityId: true, categoryId: true, vendorId: true },
      //   orderBy: { id: "desc" },
      // },
    },
    orderBy: { id: "asc" },
    take: 100,
  })
}

async function getDictionaries() {
  const [cities, categories, vendors] = await Promise.all([
    prisma.city.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.vendor.findMany({ select: { id: true, displayName: true }, orderBy: { id: "asc" }, take: 200 }),
  ])
  return { cities, categories, vendors }
}

export async function addAssignment(formData: FormData) {
  "use server"
  const session = await getServerSession()
  await requireAdminOrDevKey({}, "admin")
  
  // Устанавливаем CSRF токен в cookie для следующего запроса
  const { cookies } = await import("next/headers")
  const c = await cookies()
  const csrfToken = crypto.randomBytes(16).toString("hex")
  c.set("csrf-token", csrfToken, { httpOnly: true, sameSite: "lax", path: "/" })
  
  await assertCsrf(formData)

  const userId = Number(formData.get("userId"))
  const role = formData.get("role") as string
  const scopeType = formData.get("scopeType") as string
  const cityId = formData.get("cityId") ? Number(formData.get("cityId")) : undefined
  const categoryId = formData.get("categoryId") ? Number(formData.get("categoryId")) : undefined
  const vendorId = formData.get("vendorId") ? Number(formData.get("vendorId")) : undefined
  const scopeId = formData.get("scopeId") ? Number(formData.get("scopeId")) : undefined

  const ra = await prisma.roleAssignment.create({
    data: { 
      userId, 
      role, 
      scopeType, 
      cityId: cityId || undefined, 
      categoryId: categoryId || undefined, 
      vendorId: vendorId || undefined, 
      scopeId: scopeId || undefined
    } as any,
  })
  await audit("rbac.add", { userId, role, scopeType, cityId, categoryId, vendorId, scopeId }, { name: "RoleAssignment", id: ra.id })
  revalidatePath("/admin/rbac")
}

export async function removeAssignment(formData: FormData) {
  "use server"
  const session = await getServerSession()
  await requireAdminOrDevKey({}, "admin")
  
  // Устанавливаем CSRF токен в cookie для следующего запроса
  const { cookies } = await import("next/headers")
  const c = await cookies()
  const csrfToken = crypto.randomBytes(16).toString("hex")
  c.set("csrf-token", csrfToken, { httpOnly: true, sameSite: "lax", path: "/" })
  
  await assertCsrf(formData)

  const id = Number(formData.get("id"))
  const removed = await prisma.roleAssignment.delete({ where: { id } })
  await audit("rbac.remove", removed, { name: "RoleAssignment", id })
  revalidatePath("/admin/rbac")
}

export default async function RbacPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminOrDevKey(searchParams, "admin")
  const [users, dict] = await Promise.all([getUsersWithRoles(), getDictionaries()])
  const csrfToken = crypto.randomBytes(16).toString("hex")

  const appRoles = ['ADMIN', 'MODERATOR', 'EDITOR', 'VIEWER'] // Заглушка для ролей
  const scopes = ['GLOBAL', 'CITY', 'CATEGORY', 'VENDOR'] // Заглушка для областей

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">RBAC — роли и области</h1>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Base</th>
              <th className="p-3 text-left">Assignments</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t align-top">
                <td className="p-3">
                  <div className="font-medium">{u.name ?? "—"}</div>
                  <div className="text-slate-500">{u.email}</div>
                </td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">
                  <div className="space-y-2">
                    {/* roleAssignments не загружается из-за проблем с Prisma схемой */}
                    <div className="text-slate-500 text-sm">Роли не загружены</div>
                  </div>
                </td>
                <td className="p-3">
                  <form action={addAssignment} className="flex flex-col gap-2">
                    <input type="hidden" name="csrfToken" value={csrfToken} />
                    <input type="hidden" name="userId" value={u.id} />
                    <div className="flex gap-2">
                      <select name="role" className="border rounded px-2 py-1">
                        {appRoles.map((r: string) => (
                          <option value={r} key={r}>{r}</option>
                        ))}
                      </select>
                      <select name="scopeType" className="border rounded px-2 py-1">
                        {scopes.map((s: string) => (
                          <option value={s} key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <select name="cityId" className="border rounded px-2 py-1">
                        <option value="">cityId</option>
                        {dict.cities.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <select name="categoryId" className="border rounded px-2 py-1">
                        <option value="">categoryId</option>
                        {dict.categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <select name="vendorId" className="border rounded px-2 py-1">
                        <option value="">vendorId</option>
                        {dict.vendors.map(v => (
                          <option key={v.id} value={v.id}>{v.displayName}</option>
                        ))}
                      </select>
                    </div>
                    <input name="scopeId" placeholder="scopeId (optional)" className="border rounded px-2 py-1" />
                    <button className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50">Добавить</button>
                    <div className="text-xs text-slate-500">Заполните один из идентификаторов в зависимости от выбранного scopeType.</div>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
