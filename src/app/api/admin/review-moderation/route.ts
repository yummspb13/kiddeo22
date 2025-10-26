import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import OpenAI from 'openai'

export const runtime = 'nodejs'

// GET - получить настройки модерации
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (key !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем настройки модерации (пока из переменных окружения)
    const settings = {
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      rules: process.env.REVIEW_MODERATION_RULES || '',
      isEnabled: process.env.REVIEW_MODERATION_ENABLED === 'true',
      autoApprove: process.env.REVIEW_MODERATION_AUTO_APPROVE === 'true',
      memoryContext: process.env.REVIEW_MODERATION_MEMORY || ''
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching moderation settings:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - обновить настройки модерации
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (key !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { openaiApiKey, rules, isEnabled, autoApprove, memoryContext } = body

    // Сохраняем настройки в переменные окружения (временно)
    // В реальном проекте нужно сохранять в базу данных
    console.log('🔧 Updating moderation settings:', {
      hasApiKey: !!openaiApiKey,
      hasRules: !!rules,
      isEnabled,
      autoApprove,
      hasMemory: !!memoryContext
    })

    return NextResponse.json({ 
      success: true,
      message: 'Настройки модерации обновлены'
    })
  } catch (error) {
    console.error('Error updating moderation settings:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - модерация отзыва через AI
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (key !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reviewId, reviewType, rating, comment, photos } = body

    if (!reviewId || !reviewType) {
      return NextResponse.json({ error: 'Missing reviewId or reviewType' }, { status: 400 })
    }

    // Получаем правила модерации
    const rules = process.env.REVIEW_MODERATION_RULES || `
    Правила модерации отзывов:
    1. Отклонять отзывы с нецензурной лексикой
    2. Отклонять отзывы с личными оскорблениями
    3. Отклонять отзывы с рекламой или спамом
    4. Отклонять отзывы не по теме
    5. Одобрять конструктивные отзывы с конкретными замечаниями
    6. Одобрять отзывы с оценкой 1-2 звезд, если они обоснованы
    `

    const memoryContext = process.env.REVIEW_MODERATION_MEMORY || `
    Контекст для анализа:
    - Это платформа для детских мероприятий и мест
    - Пользователи оставляют отзывы о местах и событиях
    - Важно поддерживать дружелюбную атмосферу
    - Критика должна быть конструктивной
    `

    // Инициализируем OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    // Формируем промпт для анализа
    const prompt = `
${memoryContext}

${rules}

Проанализируй следующий отзыв:

Оценка: ${rating}/5 звезд
Комментарий: ${comment || 'Без комментария'}
Фото: ${photos ? 'Есть фото' : 'Без фото'}

Определи:
1. Содержит ли отзыв нецензурную лексику?
2. Содержит ли личные оскорбления?
3. Является ли спамом или рекламой?
4. Соответствует ли теме?
5. Является ли конструктивным?

Ответь в формате JSON:
{
  "decision": "APPROVE" | "REJECT" | "NEEDS_REVIEW",
  "reason": "Краткое обоснование решения",
  "confidence": 0.95,
  "analysis": "Подробный анализ отзыва"
}
`

    // Отправляем запрос к OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Ты эксперт по модерации отзывов. Анализируй отзывы объективно и справедливо."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    const aiResponse = completion.choices[0]?.message?.content
    if (!aiResponse) {
      throw new Error('No response from OpenAI')
    }

    // Парсим ответ AI
    let aiDecision
    try {
      aiDecision = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      aiDecision = {
        decision: "NEEDS_REVIEW",
        reason: "Ошибка анализа AI",
        confidence: 0.5,
        analysis: aiResponse
      }
    }

    // Определяем финальный статус
    let finalStatus = 'MODERATION'
    if (aiDecision.decision === 'APPROVE') {
      finalStatus = 'APPROVED'
    } else if (aiDecision.decision === 'REJECT') {
      finalStatus = 'REJECTED'
    }

    // Обновляем статус отзыва в базе данных
    const reviewModel = reviewType === 'venue' ? 'venueReview' : 'eventReview'
    await prisma[reviewModel].update({
      where: { id: reviewId },
      data: { status: finalStatus }
    })

    // Логируем результат модерации
    console.log('🤖 AI Moderation Result:', {
      reviewId,
      reviewType,
      aiDecision: aiDecision.decision,
      finalStatus,
      confidence: aiDecision.confidence
    })

    return NextResponse.json({
      success: true,
      decision: aiDecision.decision,
      reason: aiDecision.reason,
      confidence: aiDecision.confidence,
      analysis: aiDecision.analysis,
      finalStatus
    })

  } catch (error) {
    console.error('Error in AI moderation:', error)
    return NextResponse.json({ 
      error: 'AI moderation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
