// src/lib/seed-tariffs.ts
import prisma from "@/lib/db"

export async function seedTariffPlans() {
  const plans = [
    {
      name: "Бесплатный",
      tariff: "FREE" as const,
      price: 0,
      features: [
        "До 3 объявлений",
        "Базовая аналитика",
        "Поддержка по email",
        "Мобильное приложение"
      ],
      maxListings: 3,
      isActive: true
    },
    {
      name: "Базовый",
      tariff: "BASIC" as const,
      price: 69000, // 690 рублей в копейках
      features: [
        "До 20 объявлений",
        "Расширенная аналитика",
        "Приоритетная поддержка",
        "Продвижение в поиске",
        "Мобильное приложение",
        "API доступ"
      ],
      maxListings: 20,
      isActive: true
    },
    {
      name: "Премиум",
      tariff: "PREMIUM" as const,
      price: 99000, // 990 рублей в копейках
      features: [
        "Безлимитные объявления",
        "Полная аналитика",
        "Персональный менеджер",
        "Топ-позиции в поиске",
        "Мобильное приложение",
        "API доступ",
        "Интеграции с CRM",
        "Кастомные отчеты"
      ],
      maxListings: null,
      isActive: true
    }
  ]

  for (const plan of plans) {
    try {
      await prisma.vendorTariffPlan.create({
        data: plan
      })
    } catch (error) {
      // Plan already exists, skip
      console.log(`Tariff plan ${plan.tariff} already exists`)
    }
  }

  console.log("Tariff plans seeded successfully")
}
