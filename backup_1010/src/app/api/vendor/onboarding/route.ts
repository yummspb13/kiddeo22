// src/app/api/vendor/onboarding/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession  } from "@/lib/auth-utils"
import prisma from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { displayName, cityId, description, phone, email, address, website } = body

    // Проверяем, что пользователь еще не является вендором
    const existingVendor = await prisma.vendor.findUnique({
      where: { userId: session.user.uid }
    })

    if (existingVendor) {
      return NextResponse.json({ error: "Vendor already exists" }, { status: 400 })
    }

    // Создаем вендора
    const vendor = await prisma.vendor.create({
      data: {
        userId: session.user.uid,
        displayName,
        cityId: parseInt(cityId),
        description,
        phone,
        email,
        address,
        website,
        canPostEvents: true,
        canPostCatalog: true
      }
    })

    // Создаем запись онбординга
    await prisma.vendorOnboarding.create({
      data: {
        vendorId: vendor.id,
        step: 1,
        completedSteps: [] as any,
        isCompleted: false
      } as any
    })

    // Создаем бесплатную подписку
    const freePlan = await prisma.vendorTariffPlan.findFirst({
      where: { tariff: 'FREE' }
    })

    if (freePlan) {
      await prisma.vendorSubscription.create({
        data: {
          vendorId: vendor.id,
          tariffPlanId: freePlan.id,
          status: 'PAID',
          startsAt: new Date(),
          autoRenew: true
        } as any
      })
    }

    return NextResponse.json({ 
      success: true, 
      vendor: {
        id: vendor.id,
        displayName: vendor.displayName
      }
    })

  } catch (error) {
    console.error("Error creating vendor:", error)
    return NextResponse.json(
      { error: "Failed to create vendor" },
      { status: 500 }
    )
  }
}
