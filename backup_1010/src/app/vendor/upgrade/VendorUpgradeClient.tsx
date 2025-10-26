"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  User, 
  FileText, 
  CreditCard, 
  CheckCircle,
  AlertCircle,
  Info,
  Crown
} from 'lucide-react'
import OrganizationAutocomplete from '@/components/OrganizationAutocomplete'
import '@/styles/profile.css'
import { Unbounded } from 'next/font/google'

const unbounded = Unbounded({ 
  subsets: ['cyrillic', 'latin'],
  variable: '--font-unbounded',
  weight: ['300', '400', '500', '600', '700', '800', '900']
})

interface Vendor {
  id: number
  displayName: string
  type: 'START' | 'PRO'
  vendorRole?: {
    role: 'NPD' | 'IE' | 'LEGAL'
  }
}

interface VendorUpgradeClientProps {
  vendor: Vendor
}

export default function VendorUpgradeClient({ vendor }: VendorUpgradeClientProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    role: 'NPD' as 'NPD' | 'IE' | 'LEGAL',
    
    // Общие поля
    fullName: '',
    inn: '',
    address: '',
    bankAccount: '',
    bik: '',
    bankName: '',
    corrAccount: '',
    isVatPayer: false,
    vatRate: '',
    taxRegime: 'NPD' as 'NPD' | 'USN' | 'OSN' | 'PSN',
    
    // НПД
    selfEmployedInn: '',
    npdToken: '',
    npdRegion: '',
    
    // ИП
    orgnip: '',
    
    // ЮЛ
    companyName: '',
    kpp: '',
    orgn: '',
    legalAddress: '',
    actualAddress: '',
    directorName: '',
    directorPosition: '',
    representativeName: '',
    representativePosition: '',
    isRepresentative: false
  })

  const [organizationData, setOrganizationData] = useState<any>(null)

  const steps = [
    {
      id: 1,
      title: "Выберите тип",
      description: "Выберите тип вашей деятельности",
      icon: <Building2 className="w-6 h-6" />
    },
    {
      id: 2,
      title: "Основные данные",
      description: "Заполните основную информацию",
      icon: <User className="w-6 h-6" />
    },
    {
      id: 3,
      title: "Банковские реквизиты",
      description: "Укажите реквизиты для выплат",
      icon: <CreditCard className="w-6 h-6" />
    },
    {
      id: 4,
      title: "Завершение",
      description: "Проверьте данные и отправьте на модерацию",
      icon: <CheckCircle className="w-6 h-6" />
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/vendors/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        router.push('/vendor/dashboard')
      } else {
        const errorData = await response.json()
        alert(`Ошибка: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error upgrading vendor:', error)
      alert('Ошибка при апгрейде вендора')
    } finally {
      setLoading(false)
    }
  }

  const handleOrganizationSelect = (organization: unknown) => {
    setOrganizationData(organization)
    
    // Автозаполняем поля формы
    setFormData(prev => ({
      ...prev,
      companyName: (organization as any).name.short_without_opf || (organization as any).name.short || '',
      inn: (organization as any).inn || '',
      kpp: (organization as any).kpp || '',
      orgn: (organization as any).ogrn || '',
      legalAddress: (organization as any).address.full || '',
      actualAddress: (organization as any).address.full || '',
      directorName: (organization as any).management.name || '',
      directorPosition: (organization as any).management.post || '',
      fullName: (organization as any).management.name || '',
      address: (organization as any).address.full || ''
    }))
  }

  const handleOrganizationClear = () => {
    setOrganizationData(null)
    // Очищаем поля, которые были автозаполнены
    setFormData(prev => ({
      ...prev,
      companyName: '',
      inn: '',
      kpp: '',
      orgn: '',
      legalAddress: '',
      actualAddress: '',
      directorName: '',
      directorPosition: '',
      fullName: '',
      address: ''
    }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-unbounded-bold text-gray-900 mb-2">
                Переход на Vendor Pro
              </h2>
              <p className="text-gray-600 font-unbounded-regular">
                Получите доступ к продажам и выплатам
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.role === 'NPD' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'NPD' }))}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-unbounded-semibold text-gray-900 mb-2">
                    Самозанятый (НПД)
                  </h3>
                  <p className="text-sm text-gray-600 font-unbounded-regular">
                    Налог на профессиональный доход
                  </p>
                </div>
              </div>

              <div 
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.role === 'IE' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'IE' }))}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-unbounded-semibold text-gray-900 mb-2">
                    ИП
                  </h3>
                  <p className="text-sm text-gray-600 font-unbounded-regular">
                    Индивидуальный предприниматель
                  </p>
                </div>
              </div>

              <div 
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.role === 'LEGAL' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'LEGAL' }))}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-unbounded-semibold text-gray-900 mb-2">
                    ЮЛ
                  </h3>
                  <p className="text-sm text-gray-600 font-unbounded-regular">
                    Юридическое лицо (ООО, АО)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-unbounded-semibold text-yellow-900 mb-1">
                    Что дает Vendor Pro?
                  </h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Продажа билетов и товаров</li>
                    <li>• Получение выплат</li>
                    <li>• Статус "Официальный партнер"</li>
                    <li>• Доступ к аналитике продаж</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-unbounded-bold text-gray-900 mb-2">
                Основные данные
              </h2>
              <p className="text-gray-600 font-unbounded-regular">
                Заполните информацию в зависимости от выбранного типа
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ФИО *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Иванов Иван Иванович"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ИНН *
                </label>
                <input
                  type="text"
                  value={formData.inn}
                  onChange={(e) => setFormData(prev => ({ ...prev, inn: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123456789012"
                />
              </div>

              {formData.role === 'NPD' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ИНН самозанятого *
                    </label>
                    <input
                      type="text"
                      value={formData.selfEmployedInn}
                      onChange={(e) => setFormData(prev => ({ ...prev, selfEmployedInn: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123456789012"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Токен НПД
                    </label>
                    <input
                      type="text"
                      value={formData.npdToken}
                      onChange={(e) => setFormData(prev => ({ ...prev, npdToken: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Токен из приложения Мой налог"
                    />
                  </div>
                </>
              )}

              {formData.role === 'IE' && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Поиск ИП по ИНН
                    </label>
                    <OrganizationAutocomplete
                      onSelect={handleOrganizationSelect}
                      onClear={handleOrganizationClear}
                      placeholder="Введите ИНН ИП (12 цифр)"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Автоматически заполнит данные ИП
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ОГРНИП *
                    </label>
                    <input
                      type="text"
                      value={formData.orgnip}
                      onChange={(e) => setFormData(prev => ({ ...prev, orgnip: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123456789012345"
                    />
                  </div>
                </>
              )}

              {formData.role === 'LEGAL' && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Поиск организации по ИНН или ОГРН
                    </label>
                    <OrganizationAutocomplete
                      onSelect={handleOrganizationSelect}
                      onClear={handleOrganizationClear}
                      placeholder="Введите ИНН (10-12 цифр) или ОГРН (13 цифр)"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Автоматически заполнит данные организации
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Название организации *
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ООО Ромашка"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      КПП *
                    </label>
                    <input
                      type="text"
                      value={formData.kpp}
                      onChange={(e) => setFormData(prev => ({ ...prev, kpp: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ОГРН *
                    </label>
                    <input
                      type="text"
                      value={formData.orgn}
                      onChange={(e) => setFormData(prev => ({ ...prev, orgn: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234567890123"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Адрес
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="г. Москва, ул. Примерная, д. 1"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-unbounded-bold text-gray-900 mb-2">
                Банковские реквизиты
              </h2>
              <p className="text-gray-600 font-unbounded-regular">
                Укажите реквизиты для получения выплат
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Расчетный счет *
                </label>
                <input
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="40817810099910004312"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  БИК *
                </label>
                <input
                  type="text"
                  value={formData.bik}
                  onChange={(e) => setFormData(prev => ({ ...prev, bik: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="044525225"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название банка *
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ПАО Сбербанк"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Корреспондентский счет
                </label>
                <input
                  type="text"
                  value={formData.corrAccount}
                  onChange={(e) => setFormData(prev => ({ ...prev, corrAccount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="30101810400000000225"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Налоговый режим
                </label>
                <select
                  value={formData.taxRegime}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxRegime: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NPD">НПД</option>
                  <option value="USN">УСН</option>
                  <option value="OSN">ОСН</option>
                  <option value="PSN">ПСН</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isVatPayer"
                  checked={formData.isVatPayer}
                  onChange={(e) => setFormData(prev => ({ ...prev, isVatPayer: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isVatPayer" className="text-sm font-medium text-gray-700">
                  Плательщик НДС
                </label>
              </div>

              {formData.isVatPayer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ставка НДС (%)
                  </label>
                  <input
                    type="number"
                    value={formData.vatRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, vatRate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="20"
                  />
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-unbounded-bold text-gray-900 mb-2">
                Проверьте данные
              </h2>
              <p className="text-gray-600 font-unbounded-regular">
                Убедитесь, что все данные заполнены корректно
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-unbounded-semibold text-gray-900 mb-4">
                Сводка данных
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Тип:</span>
                  <span className="font-medium">
                    {formData.role === 'NPD' ? 'Самозанятый (НПД)' :
                     formData.role === 'IE' ? 'Индивидуальный предприниматель' :
                     'Юридическое лицо'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">ФИО:</span>
                  <span className="font-medium">{formData.fullName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">ИНН:</span>
                  <span className="font-medium">{formData.inn}</span>
                </div>
                
                {formData.role === 'IE' && formData.orgnip && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">ОГРНИП:</span>
                    <span className="font-medium">{formData.orgnip}</span>
                  </div>
                )}
                
                {formData.role === 'LEGAL' && formData.companyName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Организация:</span>
                    <span className="font-medium">{formData.companyName}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Банк:</span>
                  <span className="font-medium">{formData.bankName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Счет:</span>
                  <span className="font-medium">{formData.bankAccount}</span>
                </div>
              </div>
            </div>

            {/* Статус организации */}
            {organizationData && (
              <div className={`p-4 rounded-lg border ${
                organizationData.status.status === 'ACTIVE' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">
                    Статус организации
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    organizationData.status.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {organizationData.status.text}
                  </span>
                </div>
                <p className={`text-sm ${
                  organizationData.status.status === 'ACTIVE' 
                    ? 'text-green-800' 
                    : 'text-red-800'
                }`}>
                  {organizationData.status.description}
                </p>
                {organizationData.status.status !== 'ACTIVE' && (
                  <p className="mt-2 text-xs text-red-600">
                    ⚠️ Организации с таким статусом не могут быть зарегистрированы как вендоры
                  </p>
                )}
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-unbounded-semibold text-blue-900 mb-1">
                    Важно
                  </h4>
                  <p className="text-sm text-blue-800">
                    После отправки заявки ваши данные будут проверены модератором. 
                    Это может занять до 3 рабочих дней. После одобрения вы получите 
                    статус "Официальный партнер" и доступ к продажам.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.role
      case 2:
        const basicValid = formData.fullName && formData.inn
        // Если есть данные организации, проверяем статус
        if (organizationData) {
          return basicValid && organizationData.status.status === 'ACTIVE'
        }
        return basicValid
      case 3:
        return formData.bankAccount && formData.bik && formData.bankName
      case 4:
        // На последнем шаге проверяем, что организация активна (если есть данные)
        if (organizationData) {
          return organizationData.status.status === 'ACTIVE'
        }
        return true
      default:
        return false
    }
  }

  return (
    <div className={`min-h-screen bg-gray-50 py-12 ${unbounded.variable}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-unbounded-bold text-gray-900 mb-2">
            Переход на Vendor Pro
          </h1>
          <p className="text-lg text-gray-600 font-unbounded-regular">
            Получите доступ к продажам и выплатам
          </p>
        </div>

        {/* Прогресс */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Контент */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {renderStepContent()}

          {/* Кнопки навигации */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-unbounded-medium"
            >
              Назад
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-unbounded-medium"
              >
                Далее
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid() || loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-unbounded-medium"
              >
                {loading ? 'Отправка...' : 'Отправить на модерацию'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
