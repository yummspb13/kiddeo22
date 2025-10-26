// src/lib/ai-assistant.ts
import prisma from "@/lib/db"
import { AIAssistantType, AIAssistantStatus } from "@prisma/client"

export interface AIRequest {
  vendorId: number
  type: AIAssistantType
  prompt: string
  metadata?: unknown
}

export interface AIResponse {
  id: number
  response: string
  tokensUsed: number
  cost: number
  status: AIAssistantStatus
}

// Создание запроса к ИИ-помощнику
export async function createAIRequest(request: AIRequest): Promise<AIResponse> {
  const aiRequest = await prisma.aIAssistant.create({
    data: {
      vendorId: request.vendorId,
      type: request.type,
      prompt: request.prompt,
      metadata: request.metadata as any,
      status: 'PENDING'
    }
  })

  // В реальной версии здесь будет вызов OpenAI API
  // Пока что симулируем обработку
  return simulateAIProcessing(aiRequest.id, request)
}

// Симуляция обработки ИИ (заглушка для OpenAI)
async function simulateAIProcessing(id: number, request: AIRequest): Promise<AIResponse> {
  // Обновляем статус на "обработка"
  await prisma.aIAssistant.update({
    where: { id },
    data: { status: 'PROCESSING' }
  })

  // Симуляция задержки обработки
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Генерируем ответ в зависимости от типа запроса
  const response = generateMockResponse(request.type, request.prompt)
  
  // Обновляем запрос с результатом
  const updated = await prisma.aIAssistant.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      response: response.text,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      completedAt: new Date()
    }
  })

  return {
    id: updated.id,
    response: updated.response!,
    tokensUsed: updated.tokensUsed!,
    cost: updated.cost!,
    status: updated.status
  }
}

