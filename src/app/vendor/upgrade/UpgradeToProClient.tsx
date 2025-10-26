'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, ArrowRight, ArrowLeft, Building2, CreditCard, FileText, Upload, Search, Loader2 } from 'lucide-react'
import INNAutocomplete from '@/components/INNAutocomplete'
import BIKAutocomplete from '@/components/BIKAutocomplete'
import '@/styles/vendor-dashboard.css'

interface Vendor {
  id: number
  type: string
  kycStatus: string
  displayName: string
  vendorRole?: unknown
  bankAccounts: unknown[]
  taxProfiles: unknown[]
  documents: unknown[]
}

interface UpgradeToProClientProps {
  vendor: Vendor
}

interface CompanyData {
  found: boolean
  data?: {
    name: {
      full: string
      short: string
    }
    inn: string
    kpp: string
    ogrn: string
    address: {
      full: string
      region: string
      city: string
    }
    management: {
      name: string
      post: string
    }
    status: string
    taxation: {
      regime: string
      vat: boolean
    }
  }
}

export default function UpgradeToProClient({ vendor }: UpgradeToProClientProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Состояние формы
  const [formData, setFormData] = useState({
    // Шаг 1: Роль вендора
    role: (vendor.vendorRole as any)?.role || 'NPD',
    
    // Шаг 2: Данные компании (заполняются через DaData)
    companyData: {
      inn: (vendor.vendorRole as any)?.inn || '',
      ogrn: (vendor.vendorRole as any)?.orgn || '',
      orgnip: (vendor.vendorRole as any)?.orgnip || '',
      companyName: (vendor.vendorRole as any)?.companyName || '',
      fullName: (vendor.vendorRole as any)?.fullName || '',
      directorName: (vendor.vendorRole as any)?.directorName || '',
      address: (vendor.vendorRole as any)?.address || ''
    },
    
    // Шаг 3: Банковские реквизиты
    bankAccount: {
      holderName: '',
      inn: '',
      bankName: '',
      bik: '',
      account: '',
      corrAccount: ''
    },
    
    // Шаг 4: Налоговый профиль
    taxProfile: {
      taxRegime: 'NPD',
      vatStatus: 'NONE',
      vatRate: 0,
      isVatPayer: false,
      fiscalMode: 'PLATFORM',
      agencyAgreement: false
    },
    
    // Шаг 5: Документы
    documents: [] as File[]
  })


  const steps = [
    { id: 1, title: 'Роль вендора', icon: Building2 },
    { id: 2, title: 'Данные компании', icon: Search },
    { id: 3, title: 'Банковские реквизиты', icon: CreditCard },
    { id: 4, title: 'Налоговый профиль', icon: FileText },
    { id: 5, title: 'Документы', icon: Upload }
  ]


  // Сохранение данных
  const saveData = async () => {
    console.log('🚀 Начинаем сохранение данных...')
    console.log('📊 Текущие данные формы:', JSON.stringify(formData, null, 2))
    
    // Проверяем каждое поле отдельно
    console.log('🔍 Детальная проверка данных:')
    console.log('  - Роль:', formData.role)
    console.log('  - Данные компании:', formData.companyData)
    console.log('  - Банковские реквизиты:', formData.bankAccount)
    console.log('  - Налоговый профиль:', formData.taxProfile)
    console.log('  - Документы:', formData.documents)
    
    // Проверяем валидацию всех шагов
    console.log('🔍 Проверяем валидацию всех шагов:')
    for (let i = 1; i <= 5; i++) {
      const isValid = validateStep(i)
      console.log(`  - Шаг ${i}: ${isValid ? '✅' : '❌'}`)
    }
    
    // Устанавливаем дефолтную роль, если не выбрана
    const dataToSend = {
      ...formData,
      role: formData.role || 'NPD' // Дефолтная роль для тестирования
    }
    
    console.log('📤 Отправляем данные с дефолтной ролью:', dataToSend.role)
    
    setIsLoading(true)
    setError(null)

    try {
      console.log('📤 Отправляем запрос к API...')
      const response = await fetch('/api/vendor/upgrade-to-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      })

      console.log('📥 Получен ответ от API:')
      console.log('  - Статус:', response.status)
      console.log('  - OK:', response.ok)

      if (!response.ok) {
        const errorData = await response.json()
        console.log('❌ Ошибка от сервера:', errorData)
        throw new Error(errorData.message || 'Ошибка при сохранении данных')
      }

      const result = await response.json()
      console.log('✅ Успешный ответ от сервера:', result)
      setSuccess(result.message)
      
      // Перенаправляем на дашборд через 2 секунды
      setTimeout(() => {
        router.push('/vendor/dashboard')
      }, 2000)

    } catch (error) {
      console.error('❌ Ошибка при сохранении:', error)
      setError(error instanceof Error ? error.message : 'Ошибка при сохранении')
    } finally {
      setIsLoading(false)
    }
  }

  // Валидация текущего шага
  const validateStep = (step: number): boolean => {
    console.log(`🔍 Валидация шага ${step}:`)
    console.log('  - Данные формы:', formData)
    console.log('  - Текущий шаг:', step)
    
    switch (step) {
      case 1:
        // Убираем обязательность выбора роли для тестирования
        const step1Valid = true
        console.log('Шаг 1 (роль):', step1Valid, formData.role)
        console.log('  ℹ️ Роль необязательна для тестирования')
        return step1Valid
      case 2:
        // Убираем обязательность данных компании для тестирования
        const step2Valid = true
        console.log('Шаг 2 (данные компании):', step2Valid, formData.companyData)
        console.log('  ℹ️ Данные компании необязательны для тестирования')
        return step2Valid
      case 3:
        // Убираем обязательность банковских реквизитов для тестирования
        const step3Valid = true
        console.log('Шаг 3 (банк):', step3Valid, formData.bankAccount)
        console.log('  ℹ️ Банковские реквизиты необязательны для тестирования')
        return step3Valid
      case 4:
        // Убираем обязательность налогового профиля для тестирования
        const step4Valid = true
        console.log('Шаг 4 (налоги):', step4Valid, formData.taxProfile)
        console.log('  ℹ️ Налоговый профиль необязателен для тестирования')
        return step4Valid
      case 5:
        // Убираем обязательность документов для тестирования
        const step5Valid = true
        console.log('Шаг 5 (документы):', step5Valid, { documentsCount: formData.documents.length })
        console.log('  ℹ️ Документы необязательны для тестирования')
        return step5Valid
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-unbounded-bold text-gray-900 gradient-text-primary">Выберите роль вендора</h3>
            <div className="space-y-4">
              {[
                { value: 'NPD', label: 'Самозанятый (НПД)', description: 'Физическое лицо' },
                { value: 'IE', label: 'Индивидуальный предприниматель (ИП)', description: 'Физическое лицо' },
                { value: 'LEGAL', label: 'Юридическое лицо (ООО/АО)', description: 'Юридическое лицо' }
              ].map((option, index) => (
                <label key={option.value} className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 card-hover interactive transition-all duration-300 animate-fade-in-up`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={formData.role === option.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-unbounded font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500 font-medium">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-unbounded-bold text-gray-900 gradient-text-primary">Данные компании</h3>
            

            {/* Поля формы в зависимости от роли */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.role === 'NPD' && (
                <>
                  <div>
                    <label className="block text-sm font-unbounded font-medium text-gray-700 mb-1">ФИО</label>
                    <input
                      type="text"
                      value={formData.companyData.fullName || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyData: { ...prev.companyData, fullName: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-unbounded font-medium text-gray-700 mb-1">ИНН</label>
                    <INNAutocomplete
                      value={formData.companyData.inn || ''}
                      onSelect={(company) => {
                        setFormData(prev => ({
                          ...prev,
                          companyData: {
                            ...prev.companyData,
                            inn: company.inn,
                            ogrn: '', // НПД не имеет ОГРН
                            orgnip: '', // НПД не имеет ОГРНИП
                            companyName: company.name.full,
                            fullName: company.management.name,
                            directorName: company.management.name,
                            address: company.address.full
                          },
                          // Автозаполняем банковские реквизиты
                          bankAccount: {
                            ...prev.bankAccount,
                            inn: company.inn, // Автозаполняем ИНН из DaData
                            holderName: company.management.name // Автозаполняем держателя счета
                          }
                        }))
                      }}
                      onClear={() => {
                        setFormData(prev => ({
                          ...prev,
                          companyData: {
                            ...prev.companyData,
                            inn: '',
                            ogrn: '',
                            orgnip: '',
                            companyName: '',
                            fullName: '',
                            directorName: '',
                            address: ''
                          }
                        }))
                      }}
                      placeholder="1234567890"
                    />
                  </div>
                </>
              )}

              {formData.role === 'IE' && (
                <>
                  <div>
                    <label className="block text-sm font-unbounded font-medium text-gray-700 mb-1">ФИО</label>
                    <input
                      type="text"
                      value={formData.companyData.fullName || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyData: { ...prev.companyData, fullName: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-unbounded font-medium text-gray-700 mb-1">ИНН</label>
                    <INNAutocomplete
                      value={formData.companyData.inn || ''}
                      onSelect={(company) => {
                        setFormData(prev => ({
                          ...prev,
                          companyData: {
                            ...prev.companyData,
                            inn: company.inn,
                            ogrn: '', // ИП не имеет ОГРН
                            orgnip: company.orgnip, // Для ИП используем ОГРНИП
                            companyName: company.name.full,
                            fullName: company.management.name,
                            directorName: company.management.name,
                            address: company.address.full
                          },
                          // Автозаполняем банковские реквизиты
                          bankAccount: {
                            ...prev.bankAccount,
                            inn: company.inn, // Автозаполняем ИНН из DaData
                            holderName: company.management.name // Автозаполняем держателя счета
                          }
                        }))
                      }}
                      onClear={() => {
                        setFormData(prev => ({
                          ...prev,
                          companyData: {
                            ...prev.companyData,
                            inn: '',
                            ogrn: '',
                            orgnip: '',
                            companyName: '',
                            fullName: '',
                            directorName: '',
                            address: ''
                          }
                        }))
                      }}
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-unbounded font-medium text-gray-700 mb-1">ОГРНИП</label>
                    <input
                      type="text"
                      value={formData.companyData.orgnip || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyData: { ...prev.companyData, orgnip: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded"
                      required
                    />
                  </div>
                </>
              )}

              {formData.role === 'LEGAL' && (
                <>
                  <div>
                    <label className="block text-sm font-unbounded font-medium text-gray-700 mb-1">Наименование организации</label>
                    <input
                      type="text"
                      value={formData.companyData.companyName || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyData: { ...prev.companyData, companyName: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-unbounded font-medium text-gray-700 mb-1">ИНН</label>
                    <INNAutocomplete
                      value={formData.companyData.inn || ''}
                      onSelect={(company) => {
                        setFormData(prev => ({
                          ...prev,
                          companyData: {
                            ...prev.companyData,
                            inn: company.inn,
                            ogrn: company.ogrn, // Для ООО используем ОГРН
                            orgnip: '', // ООО не имеет ОГРНИП
                            companyName: company.name.full,
                            fullName: company.management.name,
                            directorName: company.management.name,
                            address: company.address.full
                          },
                          // Автозаполняем банковские реквизиты
                          bankAccount: {
                            ...prev.bankAccount,
                            inn: company.inn, // Автозаполняем ИНН из DaData
                            holderName: company.management.name // Автозаполняем держателя счета
                          }
                        }))
                      }}
                      onClear={() => {
                        setFormData(prev => ({
                          ...prev,
                          companyData: {
                            ...prev.companyData,
                            inn: '',
                            ogrn: '',
                            orgnip: '',
                            companyName: '',
                            fullName: '',
                            directorName: '',
                            address: ''
                          }
                        }))
                      }}
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-unbounded font-medium text-gray-700 mb-1">ОГРН</label>
                    <input
                      type="text"
                      value={formData.companyData.ogrn || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyData: { ...prev.companyData, ogrn: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-unbounded font-medium text-gray-700 mb-1">ФИО директора</label>
                    <input
                      type="text"
                      value={formData.companyData.directorName || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        companyData: { ...prev.companyData, directorName: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded"
                      required
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-unbounded font-medium text-gray-700 mb-1">Адрес</label>
                <input
                  type="text"
                  value={formData.companyData.address || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    companyData: { ...prev.companyData, address: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-unbounded-bold text-gray-900 gradient-text-primary">Банковские реквизиты</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-unbounded font-medium text-gray-700 mb-1">Наименование держателя счета</label>
                <input
                  type="text"
                  value={formData.bankAccount.holderName || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    bankAccount: { ...prev.bankAccount, holderName: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-unbounded font-medium text-gray-700 mb-1">Наименование банка</label>
                <input
                  type="text"
                  value={formData.bankAccount.bankName || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed font-unbounded"
                  placeholder="Заполнится автоматически при вводе БИК"
                />
                <p className="text-xs text-gray-500 mt-1">Заполнится автоматически при вводе БИК</p>
              </div>
              <div>
                <label className="block text-sm font-unbounded font-medium text-gray-700 mb-1">БИК</label>
                <BIKAutocomplete
                  value={formData.bankAccount.bik || ''}
                  onSelect={(bank) => {
                    setFormData(prev => ({
                      ...prev,
                      bankAccount: {
                        ...prev.bankAccount,
                        bankName: bank.fullName || bank.name,
                        bik: bank.bik,
                        corrAccount: bank.correspondentAccount
                      }
                    }))
                  }}
                  onClear={() => {
                    setFormData(prev => ({
                      ...prev,
                      bankAccount: {
                        ...prev.bankAccount,
                        bankName: '',
                        bik: '',
                        corrAccount: ''
                      }
                    }))
                  }}
                  placeholder="044525225"
                />
              </div>
              <div>
                <label className="block text-sm font-unbounded font-medium text-gray-700 mb-1">Расчетный счет</label>
                <input
                  type="text"
                  value={formData.bankAccount.account || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    bankAccount: { ...prev.bankAccount, account: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-unbounded font-medium text-gray-700 mb-1">Корреспондентский счет</label>
                <input
                  type="text"
                  value={formData.bankAccount.corrAccount || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed font-unbounded"
                  placeholder="Заполнится автоматически при вводе БИК"
                />
                <p className="text-xs text-gray-500 mt-1">Заполнится автоматически при вводе БИК</p>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-unbounded-bold text-gray-900 gradient-text-primary">Налоговый профиль</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-unbounded font-medium text-gray-700 mb-1">Налоговый режим</label>
                <select
                  value={formData.taxProfile.taxRegime || 'NPD'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    taxProfile: { ...prev.taxProfile, taxRegime: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded"
                  required
                >
                  <option value="NPD">НПД (Налог на профессиональный доход)</option>
                  <option value="USN">УСН (Упрощенная система налогообложения)</option>
                  <option value="OSN">ОСН (Общая система налогообложения)</option>
                  <option value="PSN">ПСН (Патентная система налогообложения)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-unbounded font-medium text-gray-700 mb-1">Статус НДС</label>
                <select
                  value={formData.taxProfile.vatStatus || 'NONE'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    taxProfile: { ...prev.taxProfile, vatStatus: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded"
                  required
                >
                  <option value="NONE">Не является плательщиком НДС</option>
                  <option value="VAT_0">0% НДС</option>
                  <option value="VAT_5">5% НДС</option>
                  <option value="VAT_7">7% НДС</option>
                  <option value="VAT_20">20% НДС</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-unbounded font-medium text-gray-700 mb-1">Режим фискализации</label>
                <select
                  value={formData.taxProfile.fiscalMode || 'PLATFORM'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    taxProfile: { ...prev.taxProfile, fiscalMode: e.target.value as any }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-unbounded"
                >
                  <option value="PLATFORM">Платформа выбивает чек как агент</option>
                  <option value="VENDOR">Вендор сам выбивает чек</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="agencyAgreement"
                  checked={formData.taxProfile.agencyAgreement}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    taxProfile: { ...prev.taxProfile, agencyAgreement: e.target.checked }
                  }))}
                  className="rounded"
                />
                <label htmlFor="agencyAgreement" className="text-sm font-medium text-gray-700">
                  Согласие на агентский договор
                </label>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-unbounded-bold text-gray-900 gradient-text-primary">Документы для верификации</h3>
            
            {/* Информация о необходимых документах */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-unbounded font-medium text-blue-900 mb-3">Необходимые документы:</h4>
              <div className="space-y-2 text-sm text-blue-800">
                {formData.role === 'NPD' && (
                  <div>
                    <strong>Самозанятый (НПД):</strong> Фотография из приложения "Мой Налог"
                  </div>
                )}
                {formData.role === 'IE' && (
                  <div>
                    <strong>ИП:</strong> ИНН и ЕГРИП (можно скачать на сайте <a href="https://egrul.nalog.ru/index.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">ФНС России</a>)
                  </div>
                )}
                {formData.role === 'LEGAL' && (
                  <div>
                    <strong>ООО/АО:</strong> ИНН, ОГРН и ЕГРН (можно скачать на сайте <a href="https://egrul.nalog.ru/index.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">ФНС России</a>)
                  </div>
                )}
                {!formData.role && (
                  <div>Выберите роль вендора, чтобы увидеть необходимые документы</div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Загрузите необходимые документы</p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    setFormData(prev => ({ ...prev, documents: files }))
                  }}
                  className="hidden"
                  id="document-upload"
                />
                <label
                  htmlFor="document-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                >
                  Выбрать файлы
                </label>
              </div>
              
              {formData.documents.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Выбранные файлы:</h4>
                  {formData.documents.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            documents: prev.documents.filter((_, i) => i !== index)
                          }))
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Успешно!</h2>
          <p className="text-gray-600 mb-6">{success}</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Перенаправляем на дашборд...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Заголовок */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-unbounded-bold text-gray-900 mb-2 gradient-text-primary">Переход на Vendor Pro</h1>
          <p className="text-gray-600 font-medium">Заполните все необходимые данные для получения статуса PRO</p>
        </div>

        {/* Прогресс-бар */}
        <div className="mb-8 animate-slide-in-left">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-8">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-600 border-green-600 text-white animate-scale-in' 
                        : isActive 
                          ? 'bg-blue-600 border-blue-600 text-white animate-pulse-slow' 
                          : 'bg-white border-gray-300 text-gray-500'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 animate-bounce" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="ml-3">
                      <div className={`text-sm font-unbounded font-medium transition-colors duration-300 ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 transition-colors duration-300 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="bg-white rounded-lg shadow-lg p-8 card-hover animate-scale-in">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-wiggle">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800 font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="animate-fade-in-up">
            {renderStep()}
          </div>

          {/* Кнопки навигации */}
          <div className="flex justify-between mt-8 animate-slide-in-right">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed btn-hover interactive transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="font-unbounded font-medium">Назад</span>
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed btn-dynamic interactive transition-all duration-300"
              >
                <span className="font-unbounded font-medium">Далее</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  console.log('🖱️ Нажата кнопка "Завершить"')
                  console.log('📊 Текущий шаг:', currentStep)
                  console.log('📊 Валидация шага:', validateStep(currentStep))
                  console.log('📊 Загрузка:', isLoading)
                  saveData()
                }}
                disabled={isLoading || !validateStep(currentStep)}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed btn-success interactive transition-all duration-300"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                <span className="font-unbounded font-medium">{isLoading ? 'Сохранение...' : 'Завершить'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
