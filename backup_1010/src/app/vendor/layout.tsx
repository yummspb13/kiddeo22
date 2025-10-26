import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/auth-server";
import { cookies } from "next/headers";

export default async function VendorLayout({ children }: { children: ReactNode }) {
  console.log('🔍 VENDOR LAYOUT: Starting layout check')
  
  // Получаем cookies для проверки сессии
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')
  
  let session = null
  if (sessionCookie) {
    try {
      console.log('🔍 VENDOR LAYOUT: Session cookie found, calling getServerSession...')
      
      // Создаем правильный NextRequest для getServerSession
      const mockRequest = {
        cookies: {
          get: (name: string) => cookieStore.get(name)
        }
      } as any
      
      session = await getServerSession(mockRequest)
      console.log('🔍 VENDOR LAYOUT: getServerSession result:', session)
    } catch (error) {
      console.log('🔍 VENDOR LAYOUT: getServerSession error:', error)
      session = null
    }
  } else {
    console.log('🔍 VENDOR LAYOUT: No session cookie found')
  }
  
  const uid = session?.user?.id;
  console.log('🔍 VENDOR LAYOUT: Session check result:', { hasSession: !!session, uid })

  if (!uid) {
    console.log('🔍 VENDOR LAYOUT: No session, redirecting to home with login modal')
    redirect("/?login=true");
  }

  // нужен связанный vendor
  const vendor = await prisma.vendor.findFirst({
    where: { userId: parseInt(uid) },
    select: { id: true, displayName: true },
  });

  if (!vendor) {
    redirect("/vendor/onboarding");
  }

  return (
    <div>
      {children}
    </div>
  );
}

