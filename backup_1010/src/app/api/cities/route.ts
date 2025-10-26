// src/app/api/cities/route.ts
import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET() {
  try {
    const allCities = await prisma.city.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      }
    })
    
    // Сортируем: сначала Москва и СПб, потом остальные по алфавиту
    const cities = allCities.sort((a, b) => {
      if (a.slug === 'moskva') return -1;
      if (b.slug === 'moskva') return 1;
      if (a.slug === 'sankt-peterburg') return -1;
      if (b.slug === 'sankt-peterburg') return 1;
      return a.name.localeCompare(b.name);
    })

    return NextResponse.json(cities)
  } catch (error) {
    console.error('Error fetching cities:', error)
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 })
  }
}
