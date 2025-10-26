import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

// GET - получить все рекламные слоты
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    
    // Строим условие для фильтрации
    const whereClause: any = {}
    if (city) {
      whereClause.city = city
    }
    
    const heroSlots = await prisma.heroSlot.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    // Проверяем и обновляем статус слотов на основе времени
    const now = new Date()
    const updatedSlots = []

    console.log('🔍 Hero slots time check:', {
      currentTime: now.toISOString(),
      slotsCount: heroSlots.length
    })

    for (const slot of heroSlots) {
      const startDate = new Date(slot.startDate)
      const endDate = new Date(slot.endDate)
      
      console.log('🔍 Checking slot:', {
        id: slot.id,
        city: slot.city,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        currentTime: now.toISOString(),
        isActive: slot.isActive,
        isExpired: now > endDate,
        isNotStarted: now < startDate
      })
      
      // Если время еще не началось - деактивируем
      if (now < startDate) {
        if (slot.isActive) {
          console.log('⏰ Slot not started yet, deactivating:', slot.id)
          await prisma.heroSlot.update({
            where: { id: slot.id },
            data: { isActive: false }
          })
          updatedSlots.push({ ...slot, isActive: false })
        } else {
          updatedSlots.push(slot)
        }
      }
      // Если время истекло - деактивируем
      else if (now > endDate) {
        if (slot.isActive) {
          console.log('⏰ Slot expired, deactivating:', slot.id)
          await prisma.heroSlot.update({
            where: { id: slot.id },
            data: { isActive: false }
          })
          updatedSlots.push({ ...slot, isActive: false })
        } else {
          updatedSlots.push(slot)
        }
      }
      // Если время активное - активируем
      else {
        if (!slot.isActive) {
          console.log('⏰ Slot should be active, activating:', slot.id)
          await prisma.heroSlot.update({
            where: { id: slot.id },
            data: { isActive: true }
          })
          updatedSlots.push({ ...slot, isActive: true })
        } else {
          updatedSlots.push(slot)
        }
      }
    }

    return NextResponse.json(updatedSlots)

  } catch (error) {
    console.error('Error fetching hero slots:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - создать новый рекламный слот
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { city, eventIds, startDate, endDate, rotationFrequency, isActive } = body

    if (!city || !eventIds || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Проверяем, нужно ли сериализовать eventIds
    let eventIdsString: string
    if (typeof eventIds === 'string') {
      eventIdsString = eventIds
    } else {
      eventIdsString = JSON.stringify(eventIds)
    }

    const heroSlot = await prisma.heroSlot.create({
      data: {
        city,
        eventIds: eventIdsString,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rotationFrequency: rotationFrequency || 1,
        isActive: isActive !== false
      }
    })

    return NextResponse.json(heroSlot, { status: 201 })

  } catch (error) {
    console.error('Error creating hero slot:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
