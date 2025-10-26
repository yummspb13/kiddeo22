import { NextRequest, NextResponse } from 'next/server'

const DADATA_API_KEY = process.env.DADATA_API_KEY || '2a34a7955247b518677dae854d57ae1e479c3d34'
const DADATA_SECRET_KEY = process.env.DADATA_SECRET_KEY || '617585b4dec65866304fb9b70e4f4915a91f3824'

// POST /api/dadata/company - поиск компании по ИНН/ОГРН
export async function POST(request: NextRequest) {
  try {
    const { query, type } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${DADATA_API_KEY}`,
        'X-Secret': DADATA_SECRET_KEY
      },
      body: JSON.stringify({
        query: query,
        type: type || undefined, // LEGAL или INDIVIDUAL
        count: 1
      })
    })

    if (!response.ok) {
      throw new Error(`DaData API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.suggestions || data.suggestions.length === 0) {
      return NextResponse.json({ 
        found: false, 
        message: 'Организация не найдена' 
      })
    }

    const company = data.suggestions[0].data

    // Формируем структурированный ответ
    const result = {
      found: true,
      data: {
        // Основная информация
        name: {
          full: company.name?.full_with_opf || company.name?.full || '',
          short: company.name?.short_with_opf || company.name?.short || '',
          latin: company.name?.latin || ''
        },
        
        // Реквизиты
        inn: company.inn || '',
        kpp: company.kpp || '',
        ogrn: company.type === 'INDIVIDUAL' ? '' : (company.ogrn || ''), // ОГРН только для ООО
        orgnip: company.type === 'INDIVIDUAL' ? (company.ogrn || '') : '', // ОГРНИП только для ИП
        okpo: company.okpo || '',
        okved: company.okved || '',
        
        // Адрес - для ИП используем полный адрес
        address: {
          full: company.address?.unrestricted_value || company.address?.value || '',
          postal_code: company.address?.postal_code || '',
          region: company.address?.region || '',
          city: company.address?.city || '',
          street: company.address?.street || '',
          house: company.address?.house || '',
          flat: company.address?.flat || ''
        },
        
        // Руководство - для ИП это сам предприниматель
        management: {
          name: company.management?.name || company.name?.full || '',
          post: company.management?.post || (type === 'INDIVIDUAL' ? 'Индивидуальный предприниматель' : ''),
          start_date: company.management?.start_date || null
        },
        
        // Статус
        status: company.state?.status || '',
        liquidation_date: company.state?.liquidation_date || null,
        registration_date: company.state?.registration_date || null,
        
        // Налогообложение
        taxation: {
          regime: company.tax_regime || '',
          vat: company.vat || false
        },
        
        // Контакты
        contacts: {
          phones: company.phones?.map((phone: unknown) => ({
            source: (phone as any).source,
            type: (phone as any).type,
            number: (phone as any).number
          })) || [],
          emails: company.emails?.map((email: unknown) => ({
            source: (email as any).source,
            local: (email as any).local,
            domain: (email as any).domain
          })) || []
        },
        
        // Капитал
        capital: {
          type: company.capital?.type || '',
          value: company.capital?.value || 0
        },
        
        // Учредители
        founders: company.founders?.map((founder: unknown) => ({
          inn: (founder as any).inn,
          name: (founder as any).name,
          ogrn: (founder as any).ogrn,
          type: (founder as any).type
        })) || [],
        
        // Дополнительная информация
        invalid: company.invalid || false,
        type: company.type || '',
        branch_type: company.branch_type || '',
        
        // Финансовые показатели (если есть)
        finance: company.finance ? {
          income: company.finance.income || 0,
          expense: company.finance.expense || 0,
          profit: company.finance.profit || 0
        } : null
      }
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('DaData API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch company data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
