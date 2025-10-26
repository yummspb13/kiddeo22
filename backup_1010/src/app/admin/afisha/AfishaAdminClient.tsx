// src/app/admin/afisha/AfishaAdminClient.tsx
"use client"

import { useState } from "react"
import QuickFilterList from "@/components/admin/QuickFilterList"
import QuickFilterEditor from "@/components/admin/QuickFilterEditor"
import AdPlacementList from "@/components/admin/AdPlacementList"
import AdPlacementEditor from "@/components/admin/AdPlacementEditor"

interface City {
  id: number
  name: string
}

interface QuickFilter {
  id: number
  cityId?: number | null
  page: string
  label: string
  queryJson: unknown
  order: number
  isActive: boolean
  city?: { name: string }
}

interface AdPlacement {
  id: number
  page: string
  position: 'HERO' | 'HERO_BELOW' | 'INLINE' | 'SIDEBAR'
  title: string
  imageUrl?: string
  hrefUrl?: string
  startsAt?: Date
  endsAt?: Date
  order: number
  isActive: boolean
  cityId?: number | null
  weight: number
  city?: { name: string }
  events?: { type: string; count: number }[]
}

interface AfishaAdminClientProps {
  quickFilters: QuickFilter[]
  adPlacements: AdPlacement[]
  cities: City[]
  keySuffix: string
}

