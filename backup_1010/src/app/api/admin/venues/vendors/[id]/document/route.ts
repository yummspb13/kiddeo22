import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdminOrDevKey } from '@/lib/admin-guard'

// GET /api/admin/venues/vendors/[id]/document - скачать документ ЕГРЮЛ
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrDevKey({})
    const { id } = await params
    const vendorId = id

    // Получаем информацию о вендоре
    const vendor = await prisma.venueVendor.findUnique({
      where: { vendorId: parseInt(vendorId) },
      select: {
        egryulDocument: true,
        fullName: true,
        vendor: {
          select: {
            displayName: true
          }
        }
      }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    if (!vendor.egryulDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // В реальном приложении здесь должна быть логика чтения файла из файловой системы
    // Пока возвращаем заглушку
    const fileName = `egryul_${(vendor as any).vendor.displayName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
    
    // Создаем заглушку PDF файла
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Документ ЕГРЮЛ) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`

    return new NextResponse(pdfContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error downloading document:', error)
    return NextResponse.json({ 
      error: 'Failed to download document',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
