import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/db'
export const runtime = 'nodejs'

// POST /api/vendors/upgrade - апгрейд до Vendor Pro
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      role, // 'NPD' | 'IE' | 'LEGAL'
      // Данные для НПД
      fullName,
      inn,
      selfEmployedInn,
      npdToken,
      npdRegion,
      // Данные для ИП
      orgnip,
      bankAccount,
      bik,
      bankName,
      corrAccount,
      address,
      isVatPayer,
      vatRate,
      taxRegime,
      // Данные для ЮЛ
      companyName,
      kpp,
      orgn,
      legalAddress,
      actualAddress,
      directorName,
      directorPosition,
      representativeName,
      representativePosition,
      isRepresentative
    } = body

    // Валидация обязательных полей
    if (!role || !['NPD', 'IE', 'LEGAL'].includes(role)) {
      return NextResponse.json({ 
        error: 'Обязательные поля: role (NPD, IE, LEGAL)' 
      }, { status: 400 })
    }

    // Получаем вендора
    const vendor = await prisma.vendor.findUnique({
      where: { userId: parseInt(session.user.id) },
      include: { vendorRole: true }
    })

    if (!vendor) {
      return NextResponse.json({ 
        error: 'Vendor not found' 
      }, { status: 404 })
    }

    if (vendor.type === 'PRO') {
      return NextResponse.json({ 
        error: 'Vendor is already PRO' 
      }, { status: 400 })
    }

    // Валидация полей в зависимости от роли
    if (role === 'NPD') {
      if (!fullName || !inn || !selfEmployedInn) {
        return NextResponse.json({ 
          error: 'Для НПД обязательны: fullName, inn, selfEmployedInn' 
        }, { status: 400 })
      }
    }

    if (role === 'IE') {
      if (!fullName || !inn || !orgnip || !bankAccount || !bik) {
        return NextResponse.json({ 
          error: 'Для ИП обязательны: fullName, inn, orgnip, bankAccount, bik' 
        }, { status: 400 })
      }
    }

    if (role === 'LEGAL') {
      if (!companyName || !inn || !kpp || !orgn || !bankAccount || !bik) {
        return NextResponse.json({ 
          error: 'Для ЮЛ обязательны: companyName, inn, kpp, orgn, bankAccount, bik' 
        }, { status: 400 })
      }
    }

    // Обновляем вендора до PRO
    const updatedVendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        type: 'PRO',
        kycStatus: 'SUBMITTED' // Отправляем на модерацию
      }
    })

    // Обновляем или создаем роль вендора
    if (vendor.vendorRole) {
      await prisma.vendorRole.update({
        where: { vendorId: vendor.id },
        data: {
          role,
          fullName,
          inn,
          orgnip,
          orgn,
          kpp,
          bankAccount,
          bik,
          bankName,
          corrAccount,
          address,
          legalAddress,
          actualAddress,
          isVatPayer: isVatPayer || false,
          vatRate: vatRate ? parseInt(vatRate) : null,
          representativeName,
          representativePosition,
          isRepresentative: isRepresentative || false,
          companyName,
          directorName,
          directorPosition,
          selfEmployedInn,
          taxRegime: taxRegime || 'NPD',
          npdToken,
          npdRegion
        }
      })
    } else {
      await prisma.vendorRole.create({
        data: {
          vendorId: vendor.id,
          role,
          fullName,
          inn,
          orgnip,
          orgn,
          kpp,
          bankAccount,
          bik,
          bankName,
          corrAccount,
          address,
          legalAddress,
          actualAddress,
          isVatPayer: isVatPayer || false,
          vatRate: vatRate ? parseInt(vatRate) : null,
          representativeName,
          representativePosition,
          isRepresentative: isRepresentative || false,
          companyName,
          directorName,
          directorPosition,
          selfEmployedInn,
          taxRegime: taxRegime || 'NPD',
          npdToken,
          npdRegion
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      vendor: {
        id: updatedVendor.id,
        type: updatedVendor.type,
        kycStatus: updatedVendor.kycStatus
      },
      message: 'Заявка на апгрейд до Vendor Pro отправлена на модерацию'
    })

  } catch (error) {
    console.error('Error upgrading vendor:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
