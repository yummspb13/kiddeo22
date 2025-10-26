// src/app/orders/page.tsx
import { getServerSession  } from "@/lib/auth-utils"
import OrderList from "@/components/orders/OrderList"

export default async function OrdersPage() {
  const session = await getServerSession()
  
  if (!session?.user?.id) {
    return <div>Необходима авторизация</div>
  }

  const userId = session.user.uid
  if (!userId) {
    return <div>Неверный ID пользователя</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <OrderList userId={userId} />
    </div>
  )
}
