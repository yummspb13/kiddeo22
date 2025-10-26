// src/app/api/admin/ad-placements/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession  } from "@/lib/auth-utils"
import { 
  getAdPlacements, 
  createAdPlacement, 
  updateAdPlacement, 
  deleteAdPlacement, 
  toggleAdPlacementActive 
} from "@/lib/afisha-admin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('key')
    
    // Проверка админ-ключа
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_DEV_KEY) {
      // Fallback to NextAuth
      const session = await getServerSession()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const placements = await getAdPlacements()
    return NextResponse.json(placements)
  } catch (error) {
    console.error('Error fetching ad placements:', error)
    return NextResponse.json({ error: 'Failed to fetch ad placements' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('key')
    
    // Проверка админ-ключа
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_DEV_KEY) {
      // Fallback to NextAuth
      const session = await getServerSession()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const data = await request.json()
    const placement = await createAdPlacement(data)
    return NextResponse.json(placement)
  } catch (error) {
    console.error('Error creating ad placement:', error)
    return NextResponse.json({ error: 'Failed to create ad placement' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('key')
    
    // Проверка админ-ключа
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_DEV_KEY) {
      // Fallback to NextAuth
      const session = await getServerSession()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { id, ...data } = await request.json()
    const placement = await updateAdPlacement(id, data)
    return NextResponse.json(placement)
  } catch (error) {
    console.error('Error updating ad placement:', error)
    return NextResponse.json({ error: 'Failed to update ad placement' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('key')
    
    // Проверка админ-ключа
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_DEV_KEY) {
      // Fallback to NextAuth
      const session = await getServerSession()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await deleteAdPlacement(Number(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting ad placement:', error)
    return NextResponse.json({ error: 'Failed to delete ad placement' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('key')
    
    // Проверка админ-ключа
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_DEV_KEY) {
      // Fallback to NextAuth
      const session = await getServerSession()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const { id, isActive } = await request.json()
    const placement = await toggleAdPlacementActive(id, isActive)
    return NextResponse.json(placement)
  } catch (error) {
    console.error('Error toggling ad placement:', error)
    return NextResponse.json({ error: 'Failed to toggle ad placement' }, { status: 500 })
  }
}
