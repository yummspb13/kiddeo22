import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
export const runtime = 'nodejs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    console.log('🔍 ADMIN CITIES API: Fetching all cities...')
    
    const allCities = await prisma.city.findMany({
      select: { id: true, name: true, slug: true, isPublic: true },
    })
    
    console.log('🔍 ADMIN CITIES API: Found cities:', allCities.length)
    
    // Сортируем: сначала публичные, потом по алфавиту
    const cities = allCities.sort((a, b) => {
      // Сначала публичные города
      if (a.isPublic && !b.isPublic) return -1;
      if (!a.isPublic && b.isPublic) return 1;
      
      // Потом по алфавиту
      return a.name.localeCompare(b.name);
    })
    
    console.log('🔍 ADMIN CITIES API: Returning sorted cities:', cities.length)
    
    return NextResponse.json({ cities })
  } catch (error) {
    console.error('🔍 ADMIN CITIES API: Error fetching cities:', error)
    return NextResponse.json({ cities: [] })
  }
}
