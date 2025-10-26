// src/app/vendor/orders/page.tsx
import { getServerSession  } from "@/lib/auth-utils"
import { requireVendorAccess } from "@/lib/vendor-guard"
import VendorOrderList from "@/components/vendor/VendorOrderList"

export default async function VendorOrdersPage() {
  const session = await getServerSession()
  
  if (!session?.user?.id) {
    return <div>Необходима авторизация</div>
  }

  // Проверяем доступ вендора
  const userId = session.user.uid
  if (!userId) {
    return <div>Неверный ID пользователя</div>
  }

  const vendorAccess = await requireVendorAccess(userId)
  if (!vendorAccess) {
    return <div>Доступ запрещен. Требуются права вендора.</div>
  }

  return <VendorOrderList vendorId={vendorAccess.id} />
}
