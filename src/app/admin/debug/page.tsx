// src/app/admin/debug/page.tsx
export const dynamic = 'force-dynamic'

export default async function AdminDebug({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const supplied = typeof sp.key === 'string' ? sp.key : Array.isArray(sp.key) ? sp.key[0] : undefined
  const k1 = (process.env.ADMIN_DEV_KEY ?? '').trim()
  const k2 = (process.env.ADMIN_KEY ?? '').trim()
  const isDev = process.env.NODE_ENV !== 'production'

  return (
    <pre style={{ padding: 16, background: '#fafafa', border: '1px solid #eee' }}>
{JSON.stringify({
  supplied,
  env: { ADMIN_DEV_KEY_len: k1.length, ADMIN_KEY_len: k2.length },
  isDev,
}, null, 2)}
    </pre>
  )
}
