import { NextRequest, NextResponse } from 'next/server'

// POST /api/dadata/organization - поиск организации по ИНН/ОГРН
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, type = 'INN' } = body // type: 'INN' | 'OGRN'

    if (!query || !query.trim()) {
      return NextResponse.json({ 
        error: 'Query is required' 
      }, { status: 400 })
    }

    // Очищаем запрос от лишних символов
    const cleanQuery = query.replace(/\D/g, '')

    if (type === 'INN' && (cleanQuery.length !== 10 && cleanQuery.length !== 12)) {
      return NextResponse.json({ 
        error: 'ИНН должен содержать 10 или 12 цифр' 
      }, { status: 400 })
    }

    if (type === 'OGRN' && cleanQuery.length !== 13) {
      return NextResponse.json({ 
        error: 'ОГРН должен содержать 13 цифр' 
      }, { status: 400 })
    }

    const dadataResponse = await fetch(process.env.DADATA_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${process.env.DADATA_API_KEY}`,
        'X-Secret': process.env.DADATA_SECRET_KEY!
      },
      body: JSON.stringify({
        query: cleanQuery,
        count: 1
      })
    })

    if (!dadataResponse.ok) {
      throw new Error(`Dadata API error: ${dadataResponse.status}`)
    }

    const data = await dadataResponse.json()
    
    if (!data.suggestions || data.suggestions.length === 0) {
      return NextResponse.json({ 
        error: 'Организация не найдена' 
      }, { status: 404 })
    }

    const organization = data.suggestions[0].data

    // Определяем статус организации
    const getOrganizationStatus = (state: unknown) => {
      if ((state as any).status === 'ACTIVE') {
        return {
          status: 'ACTIVE',
          text: 'Работает',
          color: 'green',
          description: 'Организация действует'
        }
      } else if ((state as any).status === 'LIQUIDATING') {
        return {
          status: 'LIQUIDATING',
          text: 'Ликвидируется',
          color: 'orange',
          description: 'Организация находится в процессе ликвидации'
        }
      } else if ((state as any).status === 'LIQUIDATED') {
        return {
          status: 'LIQUIDATED',
          text: 'Ликвидирована',
          color: 'red',
          description: 'Организация ликвидирована'
        }
      } else if ((state as any).status === 'BANKRUPT') {
        return {
          status: 'BANKRUPT',
          text: 'Банкротство',
          color: 'red',
          description: 'Организация находится в процессе банкротства'
        }
      } else {
        return {
          status: 'UNKNOWN',
          text: 'Неизвестно',
          color: 'gray',
          description: 'Статус организации неизвестен'
        }
      }
    }

    const organizationStatus = getOrganizationStatus(organization.state)

    // Формируем ответ
    const response = {
      success: true,
      organization: {
        // Основные данные
        name: {
          full: organization.name?.full_with_opf || '',
          short: organization.name?.short_with_opf || '',
          full_without_opf: organization.name?.full || '',
          short_without_opf: organization.name?.short || ''
        },
        
        // Идентификаторы
        inn: organization.inn || '',
        kpp: organization.kpp || '',
        ogrn: organization.ogrn || '',
        okpo: organization.okpo || '',
        okved: organization.okved || '',
        
        // Адреса
        address: {
          full: organization.address?.unrestricted_value || '',
          postal_code: organization.address?.data?.postal_code || '',
          region: organization.address?.data?.region || '',
          city: organization.address?.data?.city || '',
          street: organization.address?.data?.street || '',
          house: organization.address?.data?.house || '',
          flat: organization.address?.data?.flat || ''
        },
        
        // Руководство
        management: {
          name: organization.management?.name || '',
          post: organization.management?.post || '',
          disqualified: organization.management?.disqualified || false
        },
        
        // Финансы
        finance: {
          tax_system: organization.tax_system || '',
          okveds: organization.okveds || []
        },
        
        // Статус
        status: organizationStatus,
        
        // Дополнительная информация
        type: organization.type || '',
        branch_type: organization.branch_type || '',
        branch_count: organization.branch_count || 0,
        employee_count: organization.employee_count || null,
        
        // Даты
        registration_date: organization.state?.registration_date || null,
        liquidation_date: organization.state?.liquidation_date || null,
        
        // Контакты
        phones: organization.phones || [],
        emails: organization.emails || [],
        website: organization.website || ''
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Dadata API error:', error)
    return NextResponse.json({ 
      error: 'Ошибка при поиске организации',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
