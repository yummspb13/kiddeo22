'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Eye, EyeOff, Trash2, Wrench, Users, FileText, Clock } from 'lucide-react'
import { safeArray } from '@/lib/api-utils'

interface VenueVendor {
  id: number
  vendorId: number
  type: 'INDIVIDUAL' | 'INDIVIDUAL_ENTREPRENEUR' | 'LEGAL_ENTITY' | 'SELF_EMPLOYED'
  status: 'ACTIVE' | 'PENDING' | 'INCOMPLETE' | 'DELETED'
  documentsStatus: 'CHECKED' | 'PENDING' | 'NONE'
  documentsChecked: boolean
  documentsCheckedAt?: string
  createdAt: string
  // Общие поля профиля вендора
  fullName?: string
  inn?: string
  orgnip?: string
  bankAccount?: string
  bik?: string
  address?: string
  isVatPayer?: boolean | null
  vatRate?: string | number | null
  egryulDocument?: string | null
  representativeName?: string
  representativePosition?: string
  isRepresentative?: boolean | null
  // Поля для ЮЛ
  companyName?: string
  kpp?: string
  orgn?: string
  legalAddress?: string
  actualAddress?: string
  directorName?: string
  directorPosition?: string
  // Поля для самозанятого
  selfEmployedInn?: string
  // Согласие с документами
  agreementAccepted?: boolean
  vendor: {
    id: number
    displayName: string
    cityId: number
    city: {
      id: number
      name: string
    }
  }
  users: Array<{
    id: number
    user: {
      id: number
      name: string
      email: string
      createdAt: string
      lastLoginAt?: string
    }
  }>
  partnersCount: number
  daysUntilDeletion?: number
}

interface User {
  id: number
  name: string
  email: string
  createdAt: string
  lastLoginAt?: string
}

