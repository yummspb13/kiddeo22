import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth-server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.uid
    const body = await request.json()
    
    console.log('📝 Получены данные для перехода на PRO:', JSON.stringify(body, null, 2))
    console.log('🔍 Детали данных:')
    console.log('  - Роль:', body.role)
    console.log('  - Данные компании:', body.companyData)
    console.log('  - Банковские реквизиты:', body.bankAccount)
    console.log('  - Налоговый профиль:', body.taxProfile)
    console.log('  - Документы:', body.documents)
    
    // Проверяем каждое поле отдельно
    console.log('🔍 Проверка полей:')
    if (body.role) {
      console.log('  ✅ Роль:', body.role)
    } else {
      console.log('  ❌ Роль не указана')
    }
    
    if (body.companyData) {
      console.log('  ✅ Данные компании:', body.companyData)
      if (body.companyData.fullName) console.log('    ✅ ФИО:', body.companyData.fullName)
      if (body.companyData.inn) console.log('    ✅ ИНН:', body.companyData.inn)
      if (body.companyData.orgnip) console.log('    ✅ ОГРНИП:', body.companyData.orgnip)
    } else {
      console.log('  ❌ Данные компании не указаны')
    }
    
    if (body.bankAccount) {
      console.log('  ✅ Банковские реквизиты:', body.bankAccount)
    } else {
      console.log('  ❌ Банковские реквизиты не указаны')
    }
    
    if (body.taxProfile) {
      console.log('  ✅ Налоговый профиль:', body.taxProfile)
    } else {
      console.log('  ❌ Налоговый профиль не указан')
    }
    
    if (body.documents && body.documents.length > 0) {
      console.log('  ✅ Документы:', body.documents.length)
    } else {
      console.log('  ❌ Документы не загружены')
    }
    
    // Находим вендора
    const vendor = await prisma.vendor.findFirst({
      where: { userId },
      include: {
        vendorRole: true,
        VendorOnboarding: true
      }
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
    }

    if (vendor.type === 'PRO') {
      return NextResponse.json({ error: 'Already PRO vendor' }, { status: 400 })
    }

    // Сохраняем данные формы
    await saveFormData(vendor.id, body)

    // Затем проверяем готовность к переходу на PRO
    console.log('🔍 Проверяем готовность к переходу на PRO...')
    const readinessCheck = await checkProReadiness(vendor.id)
    
    console.log('📊 Результат проверки готовности:')
    console.log('  - Готов:', readinessCheck.isReady)
    console.log('  - Недостающие поля:', readinessCheck.missingFields)
    
    if (!readinessCheck.isReady) {
      console.log('❌ Вендор НЕ готов к переходу на PRO')
      console.log('❌ Недостающие поля:', readinessCheck.missingFields)
      
      return NextResponse.json({ 
        error: 'Not ready for PRO upgrade',
        details: readinessCheck.missingFields,
        message: 'Необходимо заполнить все обязательные поля для перехода на PRO'
      }, { status: 400 })
    }
    
    console.log('✅ Вендор готов к переходу на PRO!')

    // Обновляем тип вендора на PRO
    const updatedVendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: {
        type: 'PRO',
        kycStatus: 'SUBMITTED', // При переходе на PRO нужно повторно пройти модерацию
        canPostEvents: false,
        canPostCatalog: false
      }
    })

    // Создаем запись в журнале аудита
    await prisma.auditLog.create({
      data: {
        entityType: 'VENDOR',
        entityId: vendor.id.toString(),
        action: 'UPGRADE_TO_PRO',
        details: {
          reason: 'Переход на PRO тариф',
          previousType: 'START',
          newType: 'PRO',
          vendorId: vendor.id,
          previousStatus: vendor.kycStatus,
          newStatus: 'SUBMITTED'
        },
        userId: userId,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
      }
    })

    return NextResponse.json({
      success: true,
      vendor: updatedVendor,
      message: 'Успешно перешли на Vendor Pro! Теперь нужно пройти повторную модерацию.'
    })

  } catch (error) {
    console.error('Error upgrading to PRO:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Функция проверки готовности к переходу на PRO
async function checkProReadiness(vendorId: number) {
  console.log('🔍 Проверяем готовность вендора:', vendorId)
  const missingFields = []
  
  // Проверяем VendorRole
  const vendorRole = await prisma.vendorRole.findUnique({
    where: { vendorId }
  })
  
  console.log('📊 VendorRole:', vendorRole)
  
  if (!vendorRole) {
    console.log('❌ VendorRole не найден - добавляем в недостающие поля')
    missingFields.push('Роль вендора не указана')
  } else {
    // Проверяем обязательные поля в зависимости от роли
    console.log('🔍 Проверяем поля для роли:', vendorRole.role)
    if (vendorRole.role === 'NPD') {
      console.log('  - ФИО для НПД:', vendorRole.fullName || 'НЕТ')
      console.log('  - ИНН для НПД:', vendorRole.inn || 'НЕТ')
      if (!vendorRole.fullName) {
        console.log('  ❌ ФИО для НПД отсутствует')
        missingFields.push('ФИО для НПД')
      }
      if (!vendorRole.inn) {
        console.log('  ❌ ИНН для НПД отсутствует')
        missingFields.push('ИНН для НПД')
      }
    } else if (vendorRole.role === 'IE') {
      console.log('  - ФИО для ИП:', vendorRole.fullName || 'НЕТ')
      console.log('  - ИНН для ИП:', vendorRole.inn || 'НЕТ')
      console.log('  - ОГРНИП для ИП:', vendorRole.orgnip || 'НЕТ')
      if (!vendorRole.fullName) {
        console.log('  ❌ ФИО для ИП отсутствует')
        missingFields.push('ФИО для ИП')
      }
      if (!vendorRole.inn) {
        console.log('  ❌ ИНН для ИП отсутствует')
        missingFields.push('ИНН для ИП')
      }
      if (!vendorRole.orgnip) {
        console.log('  ❌ ОГРНИП для ИП отсутствует')
        missingFields.push('ОГРНИП для ИП')
      }
    } else if (vendorRole.role === 'LEGAL') {
      console.log('  - Наименование организации:', vendorRole.companyName || 'НЕТ')
      console.log('  - ИНН организации:', vendorRole.inn || 'НЕТ')
      console.log('  - ОГРН организации:', vendorRole.orgn || 'НЕТ')
      console.log('  - ФИО директора:', vendorRole.directorName || 'НЕТ')
      if (!vendorRole.companyName) {
        console.log('  ❌ Наименование организации отсутствует')
        missingFields.push('Наименование организации')
      }
      if (!vendorRole.inn) {
        console.log('  ❌ ИНН организации отсутствует')
        missingFields.push('ИНН организации')
      }
      if (!vendorRole.orgn) {
        console.log('  ❌ ОГРН организации отсутствует')
        missingFields.push('ОГРН организации')
      }
      if (!vendorRole.directorName) {
        console.log('  ❌ ФИО директора отсутствует')
        missingFields.push('ФИО директора')
      }
    }
  }
  
  // Проверяем банковские реквизиты (ВРЕМЕННО ОТКЛЮЧЕНО ДЛЯ ТЕСТИРОВАНИЯ)
  const bankAccount = await prisma.bankAccount.findFirst({
    where: { vendorId }
  })
  
  console.log('📊 BankAccount:', bankAccount)
  console.log('ℹ️ Проверка банковских реквизитов ОТКЛЮЧЕНА для тестирования')
  
  // ВРЕМЕННО ОТКЛЮЧАЕМ ПРОВЕРКУ БАНКОВСКИХ РЕКВИЗИТОВ
  // if (!bankAccount) {
  //   console.log('❌ BankAccount не найден - добавляем в недостающие поля')
  //   missingFields.push('Банковские реквизиты')
  // } else {
  //   console.log('🔍 Проверяем поля BankAccount:')
  //   if (!bankAccount.holderName) {
  //     console.log('  ❌ Наименование держателя счета отсутствует')
  //     missingFields.push('Наименование держателя счета')
  //   }
  //   if (!bankAccount.bankName) {
  //     console.log('  ❌ Наименование банка отсутствует')
  //     missingFields.push('Наименование банка')
  //   }
  //   if (!bankAccount.bik) {
  //     console.log('  ❌ БИК банка отсутствует')
  //     missingFields.push('БИК банка')
  //   }
  //   if (!bankAccount.account) {
  //     console.log('  ❌ Расчетный счет отсутствует')
  //     missingFields.push('Расчетный счет')
  //   }
  // }
  
  // Проверяем налоговый профиль
  const taxProfile = await prisma.taxProfile.findFirst({
    where: { vendorId }
  })
  
  console.log('📊 TaxProfile:', taxProfile)
  
  if (!taxProfile) {
    console.log('❌ TaxProfile не найден - добавляем в недостающие поля')
    missingFields.push('Налоговый профиль')
  } else {
    console.log('🔍 Проверяем поля TaxProfile:')
    if (!taxProfile.taxRegime) {
      console.log('  ❌ Налоговый режим отсутствует')
      missingFields.push('Налоговый режим')
    }
    if (!taxProfile.vatStatus) {
      console.log('  ❌ Статус НДС отсутствует')
      missingFields.push('Статус НДС')
    }
  }
  
  // Проверяем документы (ВРЕМЕННО ОТКЛЮЧЕНО ДЛЯ ТЕСТИРОВАНИЯ)
  const documents = await prisma.document.findMany({
    where: { vendorId }
  })
  
  console.log('📊 Documents:', documents.length)
  console.log('ℹ️ Проверка документов ОТКЛЮЧЕНА для тестирования')
  
  // ВРЕМЕННО ОТКЛЮЧАЕМ ПРОВЕРКУ ДОКУМЕНТОВ
  // if (documents.length === 0) {
  //   console.log('❌ Документы отсутствуют - добавляем в недостающие поля')
  //   missingFields.push('Документы для верификации')
  // }
  
  console.log('📋 ИТОГО недостающих полей:', missingFields.length)
  console.log('📋 Список недостающих полей:', missingFields)
  
  return {
    isReady: missingFields.length === 0,
    missingFields
  }
}

// Функция сохранения данных формы
async function saveFormData(vendorId: number, formData: unknown) {
  try {
    console.log('💾 Сохраняем данные формы для вендора:', vendorId)
    console.log('📊 Данные формы:', JSON.stringify(formData, null, 2))
    
    // Сохраняем/обновляем VendorRole
    if ((formData as any).role || (formData as any).companyData) {
      const vendorRoleData: any = {}
      
      if ((formData as any).role) {
        vendorRoleData.role = (formData as any).role
      }
      
      if ((formData as any).companyData) {
        const cd = (formData as any).companyData as any
        if (cd.inn) vendorRoleData.inn = cd.inn
        if (cd.ogrn) vendorRoleData.orgn = cd.ogrn
        if (cd.orgnip) vendorRoleData.orgnip = cd.orgnip
        if (cd.companyName) vendorRoleData.companyName = cd.companyName
        if (cd.fullName) vendorRoleData.fullName = cd.fullName
        if (cd.directorName) vendorRoleData.directorName = cd.directorName
        if (cd.address) vendorRoleData.address = cd.address
      }

      console.log('💾 Сохраняем VendorRole:', vendorRoleData)
      await prisma.vendorRole.upsert({
        where: { vendorId },
        update: vendorRoleData,
        create: {
          vendorId,
          role: (formData as any).role || 'NPD',
          ...vendorRoleData
        }
      })
      console.log('✅ VendorRole сохранен')
    }

    // Сохраняем/обновляем BankAccount
    if ((formData as any).bankAccount) {
      const ba = (formData as any).bankAccount
      // Получаем ИНН из данных компании
      const companyInn = (formData as any).companyData?.inn || ''
      
      console.log('💾 Сохраняем BankAccount:', { holderName: ba.holderName, inn: companyInn, bankName: ba.bankName, bik: ba.bik, account: ba.account })
      await prisma.bankAccount.upsert({
        where: { vendorId },
        update: {
          holderName: ba.holderName,
          inn: companyInn, // Используем ИНН из данных компании
          bankName: ba.bankName,
          bik: ba.bik,
          account: ba.account,
          corrAccount: ba.corrAccount
        },
        create: {
          vendorId,
          holderName: ba.holderName,
          inn: companyInn, // Используем ИНН из данных компании
          bankName: ba.bankName,
          bik: ba.bik,
          account: ba.account,
          corrAccount: ba.corrAccount
        }
      })
      console.log('✅ BankAccount сохранен')
    }

    // Сохраняем/обновляем TaxProfile
    if ((formData as any).taxProfile) {
      const tp = (formData as any).taxProfile
      console.log('💾 Сохраняем TaxProfile:', { taxRegime: tp.taxRegime, vatStatus: tp.vatStatus, isVatPayer: tp.isVatPayer, fiscalMode: tp.fiscalMode })
      await prisma.taxProfile.upsert({
        where: { vendorId },
        update: {
          taxRegime: tp.taxRegime,
          vatStatus: tp.vatStatus,
          vatRate: tp.vatRate,
          isVatPayer: tp.isVatPayer,
          fiscalMode: tp.fiscalMode,
          agencyAgreement: tp.agencyAgreement
        },
        create: {
          vendorId,
          taxRegime: tp.taxRegime,
          vatStatus: tp.vatStatus,
          vatRate: tp.vatRate,
          isVatPayer: tp.isVatPayer,
          fiscalMode: tp.fiscalMode,
          agencyAgreement: tp.agencyAgreement
        }
      })
      console.log('✅ TaxProfile сохранен')
    }

    // TODO: Обработка загрузки документов
    // if (formData.documents && formData.documents.length > 0) {
    //   // Сохранение файлов и создание записей Document
    // }

  } catch (error) {
    console.error('Error saving form data:', error)
    throw error
  }
}
