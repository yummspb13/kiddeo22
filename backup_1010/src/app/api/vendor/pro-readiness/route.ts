import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@/lib/db'

// GET /api/vendor/pro-readiness - проверить готовность к переходу на PRO
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.uid
    
    // Находим вендора
    const vendor = await prisma.vendor.findFirst({
      where: { userId },
      include: {
        vendorRole: true,
        bankAccounts: true,
        taxProfiles: true,
        documents: true
      }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    if (vendor.type === 'PRO') {
      return NextResponse.json({ 
        isReady: true,
        message: 'Уже является PRO вендором',
        missingFields: []
      })
    }

    // Проверяем готовность
    const readinessCheck = await checkProReadiness(vendor.id)
    
    return NextResponse.json({
      isReady: readinessCheck.isReady,
      missingFields: readinessCheck.missingFields,
      progress: calculateProgress(readinessCheck.missingFields),
      vendor: {
        id: vendor.id,
        type: vendor.type,
        kycStatus: vendor.kycStatus
      }
    })

  } catch (error) {
    console.error('Error checking PRO readiness:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Функция проверки готовности к переходу на PRO
async function checkProReadiness(vendorId: number) {
  const missingFields = []
  const completedFields = []
  
  // Проверяем VendorRole
  const vendorRole = await prisma.vendorRole.findUnique({
    where: { vendorId }
  })
  
  if (!vendorRole) {
    missingFields.push('Роль вендора не указана')
  } else {
    completedFields.push('Роль вендора указана')
    
    // Проверяем обязательные поля в зависимости от роли
    if (vendorRole.role === 'NPD') {
      if (!vendorRole.fullName) missingFields.push('ФИО для НПД')
      else completedFields.push('ФИО для НПД')
      
      if (!vendorRole.inn) missingFields.push('ИНН для НПД')
      else completedFields.push('ИНН для НПД')
    } else if (vendorRole.role === 'IE') {
      if (!vendorRole.fullName) missingFields.push('ФИО для ИП')
      else completedFields.push('ФИО для ИП')
      
      if (!vendorRole.inn) missingFields.push('ИНН для ИП')
      else completedFields.push('ИНН для ИП')
      
      if (!vendorRole.orgnip) missingFields.push('ОГРНИП для ИП')
      else completedFields.push('ОГРНИП для ИП')
    } else if (vendorRole.role === 'LEGAL') {
      if (!vendorRole.companyName) missingFields.push('Наименование организации')
      else completedFields.push('Наименование организации')
      
      if (!vendorRole.inn) missingFields.push('ИНН организации')
      else completedFields.push('ИНН организации')
      
      if (!vendorRole.orgn) missingFields.push('ОГРН организации')
      else completedFields.push('ОГРН организации')
      
      if (!vendorRole.directorName) missingFields.push('ФИО директора')
      else completedFields.push('ФИО директора')
    }
  }
  
  // Проверяем банковские реквизиты
  const bankAccount = await prisma.bankAccount.findFirst({
    where: { vendorId }
  })
  
  if (!bankAccount) {
    missingFields.push('Банковские реквизиты')
  } else {
    completedFields.push('Банковские реквизиты созданы')
    
    if (!bankAccount.holderName) missingFields.push('Наименование держателя счета')
    else completedFields.push('Наименование держателя счета')
    
    if (!bankAccount.bankName) missingFields.push('Наименование банка')
    else completedFields.push('Наименование банка')
    
    if (!bankAccount.bik) missingFields.push('БИК банка')
    else completedFields.push('БИК банка')
    
    if (!bankAccount.account) missingFields.push('Расчетный счет')
    else completedFields.push('Расчетный счет')
  }
  
  // Проверяем налоговый профиль
  const taxProfile = await prisma.taxProfile.findFirst({
    where: { vendorId }
  })
  
  if (!taxProfile) {
    missingFields.push('Налоговый профиль')
  } else {
    completedFields.push('Налоговый профиль создан')
    
    if (!taxProfile.taxRegime) missingFields.push('Налоговый режим')
    else completedFields.push('Налоговый режим')
    
    if (!taxProfile.vatStatus) missingFields.push('Статус НДС')
    else completedFields.push('Статус НДС')
  }
  
  // Проверяем документы
  const documents = await prisma.document.findMany({
    where: { vendorId }
  })
  
  if (documents.length === 0) {
    missingFields.push('Документы для верификации')
  } else {
    completedFields.push(`Загружено ${documents.length} документов`)
  }
  
  return {
    isReady: missingFields.length === 0,
    missingFields,
    completedFields
  }
}

// Функция расчета прогресса
function calculateProgress(missingFields: string[]) {
  const totalFields = 8 // Примерное количество обязательных полей
  const completedFields = totalFields - missingFields.length
  return Math.round((completedFields / totalFields) * 100)
}
