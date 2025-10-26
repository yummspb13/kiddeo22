import { NextRequest, NextResponse } from 'next/server'
import { requireAdminOrDevKey } from '@/lib/admin-guard'
import prisma from '@/lib/db'

// GET /api/admin/venues/vendors/[id] - получить вендора по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})
    const { id } = await params
    const vendorId = id

    const vendor = await prisma.venueVendor.findUnique({
      where: { id: parseInt(vendorId) },
      include: {
        vendor: {
          include: {
            city: true
          }
        },
        users: {
          include: {
            user: true
          }
        },
        documentsCheckedByUser: true
      }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    return NextResponse.json(vendor)
  } catch (error) {
    console.error('Error fetching vendor:', error)
    return NextResponse.json({ error: 'Failed to fetch vendor' }, { status: 500 })
  }
}

// PUT /api/admin/venues/vendors/[id] - обновить вендора
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})
    const { id } = await params
    const vendorId = id

    const body = await request.json()
    const { vendorId: newVendorId, type, ...otherData } = body

    const vendor = await prisma.venueVendor.update({
      where: { id: parseInt(vendorId) },
      data: {
        vendorId: newVendorId ? newVendorId : undefined,
        type,
        ...otherData
      },
      include: {
        vendor: {
          include: {
            city: true
          }
        },
        users: {
          include: {
            user: true
          }
        },
        documentsCheckedByUser: true
      }
    })

    return NextResponse.json(vendor)
  } catch (error) {
    console.error('Error updating vendor:', error)
    return NextResponse.json({ error: 'Failed to update vendor' }, { status: 500 })
  }
}

// PATCH /api/admin/venues/vendors/[id] - частично обновить вендора
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})
    const { id } = await params
    const vendorId = id

    // Проверяем Content-Type для определения типа данных
    const contentType = request.headers.get('content-type') || ''
    
    let updateData: unknown = {}
    
    if (contentType.includes('multipart/form-data')) {
      // Обрабатываем FormData
      const formData = await request.formData()
      
      // Обрабатываем текстовые поля
      const textFields = ['type', 'fullName', 'inn', 'orgnip', 'bankAccount', 'bik', 'address', 'vatRate', 'representativeName', 'representativePosition', 'companyName', 'kpp', 'orgn', 'legalAddress', 'actualAddress', 'directorName', 'directorPosition', 'selfEmployedInn']
      textFields.forEach(field => {
        const value = formData.get(field)
        if (value) {
          updateData[field] = value.toString()
        }
      })

      // Обрабатываем булевые поля
      const isVatPayer = formData.get('isVatPayer')
      if (isVatPayer !== null) {
        (updateData as any).isVatPayer = isVatPayer === 'true'
      }

      const isRepresentative = formData.get('isRepresentative')
      if (isRepresentative !== null) {
        (updateData as any).isRepresentative = isRepresentative === 'true'
      }

      // Обрабатываем загрузку файла ЕГРЮЛ
      const egryulDocument = formData.get('egryulDocument') as File
      if (egryulDocument && egryulDocument.size > 0) {
        // Сохраняем файл
        const timestamp = Date.now()
        const fileName = `egryul-${timestamp}-${egryulDocument.name || 'document'}`
        const filePath = `documents/${fileName}`
        
        // Здесь должна быть логика сохранения файла
        // Пока просто сохраняем имя файла
        (updateData as any).egryulDocument = filePath
      }
    } else {
      // Обрабатываем JSON
      updateData = await request.json()
    }

    // Тип уже в правильном формате

    // Сначала проверяем, существует ли базовый Vendor
    const baseVendor = await prisma.vendor.findUnique({
      where: { id: parseInt(vendorId) }
    })

    if (!baseVendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    // Проверяем, существует ли запись VenueVendor для этого vendorId
    let existingVendor = await prisma.venueVendor.findUnique({
      where: { vendorId: parseInt(vendorId) }
    })

    if (!existingVendor) {
      // Если записи нет, создаем ее
      existingVendor = await prisma.venueVendor.create({
        data: {
          vendorId: parseInt(vendorId),
          type: 'INDIVIDUAL_ENTREPRENEUR', // По умолчанию
          status: 'PENDING',
          documentsStatus: 'NONE',
          ...(updateData as any)
        }
      })
    } else {
      // Обновляем существующую запись
      existingVendor = await prisma.venueVendor.update({
        where: { id: existingVendor.id },
        data: updateData
      })
    }

    // Получаем полную информацию о вендоре
    const vendor = await prisma.venueVendor.findUnique({
      where: { id: existingVendor.id },
      include: {
        vendor: {
          include: {
            city: true
          }
        },
        users: {
          include: {
            user: true
          }
        },
        documentsCheckedByUser: true
      }
    })

    return NextResponse.json(vendor)
  } catch (error) {
    console.error('Error updating vendor:', error)
    return NextResponse.json({ 
      error: 'Failed to update vendor',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE /api/admin/venues/vendors/[id] - удалить вендора
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})
    const { id } = await params
    const vendorId = id

    await prisma.venueVendor.delete({
      where: { id: parseInt(vendorId) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json({ error: 'Failed to delete vendor' }, { status: 500 })
  }
}
