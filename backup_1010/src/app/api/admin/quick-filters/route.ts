// src/app/api/admin/quick-filters/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession  } from "@/lib/auth-utils"
import { 
  getQuickFilters, 
  createQuickFilter, 
  updateQuickFilter, 
  deleteQuickFilter, 
  toggleQuickFilterActive 
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

    const filters = await getQuickFilters()
    return NextResponse.json({ quickFilters: filters })
  } catch (error) {
    console.error('Error fetching quick filters:', error)
    return NextResponse.json({ error: 'Failed to fetch quick filters' }, { status: 500 })
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
    const filter = await createQuickFilter(data)
    return NextResponse.json(filter)
  } catch (error) {
    console.error('Error creating quick filter:', error)
    return NextResponse.json({ error: 'Failed to create quick filter' }, { status: 500 })
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
    const filter = await updateQuickFilter(id, data)
    return NextResponse.json(filter)
  } catch (error) {
    console.error('Error updating quick filter:', error)
    return NextResponse.json({ error: 'Failed to update quick filter' }, { status: 500 })
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

    await deleteQuickFilter(Number(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quick filter:', error)
    return NextResponse.json({ error: 'Failed to delete quick filter' }, { status: 500 })
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
    const filter = await toggleQuickFilterActive(id, isActive)
    return NextResponse.json(filter)
  } catch (error) {
    console.error('Error toggling quick filter:', error)
    return NextResponse.json({ error: 'Failed to toggle quick filter' }, { status: 500 })
  }
}