// Генерация мок-ответов в зависимости от типа запроса
function generateMockResponse(type: AIAssistantType, prompt: string) {
  const responses = {
    PROMO_ADVICE: {
      text: `На основе анализа вашего запроса "${prompt}", рекомендую:

1. **Лучшее время для публикации**: Выходные дни с 10:00 до 12:00 и с 15:00 до 17:00
2. **Оптимальные слоты**: Пятница 18:00-20:00, суббота 10:00-12:00, воскресенье 15:00-17:00
3. **Стратегия продвижения**: 
   - Используйте яркие, привлекательные изображения
   - Добавьте ограниченное предложение (например, "Первые 5 записей со скидкой 20%")
   - Укажите возрастную группу и уровень сложности

4. **Контент-стратегия**:
   - Покажите процесс работы в коротком видео
   - Добавьте отзывы предыдущих участников
   - Создайте интригу в описании

Эти рекомендации основаны на анализе успешных мероприятий в вашей категории.`,
      tokensUsed: 180,
      cost: 0.036
    },
    PRICING_ANALYSIS: {
      text: `Анализ ценообразования для "${prompt}":

**Текущая ситуация на рынке:**
- Средняя цена в вашей категории: 800-1200₽
- Премиум-сегмент: 1500-2500₽
- Бюджетный сегмент: 400-600₽

**Рекомендации по ценообразованию:**
1. **Оптимальная цена**: 900₽ (на 10% ниже средней для привлечения клиентов)
2. **Стратегия ценообразования**:
   - Базовая цена: 900₽
   - Раннее бронирование (за 2 недели): 750₽ (-17%)
   - Групповые скидки (от 3 человек): 800₽ (-11%)
   - VIP-пакет с материалами: 1200₽ (+33%)

3. **Психологические аспекты**:
   - Цена 899₽ воспринимается лучше, чем 900₽
   - Покажите экономию по сравнению с альтернативами
   - Добавьте "гарантию возврата средств"

**Прогноз влияния на конверсию**: +25-30% при правильной подаче цены.`,
      tokensUsed: 220,
      cost: 0.044
    },
    CONTENT_GENERATION: {
      text: `Генерирую контент для "${prompt}":

**Заголовок (SEO-оптимизированный):**
"Мастер-класс по рисованию для детей 5-12 лет | Развитие творческих способностей | Москва"

**Краткое описание (для карточки):**
🎨 Увлекательный мастер-класс по рисованию для детей! Развиваем творческие способности, учимся работать с разными материалами и техниками. Подходит для начинающих и продолжающих.

**Подробное описание:**
Наш мастер-класс - это не просто урок рисования, а настоящее путешествие в мир творчества! 

**Что ждет участников:**
✨ Изучение различных техник рисования (акварель, гуашь, карандаши)
✨ Работа с разными материалами и инструментами
✨ Развитие мелкой моторики и воображения
✨ Создание собственной картины на память
✨ Работа в дружной команде сверстников

**Программа мастер-класса:**
1. Знакомство и разминка (15 мин)
2. Изучение техники (30 мин)
3. Практическая работа (45 мин)
4. Презентация работ (15 мин)
5. Чаепитие и общение (15 мин)

**Что включено в стоимость:**
- Все необходимые материалы
- Работа опытного преподавателя
- Памятная фотография
- Свидетельство участника

**Почему выбирают нас:**
- 5+ лет опыта работы с детьми
- Индивидуальный подход к каждому ребенку
- Современные методики обучения
- Уютная творческая атмосфера

Записывайтесь прямо сейчас! Количество мест ограничено.`,
      tokensUsed: 350,
      cost: 0.07
    },
    UTM_GENERATION: {
      text: `UTM-метки для "${prompt}":

**Основные UTM-параметры:**
- utm_source=google_ads
- utm_medium=cpc
- utm_campaign=masterclass_painting_2024
- utm_content=main_banner
- utm_term=детский_мастер_класс_рисование

**Полная ссылка:**
https://your-site.com/event/masterclass-painting?utm_source=google_ads&utm_medium=cpc&utm_campaign=masterclass_painting_2024&utm_content=main_banner&utm_term=детский_мастер_класс_рисование

**Варианты для разных каналов:**

1. **Google Ads:**
   - utm_source=google_ads
   - utm_medium=cpc
   - utm_campaign=masterclass_painting_2024

2. **VKontakte:**
   - utm_source=vkontakte
   - utm_medium=social
   - utm_campaign=masterclass_painting_2024

3. **Instagram:**
   - utm_source=instagram
   - utm_medium=social
   - utm_campaign=masterclass_painting_2024

4. **Email рассылка:**
   - utm_source=email
   - utm_medium=newsletter
   - utm_campaign=masterclass_painting_2024

5. **Партнерские ссылки:**
   - utm_source=partner_site
   - utm_medium=referral
   - utm_campaign=masterclass_painting_2024

**Рекомендации по отслеживанию:**
- Используйте Google Analytics для анализа эффективности
- Создайте отдельные цели для каждого канала
- Отслеживайте конверсию по UTM-меткам
- A/B тестируйте разные варианты utm_content`,
      tokensUsed: 280,
      cost: 0.056
    },
    COMPETITOR_ANALYSIS: {
      text: `Анализ конкурентов для "${prompt}":

**Топ-5 конкурентов в вашей нише:**

1. **"Творческая студия Арт"**
   - Цена: 1000₽
   - Сильные стороны: Опытные преподаватели, хорошие отзывы
   - Слабые стороны: Высокая цена, мало информации на сайте
   - Рекомендация: Конкурируйте ценой (900₽) и качеством контента

2. **"Детский центр Радуга"**
   - Цена: 800₽
   - Сильные стороны: Низкая цена, удобное расположение
   - Слабые стороны: Плохое качество фото, нет онлайн-записи
   - Рекомендация: Подчеркните качество и удобство записи

3. **"Студия рисования Карандаш"**
   - Цена: 1200₽
   - Сильные стороны: Премиум-позиционирование, качественные материалы
   - Слабые стороны: Высокая цена, ограниченное расписание
   - Рекомендация: Создайте средний сегмент (900₽) с хорошим качеством

**Ключевые инсайты:**
- Средняя цена: 1000₽
- Основные преимущества конкурентов: опыт, материалы, расположение
- Общие недостатки: плохой сайт, нет онлайн-записи, мало информации

**Ваши конкурентные преимущества:**
1. Современный сайт с онлайн-записью
2. Прозрачное ценообразование
3. Подробная информация о программе
4. Гибкое расписание
5. Качественные фото и видео

**Рекомендации по позиционированию:**
- "Современный подход к детскому творчеству"
- "Удобная онлайн-запись и оплата"
- "Прозрачные цены без скрытых доплат"
- "Опытные преподаватели с современными методиками"`,
      tokensUsed: 320,
      cost: 0.064
    },
    DESCRIPTION_GENERATION: {
      text: `Генерация описания для "${prompt}":

**SEO-оптимизированное описание:**

"Приглашаем детей 5-12 лет на увлекательный мастер-класс по рисованию! Наши опытные преподаватели помогут вашему ребенку раскрыть творческий потенциал и научат работать с различными художественными материалами.

**Что ждет на мастер-классе:**
• Изучение основ рисования акварелью и гуашью
• Развитие мелкой моторики и воображения
• Работа в дружной творческой атмосфере
• Создание собственной картины на память

**Преимущества нашего мастер-класса:**
✅ Индивидуальный подход к каждому ребенку
✅ Все необходимые материалы включены в стоимость
✅ Опытные преподаватели с педагогическим образованием
✅ Удобное расположение в центре города
✅ Возможность онлайн-записи и оплаты

**Программа занятия:**
1. Знакомство и разминка (15 мин)
2. Изучение техники рисования (30 мин)
3. Практическая работа над картиной (45 мин)
4. Презентация работ и обсуждение (15 мин)
5. Чаепитие и общение (15 мин)

**Что включено:**
- Работа преподавателя
- Все художественные материалы
- Памятная фотография
- Свидетельство участника
- Легкие закуски и чай

Записывайтесь прямо сейчас! Количество мест ограничено. Скидка 20% при записи за неделю до мероприятия."

**Ключевые слова для SEO:**
мастер-класс рисование дети, детское творчество, уроки рисования, художественная студия, развитие творческих способностей`,
      tokensUsed: 400,
      cost: 0.08
    }
  }

  return responses[type] || {
    text: `Ответ на ваш запрос "${prompt}" будет готов в ближайшее время.`,
    tokensUsed: 50,
    cost: 0.01
  }
}

// Получение истории запросов вендора
export async function getVendorAIHistory(vendorId: number, limit: number = 20) {
  return await prisma.aIAssistant.findMany({
    where: { vendorId },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}

// Получение рекомендаций для вендора
export async function getVendorRecommendations(vendorId: number) {
  return await prisma.aIRecommendation.findMany({
    where: { vendorId },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }]
  })
}

// Создание рекомендации
export async function createRecommendation(data: {
  vendorId: number
  listingId?: number
  type: string
  title: string
  description: string
  priority: number
}) {
  return await prisma.aIRecommendation.create({
    data
  })
}

// Применение рекомендации
export async function applyRecommendation(id: number) {
  return await prisma.aIRecommendation.update({
    where: { id },
    data: {
      isApplied: true,
      appliedAt: new Date()
    }
  })
}
