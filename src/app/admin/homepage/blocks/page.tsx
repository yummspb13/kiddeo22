'use client'

import { useState, useEffect } from 'react'
import { requireAdminOrDevKey, keySuffix } from '@/lib/admin-guard'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { GripVertical, Eye, EyeOff, Settings, Save } from 'lucide-react'

interface HomePageBlock {
  id: number
  blockType: string
  citySlug: string
  isVisible: boolean
  order: number
  customTitle?: string
  customDescription?: string
}

const BLOCK_TYPES = {
  'POPULAR_EVENTS': 'Популярные события',
  'POPULAR_VENUES': 'Популярные места',
  'POPULAR_SERVICES': 'Популярные услуги',
  'CATEGORIES': 'Категории',
  'COLLECTIONS': 'Подборки',
  'RECOMMENDED': 'Рекомендуем',
  'NEW_IN_CATALOG': 'Новые в каталоге',
  'BLOG_POSTS': 'Полезные статьи'
}

export default function BlocksPage() {
  const [blocks, setBlocks] = useState<HomePageBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedCity, setSelectedCity] = useState('moscow')
  const [editingBlock, setEditingBlock] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ customTitle: '', customDescription: '' })

  useEffect(() => {
    fetchBlocks()
  }, [selectedCity])

  const fetchBlocks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/homepage/blocks?citySlug=${selectedCity}&key=kidsreview2025`)
      const data = await response.json()
      setBlocks(data)
    } catch (error) {
      console.error('Error fetching blocks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const newBlocks = Array.from(blocks)
    const [reorderedItem] = newBlocks.splice(result.source.index, 1)
    newBlocks.splice(result.destination.index, 0, reorderedItem)

    // Обновляем порядок
    const updatedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index
    }))

    setBlocks(updatedBlocks)
  }

  const handleToggleVisibility = async (blockId: number, isVisible: boolean) => {
    try {
      const response = await fetch('/api/admin/homepage/blocks?key=kidsreview2025', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{ id: blockId, isVisible }]
        })
      })

      if (response.ok) {
        setBlocks(blocks.map(block => 
          block.id === blockId ? { ...block, isVisible } : block
        ))
      }
    } catch (error) {
      console.error('Error updating block visibility:', error)
    }
  }

  const handleSaveOrder = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/homepage/blocks?key=kidsreview2025', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: blocks.map(block => ({ id: block.id, order: block.order }))
        })
      })

      if (response.ok) {
        alert('Порядок блоков сохранен!')
      }
    } catch (error) {
      console.error('Error saving order:', error)
      alert('Ошибка при сохранении порядка')
    } finally {
      setSaving(false)
    }
  }

  const handleEditBlock = (block: HomePageBlock) => {
    setEditingBlock(block.id)
    setEditForm({
      customTitle: block.customTitle || '',
      customDescription: block.customDescription || ''
    })
  }

  const handleSaveEdit = async () => {
    if (!editingBlock) return

    try {
      const response = await fetch('/api/admin/homepage/blocks?key=kidsreview2025', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{
            id: editingBlock,
            customTitle: editForm.customTitle,
            customDescription: editForm.customDescription
          }]
        })
      })

      if (response.ok) {
        setBlocks(blocks.map(block => 
          block.id === editingBlock 
            ? { ...block, customTitle: editForm.customTitle, customDescription: editForm.customDescription }
            : block
        ))
        setEditingBlock(null)
        alert('Настройки блока сохранены!')
      }
    } catch (error) {
      console.error('Error saving block settings:', error)
      alert('Ошибка при сохранении настроек')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление блоками главной страницы</h1>
          <p className="text-sm text-gray-600">Настройте видимость и порядок блоков для каждого города</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="moscow">Москва</option>
            <option value="sankt-peterburg">Санкт-Петербург</option>
          </select>
          <button
            onClick={handleSaveOrder}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Сохранение...' : 'Сохранить порядок'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="blocks">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-gray-200">
                {blocks.map((block, index) => (
                  <Draggable key={block.id} draggableId={block.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-4 flex items-center space-x-4 ${
                          snapshot.isDragging ? 'bg-blue-50' : 
                          !block.isVisible ? 'bg-gray-100 opacity-60' : 'bg-white'
                        }`}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="p-2 text-gray-400 hover:text-gray-600 cursor-grab"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className={`text-lg font-medium ${
                              block.isVisible ? 'text-gray-900' : 'text-gray-500 line-through'
                            }`}>
                              {block.customTitle || BLOCK_TYPES[block.blockType as keyof typeof BLOCK_TYPES]}
                            </h3>
                            {!block.isVisible && (
                              <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                                СКРЫТ
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              (порядок: {block.order + 1})
                            </span>
                          </div>
                          {block.customDescription && (
                            <p className="text-sm text-gray-600 mt-1">{block.customDescription}</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleVisibility(block.id, !block.isVisible)}
                            className={`p-2 rounded-md transition-colors ${
                              block.isVisible 
                                ? 'text-green-600 hover:bg-green-50 bg-green-50' 
                                : 'text-red-500 hover:bg-red-50 bg-red-50'
                            }`}
                            title={block.isVisible ? 'Скрыть блок' : 'Показать блок'}
                          >
                            {block.isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                          </button>

                          <button
                            onClick={() => handleEditBlock(block)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md"
                          >
                            <Settings className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Модальное окно редактирования */}
      {editingBlock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Настройки блока</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Заголовок блока
                </label>
                <input
                  type="text"
                  value={editForm.customTitle}
                  onChange={(e) => setEditForm({ ...editForm, customTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Оставьте пустым для стандартного заголовка"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание блока
                </label>
                <textarea
                  value={editForm.customDescription}
                  onChange={(e) => setEditForm({ ...editForm, customDescription: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Дополнительное описание блока"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingBlock(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
