import { getServerSession  } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"

export default async function DebugSessionPage() {
  const session = await getServerSession()
  
  // Получаем пользователя из базы
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id }
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Session</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Session:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">User from DB:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Vendor check:</h2>
          {user && (
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(
                await prisma.vendor.findUnique({
                  where: { userId: user.id }
                }), 
                null, 
                2
              )}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