export default function VenueVendorsClient() {
  const [vendors, setVendors] = useState<VenueVendor[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingVendor, setEditingVendor] = useState<VenueVendor | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [moderationComment, setModerationComment] = useState('')
  const [editFormData, setEditFormData] = useState<any>({})
  const [editEgryulDocument, setEditEgryulDocument] = useState<File | null>(null)
  const [showModerationModal, setShowModerationModal] = useState(false)
  const [moderationVendor, setModerationVendor] = useState<VenueVendor | null>(null)
  const [moderationReason, setModerationReason] = useState('')
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Форма создания вендора
  const [createFormData, setCreateFormData] = useState({
    type: 'INDIVIDUAL_ENTREPRENEUR' as 'INDIVIDUAL_ENTREPRENEUR' | 'LEGAL_ENTITY' | 'SELF_EMPLOYED',
    fullName: '',
    inn: '',
    orgnip: '',
    bankAccount: '',
    bik: '',
    address: '',
    isVatPayer: false,
    vatRate: '',
    egryulDocument: null as File | null,
    representativeName: '',
    representativePosition: '',
    isRepresentative: false,
    // Для ЮЛ
    companyName: '',
    kpp: '',
    orgn: '',
    legalAddress: '',
    actualAddress: '',
    directorName: '',
    directorPosition: '',
    // Для Самозанятого
    selfEmployedInn: '',
    // Согласие с документами
    agreementAccepted: false
  })

  // Ошибки валидации
  const [createFormErrors, setCreateFormErrors] = useState<Record<string, string>>({})
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({})

  // Функции валидации
  const validateCreateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (createFormData.type === 'INDIVIDUAL_ENTREPRENEUR') {
      if (!createFormData.fullName.trim()) errors.fullName = 'ФИО обязательно'
      if (!createFormData.inn.trim()) errors.inn = 'ИНН обязательно'
      if (!createFormData.orgnip.trim()) errors.orgnip = 'ОГРНИП обязательно'
      if (createFormData.inn && !/^\d{12}$/.test(createFormData.inn)) {
        errors.inn = 'ИНН должен содержать 12 цифр'
      }
      if (createFormData.orgnip && !/^\d{15}$/.test(createFormData.orgnip)) {
        errors.orgnip = 'ОГРНИП должен содержать 15 цифр'
      }
    } else if (createFormData.type === 'LEGAL_ENTITY') {
      if (!createFormData.companyName.trim()) errors.companyName = 'Наименование компании обязательно'
      if (!createFormData.inn.trim()) errors.inn = 'ИНН обязательно'
      if (!createFormData.kpp.trim()) errors.kpp = 'КПП обязательно'
      if (!createFormData.orgn.trim()) errors.orgn = 'ОГРН обязательно'
      if (!createFormData.legalAddress.trim()) errors.legalAddress = 'Юридический адрес обязателен'
      if (!createFormData.directorName.trim()) errors.directorName = 'ФИО руководителя обязательно'
      if (createFormData.inn && !/^\d{10}$/.test(createFormData.inn)) {
        errors.inn = 'ИНН должен содержать 10 цифр'
      }
      if (createFormData.kpp && !/^\d{9}$/.test(createFormData.kpp)) {
        errors.kpp = 'КПП должен содержать 9 цифр'
      }
      if (createFormData.orgn && !/^\d{13}$/.test(createFormData.orgn)) {
        errors.orgn = 'ОГРН должен содержать 13 цифр'
      }
    } else if (createFormData.type === 'SELF_EMPLOYED') {
      if (!createFormData.fullName.trim()) errors.fullName = 'ФИО обязательно'
      if (!createFormData.selfEmployedInn.trim()) errors.selfEmployedInn = 'ИНН самозанятого обязательно'
      if (createFormData.selfEmployedInn && !/^\d{12}$/.test(createFormData.selfEmployedInn)) {
        errors.selfEmployedInn = 'ИНН самозанятого должен содержать 12 цифр'
      }
    }
    
    if (!createFormData.agreementAccepted) {
      errors.agreementAccepted = 'Необходимо согласие с документами'
    }
    
    setCreateFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateEditForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (editFormData.type === 'INDIVIDUAL_ENTREPRENEUR') {
      if (!editFormData.fullName.trim()) errors.fullName = 'ФИО обязательно'
      if (!editFormData.inn.trim()) errors.inn = 'ИНН обязательно'
      if (!editFormData.orgnip.trim()) errors.orgnip = 'ОГРНИП обязательно'
    } else if (editFormData.type === 'LEGAL_ENTITY') {
      if (!editFormData.companyName.trim()) errors.companyName = 'Наименование компании обязательно'
      if (!editFormData.inn.trim()) errors.inn = 'ИНН обязательно'
      if (!editFormData.kpp.trim()) errors.kpp = 'КПП обязательно'
      if (!editFormData.orgn.trim()) errors.orgn = 'ОГРН обязательно'
      if (!editFormData.legalAddress.trim()) errors.legalAddress = 'Юридический адрес обязателен'
      if (!editFormData.directorName.trim()) errors.directorName = 'ФИО руководителя обязательно'
    } else if (editFormData.type === 'SELF_EMPLOYED') {
      if (!editFormData.fullName.trim()) errors.fullName = 'ФИО обязательно'
      if (!editFormData.selfEmployedInn.trim()) errors.selfEmployedInn = 'ИНН самозанятого обязательно'
    }
    
    setEditFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Сортировка и фильтрация
  const [sortField, setSortField] = useState<keyof VenueVendor>('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [selectedCityIds, setSelectedCityIds] = useState<number[]>([])
  const [showCityFilter, setShowCityFilter] = useState(false)
  const [cities, setCities] = useState<Array<{ id: number; name: string }>>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [vendorsRes, usersRes, citiesRes] = await Promise.all([
        fetch('/api/admin/venues/vendors'),
        fetch('/api/users'),
        fetch('/api/cities')
      ])

      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json()
        // API возвращает объект с полем vendors, извлекаем массив
        setVendors(vendorsData.vendors || [])
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }

      if (citiesRes.ok) {
        const citiesData = await citiesRes.json()
        setCities(safeArray(citiesData))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600'
      case 'PENDING':
        return 'text-yellow-600'
      case 'INCOMPLETE':
        return 'text-gray-600'
      case 'DELETED':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Активен'
      case 'PENDING':
        return 'На модерации'
      case 'INCOMPLETE':
        return 'Не заполнил'
      case 'DELETED':
        return 'Удален'
      default:
        return status
    }
  }

  const getDocumentsStatusColor = (status: string) => {
    switch (status) {
      case 'CHECKED':
        return 'text-green-600'
      case 'PENDING':
        return 'text-yellow-600'
      case 'NONE':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getDocumentsStatusText = (status: string) => {
    switch (status) {
      case 'CHECKED':
        return 'Проверены'
      case 'PENDING':
        return 'На проверке'
      case 'NONE':
        return 'Нет'
      default:
        return status
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'INDIVIDUAL':
      case 'INDIVIDUAL_ENTREPRENEUR':
        return 'Индивидуальный предприниматель'
      case 'LEGAL_ENTITY':
        return 'Юридическое лицо'
      case 'SELF_EMPLOYED':
        return 'Самозанятый'
      default:
        return type
    }
  }

  const getDaysUntilDeletionColor = (days?: number) => {
    if (!days) return 'text-green-600'
    if (days <= 5) return 'text-red-600'
    if (days <= 30) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getDaysUntilDeletionText = (days?: number) => {
    if (!days) return 'None'
    return `${days} дней`
  }

  const handleSort = (field: keyof VenueVendor) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleCityFilter = (cityId: number) => {
    setSelectedCityIds(prev => 
      prev.includes(cityId) 
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId]
    )
  }

  const clearCityFilter = () => {
    setSelectedCityIds([])
  }

  const getFilteredAndSortedVendors = () => {
    // Проверяем, что vendors является массивом
    if (!Array.isArray(vendors)) {
      console.warn('vendors is not an array in getFilteredAndSortedVendors:', vendors)
      return []
    }

    let filtered = [...vendors] // Создаем копию массива

    // Фильтрация по городам
    if (selectedCityIds.length > 0) {
      filtered = filtered.filter(vendor => selectedCityIds.includes(vendor.vendor.cityId))
    }

    // Сортировка
    filtered.sort((a, b) => {
      let aValue: unknown = a[sortField]
      let bValue: unknown = b[sortField]

      if (sortField === 'vendor') {
        aValue = a.vendor.displayName
        bValue = b.vendor.displayName
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }

  const getCityVendorCounts = () => {
    const counts: Record<number, { active: number; pending: number; incomplete: number; deleted: number }> = {}
    
    // Проверяем, что vendors является массивом
    if (!Array.isArray(vendors)) {
      console.warn('vendors is not an array:', vendors)
      return counts
    }
    
    vendors.forEach(vendor => {
      const cityId = vendor.vendor.cityId
      if (!counts[cityId]) {
        counts[cityId] = { active: 0, pending: 0, incomplete: 0, deleted: 0 }
      }
      counts[cityId][vendor.status.toLowerCase() as keyof typeof counts[number]]++
    })
    
    return counts
  }

  const handleModerationClick = (vendor: VenueVendor) => {
    setModerationVendor(vendor)
    setModerationReason('')
    setShowModerationModal(true)
  }

  const handleModerationAction = async (action: 'approve' | 'reject' | 'send_for_correction') => {
    if (!moderationVendor) return

    try {
      const response = await fetch(`/api/admin/venues/vendors/${moderationVendor.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action === 'approve' ? 'ACTIVE' : action === 'reject' ? 'INCOMPLETE' : 'PENDING',
          moderationReason: moderationReason || null
        }),
      })

      if (response.ok) {
        await fetchData()
        setShowModerationModal(false)
        setModerationVendor(null)
        setModerationReason('')
      } else {
        const errorData = await response.json()
        alert(`Ошибка при изменении статуса вендора: ${errorData.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      console.error('Error updating vendor:', error)
      alert('Ошибка при изменении статуса вендора')
    }
  }

  const handleUserClick = (user: User) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Валидация формы
    if (!validateCreateForm()) {
      return
    }
    
    setLoading(true)

    try {
      // Создаем FormData для загрузки файла
      const formData = new FormData()
      
      // Добавляем все поля формы
      Object.entries(createFormData).forEach(([key, value]) => {
        if (key === 'egryulDocument' && value instanceof File) {
          formData.append('egryulDocument', value)
        } else if (key !== 'egryulDocument') {
          formData.append(key, String(value))
        }
      })

      const response = await fetch('/api/admin/venues/vendors', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        await fetchData()
        setShowCreateModal(false)
        setCreateFormData({
          type: 'INDIVIDUAL_ENTREPRENEUR',
          fullName: '',
          inn: '',
          orgnip: '',
          bankAccount: '',
          bik: '',
          address: '',
          isVatPayer: false,
          vatRate: '',
          egryulDocument: null,
          representativeName: '',
          representativePosition: '',
          isRepresentative: false,
          companyName: '',
          kpp: '',
          orgn: '',
          legalAddress: '',
          actualAddress: '',
          directorName: '',
          directorPosition: '',
          selfEmployedInn: '',
          agreementAccepted: false
        })
      } else {
        const errorData = await response.json()
        alert(`Ошибка при создании вендора: ${errorData.error || 'Неизвестная ошибка'}`)
      }
    } catch (error) {
      console.error('Error creating vendor:', error)
      alert('Ошибка при создании вендора')
    } finally {
      setLoading(false)
    }
  }

  const handleEditVendor = (vendor: VenueVendor) => {
    setEditingVendor(vendor)
    setEditFormData({
      // Тип вендора
      type: vendor.type,
      fullName: vendor.fullName || '',
      inn: vendor.inn || '',
      orgnip: vendor.orgnip || '',
      bankAccount: vendor.bankAccount || '',
      bik: vendor.bik || '',
      address: vendor.address || '',
      isVatPayer: vendor.isVatPayer,
      vatRate: vendor.vatRate || '',
      representativeName: vendor.representativeName || '',
      representativePosition: vendor.representativePosition || '',
      isRepresentative: vendor.isRepresentative,
      // Добавляем поля для ЮЛ
      companyName: vendor.companyName || '',
      kpp: vendor.kpp || '',
      orgn: vendor.orgn || '',
      legalAddress: vendor.legalAddress || '',
      actualAddress: vendor.actualAddress || '',
      directorName: vendor.directorName || '',
      directorPosition: vendor.directorPosition || '',
      // Добавляем поле для самозанятых
      selfEmployedInn: vendor.selfEmployedInn || ''
    })
    setShowEditModal(true)
  }

  const handleViewVendor = (vendor: VenueVendor) => {
    setEditingVendor(vendor)
    setShowInfoModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого вендора?')) return

    try {
      const response = await fetch(`/api/admin/venues/vendors/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchData()
      } else {
        alert('Ошибка при удалении вендора')
      }
    } catch (error) {
      console.error('Error deleting vendor:', error)
      alert('Ошибка при удалении вендора')
    }
  }

  const cityCounts = getCityVendorCounts()
  const filteredVendors = getFilteredAndSortedVendors()

  if (loading) {
    return <div className="flex justify-center items-center h-64">Загрузка...</div>
  }

  return (
    <div className="space-y-6">
      {/* Кнопки действий */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить вендора</span>
          </button>
        </div>

        {/* Фильтр по городам */}
        <div className="relative">
          <button
            onClick={() => setShowCityFilter(!showCityFilter)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
          >
            <span>Города</span>
            {selectedCityIds.length > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {selectedCityIds.length}
              </span>
            )}
            <span className="text-xs text-gray-500">
              ({Array.isArray(vendors) ? vendors.filter(v => v.status === 'ACTIVE').length : 0} активных, {Array.isArray(vendors) ? vendors.filter(v => v.status === 'PENDING').length : 0} на модерации)
            </span>
          </button>

          {showCityFilter && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 city-filter-dropdown">
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-900">Фильтр по городам</h3>
                  <button
                    onClick={clearCityFilter}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Очистить
                  </button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Array.isArray(cities) ? cities.map(city => {
                    const counts = cityCounts[city.id] || { active: 0, pending: 0, incomplete: 0, deleted: 0 }
                    return (
                      <label key={city.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCityIds.includes(city.id)}
                          onChange={() => handleCityFilter(city.id)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700 flex-1">{city.name}</span>
                        <div className="flex space-x-1">
                          {counts.active > 0 && (
                            <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                              {counts.active}
                            </span>
                          )}
                          {counts.pending > 0 && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                              {counts.pending}
                            </span>
                          )}
                          {counts.incomplete > 0 && (
                            <span className="text-xs bg-gray-100 text-gray-800 px-1 rounded">
                              {counts.incomplete}
                            </span>
                          )}
                          {counts.deleted > 0 && (
                            <span className="text-xs bg-red-100 text-red-800 px-1 rounded">
                              {counts.deleted}
                            </span>
                          )}
                        </div>
                      </label>
                    )
                  }) : (
                    <div className="text-sm text-gray-500 p-2">Загрузка городов...</div>
                  )}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-3 h-3 bg-green-100 rounded-full"></div>
                      <span>Активные</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-3 h-3 bg-yellow-100 rounded-full"></div>
                      <span>На модерации</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-3 h-3 bg-gray-100 rounded-full"></div>
                      <span>Не заполнил</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-100 rounded-full"></div>
                      <span>Удален</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Информационная панель */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Показано {filteredVendors.length} из {vendors.length} вендоров
            {selectedCityIds.length > 0 && (
              <span className="ml-2 text-blue-600">
                (отфильтровано по {selectedCityIds.length} городам)
              </span>
            )}
          </div>
          {selectedCityIds.length > 0 && (
            <div className="text-sm text-gray-500">
              Активных: {filteredVendors.filter(v => v.status === 'ACTIVE').length}, 
              На модерации: {filteredVendors.filter(v => v.status === 'PENDING').length}, 
              Не заполнил: {filteredVendors.filter(v => v.status === 'INCOMPLETE').length}
            </div>
          )}
        </div>
      </div>

      {/* Таблица вендоров */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('vendor')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Название вендора</span>
                    {sortField === 'vendor' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('vendor')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Город</span>
                    {sortField === 'vendor' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Документы
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Дата создания</span>
                    {sortField === 'createdAt' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Осталось дней
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Привязанные пользователи
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Статус</span>
                    {sortField === 'status' && (
                      <span className="text-blue-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {vendor.vendor.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${getStatusColor(vendor.status)}`}>
                          {vendor.vendor.displayName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getTypeText(vendor.type)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {vendor.vendor.city?.name || 'Не указан'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getDocumentsStatusColor(vendor.documentsStatus)}`}>
                      {getDocumentsStatusText(vendor.documentsStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(vendor.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getDaysUntilDeletionColor(vendor.daysUntilDeletion)}`}>
                      {getDaysUntilDeletionText(vendor.daysUntilDeletion)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-wrap gap-1">
                      {vendor.users.slice(0, 3).map((userVendor) => (
                        <button
                          key={userVendor.id}
                          onClick={() => handleUserClick(userVendor.user)}
                          className="text-blue-600 hover:text-blue-800 text-xs bg-blue-50 px-2 py-1 rounded"
                        >
                          {userVendor.user.name || userVendor.user.email}
                        </button>
                      ))}
                      {vendor.users.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{vendor.users.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getStatusColor(vendor.status)}`}>
                      {getStatusText(vendor.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewVendor(vendor)}
                        className="text-green-600 hover:text-green-900"
                        title="Просмотр информации"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditVendor(vendor)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {(vendor.status === 'PENDING' || vendor.status === 'ACTIVE') && (
                        <button
                          onClick={() => handleModerationClick(vendor)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title={vendor.status === 'PENDING' ? 'Модерация' : 'Отправить на модерацию'}
                        >
                          <Wrench className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(vendor.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно модерации */}
      {showModerationModal && moderationVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {moderationVendor.status === 'PENDING' ? 'Модерация вендора' : 'Отправить на модерацию'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Информация о вендоре</h4>
                <div className="mt-2 space-y-3 text-sm text-gray-600">
                  <p><strong>Название:</strong> {moderationVendor.vendor.displayName}</p>
                  <p><strong>Тип:</strong> {getTypeText(moderationVendor.type)}</p>
                  <p><strong>Город:</strong> {moderationVendor.vendor.city.name}</p>
                  <p><strong>Статус документов:</strong> {getDocumentsStatusText(moderationVendor.documentsStatus)}</p>
                  
                  {/* Детальная информация в зависимости от типа */}
                  {moderationVendor.type === 'INDIVIDUAL_ENTREPRENEUR' && (
                    <>
                      <p><strong>ФИО:</strong> {moderationVendor.fullName || <span className="text-red-500">Не заполнено</span>}</p>
                      <p><strong>ИНН:</strong> {moderationVendor.inn || <span className="text-red-500">Не заполнено</span>}</p>
                      <p><strong>ОРГНИП:</strong> {moderationVendor.orgnip || <span className="text-red-500">Не заполнено</span>}</p>
                      <p><strong>Расчетный счет:</strong> {moderationVendor.bankAccount || <span className="text-gray-400">Не указан</span>}</p>
                      <p><strong>БИК:</strong> {moderationVendor.bik || <span className="text-gray-400">Не указан</span>}</p>
                      <p><strong>Адрес:</strong> {moderationVendor.address || <span className="text-gray-400">Не указан</span>}</p>
                      <p><strong>Плательщик НДС:</strong> {moderationVendor.isVatPayer ? 'Да' : 'Нет'}</p>
                      {moderationVendor.isVatPayer && <p><strong>Ставка НДС:</strong> {moderationVendor.vatRate ? `${moderationVendor.vatRate}%` : <span className="text-red-500">Не указана</span>}</p>}
                      <p><strong>Представитель:</strong> {moderationVendor.representativeName || <span className="text-gray-400">Не указан</span>}</p>
                      <p><strong>Должность представителя:</strong> {moderationVendor.representativePosition || <span className="text-gray-400">Не указана</span>}</p>
                      <p><strong>Является представителем:</strong> {moderationVendor.isRepresentative ? 'Да' : 'Нет'}</p>
                    </>
                  )}
                  
                  {moderationVendor.type === 'LEGAL_ENTITY' && (
                    <>
                      <p><strong>Наименование:</strong> {moderationVendor.companyName || <span className="text-red-500">Не заполнено</span>}</p>
                      <p><strong>ИНН:</strong> {moderationVendor.inn || <span className="text-red-500">Не заполнено</span>}</p>
                      <p><strong>КПП:</strong> {moderationVendor.kpp || <span className="text-gray-400">Не указан</span>}</p>
                      <p><strong>ОГРН:</strong> {moderationVendor.orgn || <span className="text-red-500">Не заполнен</span>}</p>
                      <p><strong>Расчетный счет:</strong> {moderationVendor.bankAccount || <span className="text-gray-400">Не указан</span>}</p>
                      <p><strong>БИК:</strong> {moderationVendor.bik || <span className="text-gray-400">Не указан</span>}</p>
                      <p><strong>Юридический адрес:</strong> {moderationVendor.legalAddress || <span className="text-red-500">Не заполнен</span>}</p>
                      <p><strong>Фактический адрес:</strong> {moderationVendor.actualAddress || <span className="text-gray-400">Не указан</span>}</p>
                      <p><strong>Руководитель:</strong> {moderationVendor.directorName || <span className="text-red-500">Не заполнен</span>}</p>
                      <p><strong>Должность руководителя:</strong> {moderationVendor.directorPosition || <span className="text-gray-400">Не указана</span>}</p>
                      <p><strong>Плательщик НДС:</strong> {moderationVendor.isVatPayer ? 'Да' : 'Нет'}</p>
                      {moderationVendor.isVatPayer && <p><strong>Ставка НДС:</strong> {moderationVendor.vatRate ? `${moderationVendor.vatRate}%` : <span className="text-red-500">Не указана</span>}</p>}
                      <p><strong>Представитель:</strong> {moderationVendor.representativeName || <span className="text-gray-400">Не указан</span>}</p>
                      <p><strong>Должность представителя:</strong> {moderationVendor.representativePosition || <span className="text-gray-400">Не указана</span>}</p>
                      <p><strong>Является представителем:</strong> {moderationVendor.isRepresentative ? 'Да' : 'Нет'}</p>
                    </>
                  )}
                  
                  {moderationVendor.type === 'SELF_EMPLOYED' && (
                    <>
                      <p><strong>ФИО:</strong> {moderationVendor.fullName || <span className="text-red-500">Не заполнено</span>}</p>
                      <p><strong>ИНН:</strong> {moderationVendor.selfEmployedInn || <span className="text-red-500">Не заполнен</span>}</p>
                    </>
                  )}
                  
                  <p><strong>Согласие с документами:</strong> {moderationVendor.agreementAccepted ? 'Да' : 'Нет'}</p>
                  
                  {/* Документ ЕГРЮЛ */}
                  {moderationVendor.egryulDocument && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-blue-800 font-medium">Документ ЕГРЮЛ</span>
                        </div>
                        <a
                          href={`/api/admin/venues/vendors/${moderationVendor.id}/document`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Скачать PDF
                        </a>
                      </div>
                      <p className="text-blue-700 text-xs mt-1">
                        Файл: {moderationVendor.egryulDocument}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Причина (необязательно)
                </label>
                <textarea
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Укажите причину модерации..."
                />
              </div>

              <div className="flex space-x-3">
                {moderationVendor.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => handleModerationAction('reject')}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Отказать
                    </button>
                    <button
                      onClick={() => handleModerationAction('send_for_correction')}
                      className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                    >
                      Отправить на корректировку
                    </button>
                    <button
                      onClick={() => handleModerationAction('approve')}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Принять
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleModerationAction('send_for_correction')}
                    className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                  >
                    Отправить на модерацию
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowModerationModal(false)}
                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно информации о пользователе */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Информация о пользователе</h3>
            
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-900">Имя:</span>
                <span className="ml-2 text-gray-600">{selectedUser.name || 'Не указано'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Email:</span>
                <span className="ml-2 text-gray-600">{selectedUser.email}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Дата регистрации:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(selectedUser.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Последний визит:</span>
                <span className="ml-2 text-gray-600">
                  {selectedUser.lastLoginAt 
                    ? new Date(selectedUser.lastLoginAt).toLocaleDateString('ru-RU')
                    : 'Никогда'
                  }
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowUserModal(false)}
              className="w-full mt-4 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно создания вендора */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Создать вендора</h3>
            
            <form onSubmit={handleCreateVendor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип вендора *
                </label>
                <select
                  value={createFormData.type}
                  onChange={(e) => setCreateFormData({ ...createFormData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="INDIVIDUAL_ENTREPRENEUR">Индивидуальный предприниматель</option>
                  <option value="LEGAL_ENTITY">Юридическое лицо</option>
                  <option value="SELF_EMPLOYED">Самозанятый</option>
                </select>
              </div>

              {/* Поля для ИП */}
              {createFormData.type === 'INDIVIDUAL_ENTREPRENEUR' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ФИО *
                    </label>
                    <input
                      type="text"
                      value={createFormData.fullName}
                      onChange={(e) => setCreateFormData({ ...createFormData, fullName: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        createFormErrors.fullName 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      required
                    />
                    {createFormErrors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{createFormErrors.fullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ИНН *
                      </label>
                      <input
                        type="text"
                        value={createFormData.inn}
                        onChange={(e) => setCreateFormData({ ...createFormData, inn: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ОРГНИП *
                      </label>
                      <input
                        type="text"
                        value={createFormData.orgnip}
                        onChange={(e) => setCreateFormData({ ...createFormData, orgnip: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Расчетный счет
                      </label>
                      <input
                        type="text"
                        value={createFormData.bankAccount}
                        onChange={(e) => setCreateFormData({ ...createFormData, bankAccount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        БИК
                      </label>
                      <input
                        type="text"
                        value={createFormData.bik}
                        onChange={(e) => setCreateFormData({ ...createFormData, bik: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Адрес
                    </label>
                    <input
                      type="text"
                      value={createFormData.address}
                      onChange={(e) => setCreateFormData({ ...createFormData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={createFormData.isVatPayer}
                        onChange={(e) => setCreateFormData({ ...createFormData, isVatPayer: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Плательщик НДС</span>
                    </label>
                  </div>

                  {createFormData.isVatPayer && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ставка НДС
                      </label>
                      <select
                        value={createFormData.vatRate}
                        onChange={(e) => setCreateFormData({ ...createFormData, vatRate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Выберите ставку</option>
                        <option value="5">5% НДС</option>
                        <option value="7">7% НДС</option>
                        <option value="20">20% НДС</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Загрузить выписку из ЕГРЮЛ *
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setCreateFormData({ ...createFormData, egryulDocument: file })
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Документ можно найти по ссылке: <a href="https://egrul.nalog.ru/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://egrul.nalog.ru/</a>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ФИО представителя
                      </label>
                      <input
                        type="text"
                        value={createFormData.representativeName}
                        onChange={(e) => setCreateFormData({ ...createFormData, representativeName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Должность представителя
                      </label>
                      <input
                        type="text"
                        value={createFormData.representativePosition}
                        onChange={(e) => setCreateFormData({ ...createFormData, representativePosition: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isRepresentative"
                      checked={createFormData.isRepresentative}
                      onChange={(e) => setCreateFormData({ ...createFormData, isRepresentative: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isRepresentative" className="text-sm font-medium text-gray-700">
                      Я являюсь представителем компании и имею право совершать данное действие
                    </label>
                  </div>
                </>
              )}

              {/* Поля для Самозанятого */}
              {createFormData.type === 'SELF_EMPLOYED' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ФИО *
                    </label>
                    <input
                      type="text"
                      value={createFormData.fullName}
                      onChange={(e) => setCreateFormData({ ...createFormData, fullName: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        createFormErrors.fullName 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      required
                    />
                    {createFormErrors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{createFormErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ИНН *
                    </label>
                    <input
                      type="text"
                      value={createFormData.selfEmployedInn}
                      onChange={(e) => setCreateFormData({ ...createFormData, selfEmployedInn: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </>
              )}

              {/* Поля для ЮЛ */}
              {createFormData.type === 'LEGAL_ENTITY' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Полное наименование *
                    </label>
                    <input
                      type="text"
                      value={createFormData.companyName}
                      onChange={(e) => setCreateFormData({ ...createFormData, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ИНН *
                      </label>
                      <input
                        type="text"
                        value={createFormData.inn}
                        onChange={(e) => setCreateFormData({ ...createFormData, inn: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        КПП
                      </label>
                      <input
                        type="text"
                        value={createFormData.kpp}
                        onChange={(e) => setCreateFormData({ ...createFormData, kpp: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ОГРН *
                      </label>
                      <input
                        type="text"
                        value={createFormData.orgn}
                        onChange={(e) => setCreateFormData({ ...createFormData, orgn: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Расчетный счет
                      </label>
                      <input
                        type="text"
                        value={createFormData.bankAccount}
                        onChange={(e) => setCreateFormData({ ...createFormData, bankAccount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        БИК
                      </label>
                      <input
                        type="text"
                        value={createFormData.bik}
                        onChange={(e) => setCreateFormData({ ...createFormData, bik: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Юридический адрес
                    </label>
                    <input
                      type="text"
                      value={createFormData.legalAddress}
                      onChange={(e) => setCreateFormData({ ...createFormData, legalAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Фактический адрес
                    </label>
                    <input
                      type="text"
                      value={createFormData.actualAddress}
                      onChange={(e) => setCreateFormData({ ...createFormData, actualAddress: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Руководитель (ФИО) *
                      </label>
                      <input
                        type="text"
                        value={createFormData.directorName}
                        onChange={(e) => setCreateFormData({ ...createFormData, directorName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Должность руководителя *
                      </label>
                      <input
                        type="text"
                        value={createFormData.directorPosition}
                        onChange={(e) => setCreateFormData({ ...createFormData, directorPosition: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={createFormData.isVatPayer}
                        onChange={(e) => setCreateFormData({ ...createFormData, isVatPayer: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Плательщик НДС</span>
                    </label>
                  </div>

                  {createFormData.isVatPayer && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ставка НДС
                      </label>
                      <select
                        value={createFormData.vatRate}
                        onChange={(e) => setCreateFormData({ ...createFormData, vatRate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Выберите ставку</option>
                        <option value="5">5% НДС</option>
                        <option value="7">7% НДС</option>
                        <option value="20">20% НДС</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Загрузить выписку из ЕГРЮЛ *
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setCreateFormData({ ...createFormData, egryulDocument: file })
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Документ можно найти по ссылке: <a href="https://egrul.nalog.ru/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://egrul.nalog.ru/</a>
                    </p>
                  </div>

                  {/* Блок представителя для ЮЛ */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ФИО представителя
                      </label>
                      <input
                        type="text"
                        value={createFormData.representativeName}
                        onChange={(e) => setCreateFormData({ ...createFormData, representativeName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Должность представителя
                      </label>
                      <input
                        type="text"
                        value={createFormData.representativePosition}
                        onChange={(e) => setCreateFormData({ ...createFormData, representativePosition: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isRepresentativeUL"
                      checked={createFormData.isRepresentative}
                      onChange={(e) => setCreateFormData({ ...createFormData, isRepresentative: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isRepresentativeUL" className="text-sm font-medium text-gray-700">
                      Я являюсь представителем компании и имею право совершать данное действие
                    </label>
                  </div>
                </>
              )}

              {/* Секция с документами */}
              <div className="border-t pt-4">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Ознакомление с документами</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Обязательные документы для ознакомления:</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <a 
                            href="/documents/vendor-agreement" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Договор с вендорами
                          </a>
                          <p className="text-sm text-blue-700">Условия сотрудничества и размещения услуг</p>
                        </div>
                        <a 
                          href="/documents/vendor-agreement" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Открыть →
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <a 
                            href="/documents/privacy-policy" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Политика конфиденциальности
                          </a>
                          <p className="text-sm text-blue-700">Обработка персональных данных</p>
                        </div>
                        <a 
                          href="/documents/privacy-policy" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Открыть →
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="agreementAccepted"
                      checked={createFormData.agreementAccepted}
                      onChange={(e) => setCreateFormData({ ...createFormData, agreementAccepted: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="agreementAccepted" className="text-sm text-gray-700">
                      Я ознакомлен с документами и полностью согласен с условиями сотрудничества *
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Создание...' : 'Создать вендора'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно просмотра информации о вендоре */}
      {showInfoModal && editingVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Информация о вендоре</h3>
            
            <div className="space-y-6">
              {/* Основная информация */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Основная информация</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название вендора
                    </label>
                    <input
                      type="text"
                      value={editingVendor.vendor.displayName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Тип вендора
                    </label>
                    <input
                      type="text"
                      value={getTypeText(editingVendor.type)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Статус и даты */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Статус и даты</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Статус
                    </label>
                    <input
                      type="text"
                      value={getStatusText(editingVendor.status)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(editingVendor.status)}`}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Статус документов
                    </label>
                    <input
                      type="text"
                      value={getDocumentsStatusText(editingVendor.documentsStatus)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${getDocumentsStatusColor(editingVendor.documentsStatus)}`}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дата создания
                    </label>
                    <input
                      type="text"
                      value={new Date(editingVendor.createdAt).toLocaleDateString('ru-RU')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Данные вендора */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Данные вендора</h4>
                <div className="space-y-4">
                  {/* ФИО */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ФИО <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingVendor.fullName || ''}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editingVendor.fullName ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                      }`}
                      readOnly
                    />
                    {!editingVendor.fullName && (
                      <p className="text-red-500 text-sm mt-1">⚠️ Обязательное поле не заполнено</p>
                    )}
                  </div>

                  {/* ИНН */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ИНН <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingVendor.inn || ''}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editingVendor.inn ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                      }`}
                      readOnly
                    />
                    {!editingVendor.inn && (
                      <p className="text-red-500 text-sm mt-1">⚠️ Обязательное поле не заполнено</p>
                    )}
                  </div>

                  {/* ОРГНИП для ИП, ОГРН для ЮЛ */}
                  {editingVendor.type === 'LEGAL_ENTITY' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ОГРН <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingVendor.orgn || ''}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          editingVendor.orgn ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                        }`}
                        readOnly
                      />
                      {!editingVendor.orgn && (
                        <p className="text-red-500 text-sm mt-1">⚠️ Обязательное поле не заполнено</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ОГРНИП <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingVendor.orgnip || ''}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          editingVendor.orgnip ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                        }`}
                        readOnly
                      />
                      {!editingVendor.orgnip && (
                        <p className="text-red-500 text-sm mt-1">⚠️ Обязательное поле не заполнено</p>
                      )}
                    </div>
                  )}

                  {/* КПП для ЮЛ */}
                  {editingVendor.type === 'LEGAL_ENTITY' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        КПП
                      </label>
                      <input
                        type="text"
                        value={editingVendor.kpp || ''}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          editingVendor.kpp ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                        }`}
                        readOnly
                      />
                      {!editingVendor.kpp && (
                        <p className="text-gray-500 text-sm mt-1">ℹ️ Поле не заполнено</p>
                      )}
                    </div>
                  )}

                  {/* Расчетный счет */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Расчетный счет
                    </label>
                    <input
                      type="text"
                      value={editingVendor.bankAccount || ''}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editingVendor.bankAccount ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                      }`}
                      readOnly
                    />
                    {!editingVendor.bankAccount && (
                      <p className="text-gray-500 text-sm mt-1">ℹ️ Поле не заполнено</p>
                    )}
                  </div>

                  {/* БИК */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      БИК
                    </label>
                    <input
                      type="text"
                      value={editingVendor.bik || ''}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editingVendor.bik ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                      }`}
                      readOnly
                    />
                    {!editingVendor.bik && (
                      <p className="text-gray-500 text-sm mt-1">ℹ️ Поле не заполнено</p>
                    )}
                  </div>

                  {/* Адрес */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Адрес
                    </label>
                    <input
                      type="text"
                      value={editingVendor.address || ''}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editingVendor.address ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                      }`}
                      readOnly
                    />
                    {!editingVendor.address && (
                      <p className="text-gray-500 text-sm mt-1">ℹ️ Поле не заполнено</p>
                    )}
                  </div>

                  {/* Плательщик НДС */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Плательщик НДС
                    </label>
                    <input
                      type="text"
                      value={editingVendor.isVatPayer !== null ? (editingVendor.isVatPayer ? 'Да' : 'Нет') : ''}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editingVendor.isVatPayer !== null ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                      }`}
                      readOnly
                    />
                    {editingVendor.isVatPayer === null && (
                      <p className="text-gray-500 text-sm mt-1">ℹ️ Поле не заполнено</p>
                    )}
                  </div>

                  {/* Ставка НДС */}
                  {editingVendor.isVatPayer && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ставка НДС
                      </label>
                      <input
                        type="text"
                        value={editingVendor.vatRate ? `${editingVendor.vatRate}%` : ''}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          editingVendor.vatRate ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                        }`}
                        readOnly
                      />
                      {!editingVendor.vatRate && (
                        <p className="text-gray-500 text-sm mt-1">ℹ️ Поле не заполнено</p>
                      )}
                    </div>
                  )}

                  {/* Документ ЕГРЮЛ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Выписка из ЕГРЮЛ <span className="text-red-500">*</span>
                    </label>
                    {editingVendor.egryulDocument ? (
                      <div className="border border-green-300 bg-green-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-green-800 font-medium">Документ загружен</span>
                          </div>
                          <a
                            href={`/api/admin/venues/vendors/${editingVendor.id}/document`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 border border-green-300 text-green-700 text-sm font-medium rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Скачать PDF
                          </a>
                        </div>
                        <p className="text-green-700 text-sm mt-1">
                          Файл: {editingVendor.egryulDocument}
                        </p>
                      </div>
                    ) : (
                      <div className="border border-red-300 bg-red-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span className="text-red-800 font-medium">Документ не загружен</span>
                        </div>
                        <p className="text-red-600 text-sm mt-1">⚠️ Обязательное поле не заполнено</p>
                      </div>
                    )}
                    <p className="text-gray-500 text-sm mt-2">
                      Документ можно найти по ссылке: <a href="https://egrul.nalog.ru/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://egrul.nalog.ru/</a>
                    </p>
                  </div>

                  {/* ФИО представителя */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ФИО представителя
                    </label>
                    <input
                      type="text"
                      value={editingVendor.representativeName || ''}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editingVendor.representativeName ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                      }`}
                      readOnly
                    />
                    {!editingVendor.representativeName && (
                      <p className="text-gray-500 text-sm mt-1">ℹ️ Поле не заполнено</p>
                    )}
                  </div>

                  {/* Должность представителя */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Должность представителя
                    </label>
                    <input
                      type="text"
                      value={editingVendor.representativePosition || ''}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editingVendor.representativePosition ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                      }`}
                      readOnly
                    />
                    {!editingVendor.representativePosition && (
                      <p className="text-gray-500 text-sm mt-1">ℹ️ Поле не заполнено</p>
                    )}
                  </div>

                  {/* Являюсь представителем */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Я являюсь представителем компании и имею право совершать данное действие
                    </label>
                    <input
                      type="text"
                      value={editingVendor.isRepresentative !== null ? (editingVendor.isRepresentative ? 'Да' : 'Нет') : ''}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        editingVendor.isRepresentative !== null ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                      }`}
                      readOnly
                    />
                    {editingVendor.isRepresentative === null && (
                      <p className="text-gray-500 text-sm mt-1">ℹ️ Поле не заполнено</p>
                    )}
                  </div>

                  {/* Поля для ЮЛ */}
                  {editingVendor.type === 'LEGAL_ENTITY' && (
                    <>
                      {/* Наименование */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Наименование <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editingVendor.companyName || ''}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            editingVendor.companyName ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                          }`}
                          readOnly
                        />
                        {!editingVendor.companyName && (
                          <p className="text-red-500 text-sm mt-1">⚠️ Обязательное поле не заполнено</p>
                        )}
                      </div>

                      {/* Юридический адрес */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Юридический адрес <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editingVendor.legalAddress || ''}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            editingVendor.legalAddress ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                          }`}
                          readOnly
                        />
                        {!editingVendor.legalAddress && (
                          <p className="text-red-500 text-sm mt-1">⚠️ Обязательное поле не заполнено</p>
                        )}
                      </div>

                      {/* Фактический адрес */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Фактический адрес
                        </label>
                        <input
                          type="text"
                          value={editingVendor.actualAddress || ''}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            editingVendor.actualAddress ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                          }`}
                          readOnly
                        />
                        {!editingVendor.actualAddress && (
                          <p className="text-gray-500 text-sm mt-1">ℹ️ Поле не заполнено</p>
                        )}
                      </div>

                      {/* Руководитель */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Руководитель <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editingVendor.directorName || ''}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            editingVendor.directorName ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                          }`}
                          readOnly
                        />
                        {!editingVendor.directorName && (
                          <p className="text-red-500 text-sm mt-1">⚠️ Обязательное поле не заполнено</p>
                        )}
                      </div>

                      {/* Должность руководителя */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Должность руководителя
                        </label>
                        <input
                          type="text"
                          value={editingVendor.directorPosition || ''}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            editingVendor.directorPosition ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                          }`}
                          readOnly
                        />
                        {!editingVendor.directorPosition && (
                          <p className="text-gray-500 text-sm mt-1">ℹ️ Поле не заполнено</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Комментарий модератора */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Комментарий модератора</h4>
                <textarea
                  value={moderationComment}
                  onChange={(e) => setModerationComment(e.target.value)}
                  placeholder="Укажите, что нужно заполнить или исправить..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    // Здесь будет логика отправки на доработку
                    alert('Функция отправки на доработку будет реализована')
                    setShowInfoModal(false)
                  }}
                  className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                >
                  Отправить на доработку
                </button>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования вендора */}
      {showEditModal && editingVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Редактировать вендора</h3>
            
            <form onSubmit={async (e) => {
              e.preventDefault()
              try {
                const formData = new FormData()
                
                // Добавляем ID вендора
                formData.append('id', editingVendor.id.toString())

                // Добавляем все поля формы
                Object.entries(editFormData).forEach(([key, value]) => {
                  if (value !== null && value !== undefined) {
                    formData.append(key, String(value))
                  }
                })

                // Добавляем файл документа, если выбран
                if (editEgryulDocument) {
                  formData.append('egryulDocument', editEgryulDocument)
                }

                const response = await fetch(`/api/admin/venues/vendors/${editingVendor.id}`, {
                  method: 'PATCH',
                  body: formData,
                })

                if (response.ok) {
                  setShowEditModal(false)
                  setEditEgryulDocument(null)
                  fetchData()
                  alert('Вендор успешно обновлен')
                } else {
                  alert('Ошибка при обновлении вендора')
                }
              } catch (error) {
                console.error('Error updating vendor:', error)
                alert('Ошибка при обновлении вендора')
              }
            }} className="space-y-6">
              {/* Основная информация */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Основная информация</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название вендора
                    </label>
                    <input
                      type="text"
                      value={editingVendor.vendor.displayName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Тип вендора
                    </label>
                    <input
                      type="text"
                      value={getTypeText(editingVendor.type)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Тип вендора */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Тип вендора</h4>
                <select
                  value={editFormData.type}
                  onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INDIVIDUAL_ENTREPRENEUR">Индивидуальный предприниматель</option>
                  <option value="LEGAL_ENTITY">Юридическое лицо</option>
                  <option value="SELF_EMPLOYED">Самозанятый</option>
                </select>
              </div>

              {/* Данные вендора */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Данные вендора</h4>
                <div className="space-y-4">
                  {/* Поля для ИП */}
                  {editFormData.type === 'INDIVIDUAL_ENTREPRENEUR' && (
                    <>
                      {/* ФИО */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ФИО <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editFormData.fullName}
                          onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                  {/* ИНН */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ИНН <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.inn}
                      onChange={(e) => setEditFormData({...editFormData, inn: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* ОРГНИП/ОРГН */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {editFormData.type === 'LEGAL_ENTITY' ? 'ОГРН' : 'ОГРНИП'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.orgnip}
                      onChange={(e) => setEditFormData({...editFormData, orgnip: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Расчетный счет */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Расчетный счет
                    </label>
                    <input
                      type="text"
                      value={editFormData.bankAccount}
                      onChange={(e) => setEditFormData({...editFormData, bankAccount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* БИК */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      БИК
                    </label>
                    <input
                      type="text"
                      value={editFormData.bik}
                      onChange={(e) => setEditFormData({...editFormData, bik: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Адрес */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Адрес
                    </label>
                    <input
                      type="text"
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Плательщик НДС */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Плательщик НДС
                    </label>
                    <select
                      value={editFormData.isVatPayer === null ? '' : editFormData.isVatPayer ? 'true' : 'false'}
                      onChange={(e) => setEditFormData({...editFormData, isVatPayer: e.target.value === '' ? null : e.target.value === 'true'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Не указано</option>
                      <option value="true">Да</option>
                      <option value="false">Нет</option>
                    </select>
                  </div>

                  {/* Ставка НДС */}
                  {editFormData.isVatPayer && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ставка НДС
                      </label>
                      <select
                        value={editFormData.vatRate}
                        onChange={(e) => setEditFormData({...editFormData, vatRate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Выберите ставку</option>
                        <option value="5">5%</option>
                        <option value="7">7%</option>
                        <option value="20">20%</option>
                      </select>
                    </div>
                  )}

                  {/* ФИО представителя */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ФИО представителя
                    </label>
                    <input
                      type="text"
                      value={editFormData.representativeName}
                      onChange={(e) => setEditFormData({...editFormData, representativeName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Должность представителя */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Должность представителя
                    </label>
                    <input
                      type="text"
                      value={editFormData.representativePosition}
                      onChange={(e) => setEditFormData({...editFormData, representativePosition: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Являюсь представителем */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Я являюсь представителем компании и имею право совершать данное действие
                    </label>
                    <select
                      value={editFormData.isRepresentative === null ? '' : editFormData.isRepresentative ? 'true' : 'false'}
                      onChange={(e) => setEditFormData({...editFormData, isRepresentative: e.target.value === '' ? null : e.target.value === 'true'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Не указано</option>
                      <option value="true">Да</option>
                      <option value="false">Нет</option>
                    </select>
                  </div>

                  {/* Документ ЕГРЮЛ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Загрузить выписку из ЕГРЮЛ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setEditEgryulDocument(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {editingVendor.egryulDocument && (
                      <p className="text-green-600 text-sm mt-1">✅ Текущий документ: {editingVendor.egryulDocument}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-1">
                      Документ можно найти по ссылке: <a href="https://egrul.nalog.ru/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://egrul.nalog.ru/</a>
                    </p>
                  </div>
                    </>
                  )}
                </div>
              </div>

              {/* Поля для ЮЛ */}
              {editFormData.type === 'LEGAL_ENTITY' && (
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800">Информация о юридическом лице</h4>
                  
                  {/* Наименование */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Наименование <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.companyName}
                      onChange={(e) => setEditFormData({...editFormData, companyName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* ИНН, КПП, ОГРН */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ИНН <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.inn}
                        onChange={(e) => setEditFormData({...editFormData, inn: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        КПП
                      </label>
                      <input
                        type="text"
                        value={editFormData.kpp}
                        onChange={(e) => setEditFormData({...editFormData, kpp: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ОГРН <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editFormData.orgn}
                        onChange={(e) => setEditFormData({...editFormData, orgn: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Юридический адрес */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Юридический адрес <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.legalAddress}
                      onChange={(e) => setEditFormData({...editFormData, legalAddress: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Фактический адрес */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Фактический адрес
                    </label>
                    <input
                      type="text"
                      value={editFormData.actualAddress}
                      onChange={(e) => setEditFormData({...editFormData, actualAddress: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Руководитель */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ФИО руководителя <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.directorName}
                      onChange={(e) => setEditFormData({...editFormData, directorName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Должность руководителя */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Должность руководителя
                    </label>
                    <input
                      type="text"
                      value={editFormData.directorPosition}
                      onChange={(e) => setEditFormData({...editFormData, directorPosition: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Поля для самозанятых */}
              {editFormData.type === 'SELF_EMPLOYED' && (
                <div className="space-y-4">
                  <h4 className="text-md font-semibold text-gray-800">Информация о самозанятом</h4>
                  
                  {/* ФИО */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ФИО <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.fullName}
                      onChange={(e) => setEditFormData({...editFormData, fullName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* ИНН */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ИНН <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.selfEmployedInn}
                      onChange={(e) => setEditFormData({...editFormData, selfEmployedInn: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Сохранить изменения
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
