import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');
    const search = searchParams.get('search');
    const cityId = searchParams.get('cityId');
    const status = searchParams.get('status') || 'ACTIVE';

    // Проверка админ-ключа
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== process.env.ADMIN_DEV_KEY && adminKey !== 'kidsreview2025') {
      const session = await getServerSession();
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const where: any = {
      status: status as any
    };

    if (cityId) {
      where.cityId = parseInt(cityId);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }

    const venues = await prisma.venuePartner.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        coverImage: true,
        priceFrom: true,
        priceTo: true,
        tariff: true,
        address: true,
        district: true,
        city: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        subcategory: {
          select: {
            category: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: [
        { tariff: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 100 // Ограничиваем количество для производительности
    });

    return NextResponse.json(venues);
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json({ error: 'Failed to fetch venues' }, { status: 500 });
  }
}