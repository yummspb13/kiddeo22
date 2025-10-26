import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import OpenAI from 'openai'
import { HttpsProxyAgent } from 'https-proxy-agent'

export const runtime = 'nodejs'

// GET - получить настройки модерации
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (key !== 'kidsreview2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем или создаем настройки модерации
    let settings = await prisma.reviewModerationSettings.findFirst()
    
    if (!settings) {
      // Создаем настройки по умолчанию
      settings = await prisma.reviewModerationSettings.create({
        data: {
          openaiApiKey: process.env.OPENAI_API_KEY || '',
          rules: process.env.REVIEW_MODERATION_RULES || '',
          isEnabled: process.env.REVIEW_MODERATION_ENABLED === 'true',
          autoApprove: process.env.REVIEW_MODERATION_AUTO_APPROVE === 'true',
          memoryContext: process.env.REVIEW_MODERATION_MEMORY || '',
          model: process.env.REVIEW_MODERATION_MODEL || 'gpt-4'
        }
      })
    }

    const responseSettings = {
      openaiApiKey: settings.openaiApiKey || process.env.OPENAI_API_KEY || '',
      rules: settings.rules || process.env.REVIEW_MODERATION_RULES || '',
      isEnabled: settings.isEnabled || process.env.REVIEW_MODERATION_ENABLED === 'true',
      autoApprove: settings.autoApprove || process.env.REVIEW_MODERATION_AUTO_APPROVE === 'true',
      memoryContext: settings.memoryContext || process.env.REVIEW_MODERATION_MEMORY || '',
      model: settings.model || process.env.REVIEW_MODERATION_MODEL || 'gpt-4'
    }

    return NextResponse.json({ settings: responseSettings })
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
    const { openaiApiKey, rules, isEnabled, autoApprove, memoryContext, model } = body

    console.log('🔧 Updating universal moderation settings:', {
      hasApiKey: !!openaiApiKey,
      hasRules: !!rules,
      isEnabled,
      autoApprove,
      hasMemory: !!memoryContext,
      model
    })

    return NextResponse.json({ 
      success: true,
      message: 'Настройки универсальной модерации обновлены'
    })
  } catch (error) {
    console.error('Error updating moderation settings:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - тестирование модерации
export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 PUT request received')
    
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    
    if (key !== 'kidsreview2025') {
      console.error('❌ Unauthorized request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reviewId, reviewType, rating, comment, photos, entityName, entityType } = body

    console.log('📋 Request data:', { reviewId, reviewType, rating, comment, entityName, entityType })

    // Проверяем, что это тестовый запрос
    if (reviewId === 'test-review') {
      console.log('🧪 Test request detected, calling testModeration')
      return await testModeration(comment, entityName, entityType)
    }

    // Обычная модерация отзывов
    console.log('🔄 Regular moderation request')
    return await moderateReview(reviewId, reviewType, rating, comment, photos, entityName, entityType)
  } catch (error) {
    console.error('❌ Error in PUT moderation:', error)
    return NextResponse.json({ 
      error: 'AI moderation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Функция тестирования модерации
async function testModeration(comment: string, entityName: string, entityType: string) {
  try {
    console.log('🧪 Starting test moderation:', { comment, entityName, entityType })
    
    // Проверяем наличие API ключа
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not found')
      throw new Error('OpenAI API key not configured')
    }
    
    console.log('✅ OpenAI API key found')

    // Настройка прокси для обхода блокировок
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
    const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      httpAgent: agent
    })

    const prompt = `
    Проанализируй этот тестовый отзыв для детской платформы:
    
    Отзыв: "${comment}"
    Место: ${entityName} (${entityType})
    
    Определи решение: APPROVE, REJECT, или NEEDS_REVIEW
    Оцени уверенность от 0 до 1
    Дай краткое обоснование
    
    Ответ в формате JSON:
    {
      "decision": "APPROVE|REJECT|NEEDS_REVIEW",
      "confidence": 0.85,
      "reason": "Краткое обоснование"
    }
    `

    console.log('🤖 Sending request to OpenAI...')
    
    const completion = await openai.chat.completions.create({
      model: process.env.REVIEW_MODERATION_MODEL || 'gpt-4',
      messages: [
        {
          role: "system",
          content: "Ты эксперт по модерации отзывов на детской платформе. Отвечай только в формате JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 500
    })
    
    console.log('✅ OpenAI response received')

    const aiResponse = completion.choices[0]?.message?.content
    if (!aiResponse) {
      console.error('❌ No response from OpenAI')
      throw new Error('No response from OpenAI')
    }

    console.log('📝 AI Response:', aiResponse)

    const result = JSON.parse(aiResponse)
    console.log('✅ Parsed result:', result)
    
    return NextResponse.json({
      success: true,
      decision: result.decision,
      confidence: result.confidence,
      reason: result.reason
    })
  } catch (error) {
    console.error('Test moderation error:', error)
    
    // Обработка специфических ошибок OpenAI
    if (error instanceof Error) {
      if (error.message.includes('403') && error.message.includes('Country, region, or territory not supported')) {
        console.log('🌍 OpenAI API недоступен в вашем регионе, используем симуляцию для разработки')
        return simulateModeration(comment, entityName, entityType)
      }
      if (error.message.includes('401') && error.message.includes('Incorrect API key')) {
        throw new Error('Неверный API ключ OpenAI. Проверьте правильность ключа.')
      }
      if (error.message.includes('429')) {
        throw new Error('Превышен лимит запросов к OpenAI API. Попробуйте позже.')
      }
    }
    
    throw error
  }
}

// Функция модерации отзывов
async function moderateReview(reviewId: string, reviewType: string, rating: number, comment: string, photos: string | null, entityName: string, entityType: string) {
  try {
    if (!reviewId || !reviewType) {
      return NextResponse.json({ error: 'Missing reviewId or reviewType' }, { status: 400 })
    }

    // Универсальные правила модерации для Афиши и Мест
    const rules = process.env.REVIEW_MODERATION_RULES || `
    УНИВЕРСАЛЬНЫЕ ПРАВИЛА МОДЕРАЦИИ ОТЗЫВОВ:
    
    ОТКЛОНЯТЬ отзывы если:
    1. Содержат нецензурную лексику или мат
    2. Содержат личные оскорбления в адрес организаторов/владельцев
    3. Являются спамом, рекламой или фейковыми отзывами
    4. Не соответствуют теме (не о мероприятии/месте)
    5. Содержат контактные данные для рекламы
    6. Написаны на иностранном языке (кроме английского)
    7. Содержат политические или религиозные высказывания
    8. Содержат информацию о насилии или опасности для детей
    9. Копируют другие отзывы
    10. Слишком короткие (менее 10 символов) без содержательной информации
    
    ОДОБРЯТЬ отзывы если:
    1. Конструктивные с конкретными замечаниями
    2. Содержат полезную информацию для других родителей
    3. Честно описывают опыт (даже негативный)
    4. Содержат предложения по улучшению
    5. Написаны вежливо и по существу
    6. Имеют адекватную оценку (1-5 звезд)
    
    ОТПРАВЛЯТЬ НА ДОПОЛНИТЕЛЬНУЮ ПРОВЕРКУ если:
    1. Пограничные случаи (сомнительные, но не явно нарушающие)
    2. Сложные ситуации, требующие человеческого суждения
    3. Отзывы с оценкой 1-2 звезды с подробным обоснованием
    `

    const memoryContext = process.env.REVIEW_MODERATION_MEMORY || `
    КОНТЕКСТ ДЛЯ АНАЛИЗА:
    - Платформа Kiddeo для детских мероприятий и мест
    - Пользователи: родители с детьми
    - Важно поддерживать безопасную и дружелюбную атмосферу
    - Критика должна быть конструктивной и полезной
    - Приоритет: безопасность детей и качество информации
    - Тип сущности: ${entityType} "${entityName}"
    `

    // Проверяем наличие API ключа
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not found')
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        details: 'Please set OPENAI_API_KEY environment variable'
      }, { status: 400 })
    }

    // Инициализируем OpenAI
    // Настройка прокси для обхода блокировок
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
    const agent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      httpAgent: agent
    })

    // Формируем универсальный промпт для анализа
    const prompt = `
${memoryContext}

${rules}

АНАЛИЗИРУЕМЫЙ ОТЗЫВ:
Тип: ${reviewType === 'venue' ? 'Место' : 'Мероприятие'}
Название: ${entityName || 'Не указано'}
Оценка: ${rating}/5 звезд
Комментарий: ${comment || 'Без комментария'}
Фото: ${photos ? 'Есть фото' : 'Без фото'}

ЗАДАЧА:
Проанализируй отзыв по всем правилам выше и определи решение.

ОТВЕТ В ФОРМАТЕ JSON:
{
  "decision": "APPROVE" | "REJECT" | "NEEDS_REVIEW",
  "reason": "Краткое обоснование решения на русском языке",
  "confidence": 0.95,
  "analysis": "Подробный анализ отзыва с указанием конкретных нарушений или положительных моментов",
  "violations": ["список нарушений если есть"],
  "suggestions": "Предложения по улучшению если есть"
}
`

    // Получаем модель из настроек
    const model = process.env.REVIEW_MODERATION_MODEL || 'gpt-4'
    
    console.log('🤖 Sending request to OpenAI with model:', model)
    
    // Отправляем запрос к OpenAI
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: "Ты эксперт по модерации отзывов на детской платформе. Анализируй объективно, справедливо и с учетом безопасности детей."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    })

    console.log('✅ OpenAI response received')

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
        analysis: aiResponse,
        violations: [],
        suggestions: ""
      }
    }

    // Определяем финальный статус
    let finalStatus = 'MODERATION'
    if (aiDecision.decision === 'APPROVE') {
      finalStatus = 'APPROVED'
    } else if (aiDecision.decision === 'REJECT') {
      finalStatus = 'REJECTED'
    }
    // Если NEEDS_REVIEW - остается MODERATION для ручной проверки

    // Обновляем статус отзыва в базе данных
    const reviewModel = reviewType === 'venue' ? 'venueReview' : 'eventReview'
    await prisma[reviewModel].update({
      where: { id: reviewId },
      data: { status: finalStatus }
    })

    // Логируем результат модерации
    console.log('🤖 Universal AI Moderation Result:', {
      reviewId,
      reviewType,
      entityName,
      aiDecision: aiDecision.decision,
      finalStatus,
      confidence: aiDecision.confidence,
      violations: aiDecision.violations
    })

    return NextResponse.json({
      success: true,
      decision: aiDecision.decision,
      reason: aiDecision.reason,
      confidence: aiDecision.confidence,
      analysis: aiDecision.analysis,
      violations: aiDecision.violations || [],
      suggestions: aiDecision.suggestions || '',
      finalStatus,
      reviewType,
      entityName
    })

  } catch (error) {
    console.error('Error in universal AI moderation:', error)
    return NextResponse.json({ 
      error: 'AI moderation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