export default function AfishaAdminClient({ 
  quickFilters: initialQuickFilters,
  adPlacements: initialAdPlacements,
  cities,
  keySuffix 
}: AfishaAdminClientProps) {
  const [activeTab, setActiveTab] = useState<'filters' | 'ads'>('filters')
  const [quickFilters, setQuickFilters] = useState(initialQuickFilters)
  const [adPlacements, setAdPlacements] = useState(initialAdPlacements)
  const [showQuickFilterEditor, setShowQuickFilterEditor] = useState(false)
  const [showAdPlacementEditor, setShowAdPlacementEditor] = useState(false)
  const [editingQuickFilter, setEditingQuickFilter] = useState<QuickFilter | undefined>()
  const [editingAdPlacement, setEditingAdPlacement] = useState<AdPlacement | undefined>()

  const handleQuickFilterSave = async (filterData: unknown) => {
    try {
      const url = editingQuickFilter 
        ? `/api/admin/quick-filters` 
        : `/api/admin/quick-filters`
      
      const method = editingQuickFilter ? 'PUT' : 'POST'
      const body = editingQuickFilter 
        ? { id: editingQuickFilter.id, ...(filterData as any) }
        : filterData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        // Перезагружаем данные
        const [filters, placements] = await Promise.all([
          fetch('/api/admin/quick-filters').then(res => res.json()),
          fetch('/api/admin/ad-placements').then(res => res.json())
        ])
        
        setQuickFilters(filters)
        setAdPlacements(placements)
        setShowQuickFilterEditor(false)
        setEditingQuickFilter(undefined)
      }
    } catch (error) {
      console.error('Error saving quick filter:', error)
    }
  }

  const handleAdPlacementSave = async (placementData: unknown) => {
    try {
      const url = editingAdPlacement 
        ? `/api/admin/ad-placements` 
        : `/api/admin/ad-placements`
      
      const method = editingAdPlacement ? 'PUT' : 'POST'
      const body = editingAdPlacement 
        ? { id: editingAdPlacement.id, ...(placementData as any) }
        : placementData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        // Перезагружаем данные
        const [filters, placements] = await Promise.all([
          fetch('/api/admin/quick-filters').then(res => res.json()),
          fetch('/api/admin/ad-placements').then(res => res.json())
        ])
        
        setQuickFilters(filters)
        setAdPlacements(placements)
        setShowAdPlacementEditor(false)
        setEditingAdPlacement(undefined)
      }
    } catch (error) {
      console.error('Error saving ad placement:', error)
    }
  }

  const handleQuickFilterEdit = (filter: QuickFilter) => {
    setEditingQuickFilter(filter)
    setShowQuickFilterEditor(true)
  }

  const handleAdPlacementEdit = (placement: AdPlacement) => {
    setEditingAdPlacement(placement)
    setShowAdPlacementEditor(true)
  }

  const handleQuickFilterDelete = async (id: number) => {
    if (confirm('Удалить фильтр?')) {
      try {
        const response = await fetch(`/api/admin/quick-filters?id=${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          // Перезагружаем данные
          const [filters, placements] = await Promise.all([
            fetch('/api/admin/quick-filters').then(res => res.json()),
            fetch('/api/admin/ad-placements').then(res => res.json())
          ])
          
          setQuickFilters(filters)
          setAdPlacements(placements)
        }
      } catch (error) {
        console.error('Error deleting quick filter:', error)
      }
    }
  }

  const handleAdPlacementDelete = async (id: number) => {
    if (confirm('Удалить рекламный слот?')) {
      try {
        const response = await fetch(`/api/admin/ad-placements?id=${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          // Перезагружаем данные
          const [filters, placements] = await Promise.all([
            fetch('/api/admin/quick-filters').then(res => res.json()),
            fetch('/api/admin/ad-placements').then(res => res.json())
          ])
          
          setQuickFilters(filters)
          setAdPlacements(placements)
        }
      } catch (error) {
        console.error('Error deleting ad placement:', error)
      }
    }
  }

  const handleQuickFilterToggleActive = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/quick-filters', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive })
      })

      if (response.ok) {
        // Перезагружаем данные
        const [filters, placements] = await Promise.all([
          fetch('/api/admin/quick-filters').then(res => res.json()),
          fetch('/api/admin/ad-placements').then(res => res.json())
        ])
        
        setQuickFilters(filters)
        setAdPlacements(placements)
      }
    } catch (error) {
      console.error('Error toggling quick filter:', error)
    }
  }

  const handleAdPlacementToggleActive = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/ad-placements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive })
      })

      if (response.ok) {
        // Перезагружаем данные
        const [filters, placements] = await Promise.all([
          fetch('/api/admin/quick-filters').then(res => res.json()),
          fetch('/api/admin/ad-placements').then(res => res.json())
        ])
        
        setQuickFilters(filters)
        setAdPlacements(placements)
      }
    } catch (error) {
      console.error('Error toggling ad placement:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Управление афишей</h1>
        <p className="text-gray-600 mt-1">Настройка фильтров и рекламных слотов</p>
      </div>

      {/* Табы */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('filters')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'filters'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Быстрые фильтры
          </button>
          <button
            onClick={() => setActiveTab('ads')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ads'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Рекламные слоты
          </button>
        </nav>
      </div>

      {/* Контент */}
      {activeTab === 'filters' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Быстрые фильтры</h2>
            <button
              onClick={() => {
                setEditingQuickFilter(undefined)
                setShowQuickFilterEditor(true)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Создать фильтр
            </button>
          </div>
          
          <QuickFilterList
            filters={quickFilters}
            cities={cities}
            onEdit={handleQuickFilterEdit}
            onDelete={handleQuickFilterDelete}
            onToggleActive={handleQuickFilterToggleActive}
          />
        </div>
      )}

      {activeTab === 'ads' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Рекламные слоты</h2>
            <button
              onClick={() => {
                setEditingAdPlacement(undefined)
                setShowAdPlacementEditor(true)
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Создать слот
            </button>
          </div>
          
          <AdPlacementList
            placements={adPlacements}
            cities={cities}
            onEdit={handleAdPlacementEdit}
            onDelete={handleAdPlacementDelete}
            onToggleActive={handleAdPlacementToggleActive}
          />
        </div>
      )}

      {/* Модальные окна */}
      {showQuickFilterEditor && (
        <QuickFilterEditor
          filter={editingQuickFilter}
          cities={cities}
          onSave={handleQuickFilterSave}
          onCancel={() => {
            setShowQuickFilterEditor(false)
            setEditingQuickFilter(undefined)
          }}
        />
      )}

      {showAdPlacementEditor && (
        <AdPlacementEditor
          placement={editingAdPlacement}
          cities={cities}
          onSave={handleAdPlacementSave}
          onCancel={() => {
            setShowAdPlacementEditor(false)
            setEditingAdPlacement(undefined)
          }}
        />
      )}
    </div>
  )
}
