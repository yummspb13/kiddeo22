import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from '@/lib/auth-server'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const venueId = parseInt(id)
    
    if (isNaN(venueId)) {
      return NextResponse.json({ error: 'Invalid venue ID' }, { status: 400 })
    }

    // Получаем особенности из параметров места
    const venue = await prisma.venuePartner.findUnique({
      where: { id: venueId },
      select: {
        id: true,
        parameters: {
          where: {
            parameter: {
              name: 'FEATURES_JSON'
            }
          },
          select: {
            value: true
          }
        }
      }
    })

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    // Парсим JSON особенности
    let features = []
    if (venue.parameters.length > 0) {
      try {
        features = JSON.parse(venue.parameters[0].value)
      } catch (error) {
        console.error('Error parsing features JSON:', error)
        features = []
      }
    }

    return NextResponse.json({ features })
  } catch (error) {
    console.error('Error fetching features:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(request)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const venueId = parseInt(id)
    
    if (isNaN(venueId)) {
      return NextResponse.json({ error: 'Invalid venue ID' }, { status: 400 })
    }

    const { features } = await request.json()

    // Проверяем, что пользователь является владельцем места
    const venue = await prisma.venuePartner.findFirst({
      where: {
        id: venueId,
        vendor: {
          userId: parseInt(session.user.id)
        }
      }
    })

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found or access denied' }, { status: 404 })
    }

    // Находим или создаем параметр FEATURES_JSON
    const parameter = await prisma.venueParameter.findFirst({
      where: { name: 'FEATURES_JSON' }
    })

    if (!parameter) {
      return NextResponse.json({ error: 'Features parameter not found' }, { status: 500 })
    }

    // Обновляем или создаем значение параметра
    await prisma.venuePartnerParameter.upsert({
      where: {
        partnerId_parameterId: {
          partnerId: venueId,
          parameterId: parameter.id
        }
      },
      update: {
        value: JSON.stringify(features)
      },
      create: {
        partnerId: venueId,
        parameterId: parameter.id,
        value: JSON.stringify(features)
      }
    })

    return NextResponse.json({ success: true, features })
  } catch (error) {
    console.error('Error saving features:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}