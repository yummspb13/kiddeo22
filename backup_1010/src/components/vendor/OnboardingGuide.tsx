// src/components/vendor/OnboardingGuide.tsx
"use client"

import { useState } from "react"
import { Check, Upload, Image, FileText, Globe, Phone, MapPin, Star } from "lucide-react"

interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
  required: boolean
}

interface OnboardingGuideProps {
  currentStep: number
  completedSteps: number[]
  onStepComplete: (stepId: number) => void
  onComplete: () => void
}

const ONBOARDING_STEPS: Omit<OnboardingStep, 'completed'>[] = [
  {
    id: 1,
    title: "Загрузите логотип",
    description: "Добавьте логотип вашей компании для лучшего узнавания",
    icon: <Image className="w-6 h-6" />,
    required: true
  },
  {
    id: 2,
    title: "Заполните описание",
    description: "Расскажите о вашей компании и услугах",
    icon: <FileText className="w-6 h-6" />,
    required: true
  },
  {
    id: 3,
    title: "Добавьте контакты",
    description: "Укажите телефон, email и адрес",
    icon: <Phone className="w-6 h-6" />,
    required: true
  },
  {
    id: 4,
    title: "Создайте галерею",
    description: "Загрузите фото и видео ваших услуг",
    icon: <Upload className="w-6 h-6" />,
    required: false
  },
  {
    id: 5,
    title: "Настройте сайт",
    description: "Добавьте ссылку на ваш сайт или соцсети",
    icon: <Globe className="w-6 h-6" />,
    required: false
  },
  {
    id: 6,
    title: "Выберите тариф",
    description: "Подберите подходящий план для вашего бизнеса",
    icon: <Star className="w-6 h-6" />,
    required: true
  }
]

export default function OnboardingGuide({ 
  currentStep, 
  completedSteps, 
  onStepComplete, 
  onComplete 
}: OnboardingGuideProps) {
  const [isCompleting, setIsCompleting] = useState(false)

  const steps = ONBOARDING_STEPS.map(step => ({
    ...step,
    completed: completedSteps.includes(step.id)
  }))

  const completedCount = completedSteps.length
  const requiredSteps = steps.filter(step => step.required)
  const completedRequired = requiredSteps.filter(step => step.completed).length
  const canComplete = completedRequired === requiredSteps.length

  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      await onComplete()
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Добро пожаловать в KidsReview!</h2>
        <p className="text-gray-600 mb-4">
          Пройдите быструю настройку профиля, чтобы начать привлекать клиентов
        </p>
        
        {/* Прогресс-бар */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>Прогресс: {completedCount} из {steps.length}</span>
          <span>{Math.round((completedCount / steps.length) * 100)}%</span>
        </div>
      </div>

      {/* Список шагов */}
      <div className="space-y-4 mb-6">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start p-4 rounded-lg border transition-all ${
              step.completed
                ? 'bg-green-50 border-green-200'
                : step.id === currentStep
                ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              step.completed
                ? 'bg-green-500 text-white'
                : step.id === currentStep
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}>
              {step.completed ? (
                <Check className="w-5 h-5" />
              ) : (
                step.icon
              )}
            </div>
            
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className={`font-medium ${
                  step.completed ? 'text-green-800' : 'text-gray-900'
                }`}>
                  {step.title}
                  {step.required && (
                    <span className="ml-2 text-red-500 text-xs">*</span>
                  )}
                </h3>
                {step.completed && (
                  <span className="text-green-600 text-sm font-medium">
                    Выполнено
                  </span>
                )}
              </div>
              <p className={`text-sm ${
                step.completed ? 'text-green-600' : 'text-gray-600'
              }`}>
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Кнопка завершения */}
      {canComplete && (
        <div className="flex justify-end">
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompleting ? 'Завершаем...' : 'Завершить настройку'}
          </button>
        </div>
      )}

      {/* Информация о следующих шагах */}
      {!canComplete && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Следующие шаги:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {steps
              .filter(step => !step.completed && step.required)
              .slice(0, 2)
              .map(step => (
                <li key={step.id}>• {step.title}</li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}
