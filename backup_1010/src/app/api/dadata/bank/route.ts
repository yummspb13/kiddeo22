import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { bik } = await request.json()

    if (!bik) {
      return NextResponse.json({ error: 'БИК не указан' }, { status: 400 })
    }

    // Получаем ключи из переменных окружения
    const apiKey = process.env.DADATA_API_KEY || 'a8b8c8d8e8f8g8h8i8j8k8l8m8n8o8p8'
    const secretKey = process.env.DADATA_SECRET_KEY || 'a8b8c8d8e8f8g8h8i8j8k8l8m8n8o8p8'

    const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/bank', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`,
        'X-Secret': secretKey
      },
      body: JSON.stringify({
        query: bik
      })
    })

    if (!response.ok) {
      throw new Error(`DaData API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.suggestions && data.suggestions.length > 0) {
      const bank = data.suggestions[0]
      return NextResponse.json({
        found: true,
        data: {
          name: bank.value,
          shortName: bank.data.name.short_with_opf || bank.data.name.short,
          fullName: bank.data.name.full_with_opf || bank.data.name.full || bank.value,
          bik: bank.data.bic,
          correspondentAccount: bank.data.correspondent_account,
          address: bank.data.address?.value || bank.data.address?.unrestricted_value,
          swift: bank.data.swift,
          okpo: bank.data.okpo,
          phone: bank.data.phone,
          rkc: bank.data.rkc
        }
      })
    } else {
      return NextResponse.json({
        found: false,
        message: 'Банк не найден'
      })
    }
  } catch (error) {
    console.error('Bank search error:', error)
    return NextResponse.json({ 
      error: 'Ошибка при поиске банка',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
