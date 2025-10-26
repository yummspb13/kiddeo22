import { NextResponse } from 'next/server'

// GET /api/documents - получить список доступных документов
export async function GET() {
  try {
    const documents = [
      {
        id: 'vendor-agreement',
        title: 'Договор с вендорами',
        description: 'Условия сотрудничества и размещения услуг',
        url: '/documents/vendor-agreement',
        type: 'agreement',
        lastUpdated: '2025-09-13',
        required: true
      },
      {
        id: 'privacy-policy',
        title: 'Политика конфиденциальности',
        description: 'Обработка персональных данных вендоров и пользователей',
        url: '/documents/privacy-policy',
        type: 'privacy',
        lastUpdated: '2025-09-13',
        required: true
      }
    ]

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

