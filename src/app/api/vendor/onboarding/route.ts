// src/app/api/vendor/onboarding/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession  } from "@/lib/auth-utils"
import prisma from "@/lib/db"
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ vendor: null })
    }

    // Проверяем, является ли пользователь вендором
    const vendor = await prisma.vendor.findUnique({
      where: { userId: parseInt(session.user.id) }, // Используем id и конвертируем в число
      select: {
        id: true,
        displayName: true,
        canPostEvents: true,
        canPostCatalog: true
      }
    })

    return NextResponse.json({ 
      vendor: vendor || null
    })

  } catch (error) {
    console.error("Error checking vendor status:", error)
    return NextResponse.json({ vendor: null })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      displayName, 
      cityId, 
      description, 
      phone, 
      email, 
      address, 
      website,
      supportEmail,
      supportPhone,
      brandSlug,
      proofType,
      proofData,
      agreements
    } = body

    // Проверяем, что пользователь еще не является вендором
    const existingVendor = await prisma.vendor.findUnique({
      where: { userId: parseInt(session.user.id) }
    })

    if (existingVendor) {
      return NextResponse.json({ error: "Vendor already exists" }, { status: 400 })
    }

    // Создаем вендора
    const vendor = await prisma.vendor.create({
      data: {
        userId: parseInt(session.user.id),
        displayName,
        cityId: parseInt(cityId),
        description,
        phone,
        email,
        address,
        website,
        supportEmail,
        supportPhone,
        brandSlug,
        proofType,
        proofData,
        agreements,
        canPostEvents: true,
        canPostCatalog: true,
        kycStatus: 'SUBMITTED' // Устанавливаем статус для модерации
      }
    })

    // Создаем запись онбординга
    await prisma.vendorOnboarding.create({
      data: {
        vendorId: vendor.id,
        step: 1,
        completedSteps: [] as any,
        isCompleted: false,
        updatedAt: new Date()
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

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      displayName, 
      cityId, 
      description, 
      phone, 
      email, 
      address, 
      website,
      agreements
    } = body

    console.log('🔍 VENDOR ONBOARDING PUT: Updating vendor with data:', {
      displayName,
      cityId,
      description,
      phone,
      email,
      address,
      website,
      agreements
    })

    // Находим существующего вендора
    const existingVendor = await prisma.vendor.findUnique({
      where: { userId: parseInt(session.user.id) }
    })

    if (!existingVendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
    }

    // Обновляем вендора
    const vendor = await prisma.vendor.update({
      where: { id: existingVendor.id },
      data: {
        displayName,
        cityId: parseInt(cityId),
        description,
        phone,
        email,
        address,
        website,
        agreements: agreements || null
      }
    })

    // Обновляем или создаем запись онбординга
    const existingOnboarding = await prisma.vendorOnboarding.findUnique({
      where: { vendorId: vendor.id }
    })

    if (existingOnboarding) {
      // Обновляем существующую запись
      await prisma.vendorOnboarding.update({
        where: { vendorId: vendor.id },
        data: {
          step: 4, // Завершаем онбординг
          completedSteps: [1, 2, 3, 4],
          isCompleted: true,
          completedAt: new Date(),
          updatedAt: new Date()
        }
      })
    } else {
      // Создаем новую запись
      await prisma.vendorOnboarding.create({
        data: {
          vendorId: vendor.id,
          step: 4, // Завершаем онбординг
          completedSteps: [1, 2, 3, 4],
          isCompleted: true,
          completedAt: new Date(),
          updatedAt: new Date()
        }
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
    console.error("Error updating vendor:", error)
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { error: "Failed to update vendor", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
