// src/components/chat/ChatList.tsx
"use client"

import { useState } from "react"
import { 
  Search, 
  Filter, 
  MessageCircle, 
  Clock, 
  Archive,
  Star,
  MoreVertical
} from "lucide-react"

interface Chat {
  id: number
  vendorId: number
  customerId: number
  customerName: string
  customerAvatar?: string
  listingTitle?: string
  status: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED' | 'PENDING'
  lastMessageAt?: Date
  unreadCount: number
  lastMessage?: string
  slaStatus?: 'ON_TIME' | 'WARNING' | 'OVERDUE'
}

interface ChatListProps {
  chats: Chat[]
  selectedChatId?: number
  onSelectChat: (chatId: number) => void
  onArchiveChat: (chatId: number) => void
  onBlockChat: (chatId: number) => void
  onMarkAsRead: (chatId: number) => void
}

export default function ChatList({
  chats,
  selectedChatId,
  onSelectChat,
  onArchiveChat,
  onBlockChat,
  onMarkAsRead
}: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED' | 'PENDING'>('ALL')
  const [showFilters, setShowFilters] = useState(false)

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         chat.listingTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || chat.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'сейчас'
    if (minutes < 60) return `${minutes}м`
    if (hours < 24) return `${hours}ч`
    if (days < 7) return `${days}д`
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  const getSLAStatusColor = (status?: string) => {
    switch (status) {
      case 'ON_TIME':
        return 'text-green-600'
      case 'WARNING':
        return 'text-yellow-600'
      case 'OVERDUE':
        return 'text-red-600'
      default:
        return 'text-gray-400'
    }
  }

  const getSLAStatusIcon = (status?: string) => {
    switch (status) {
      case 'WARNING':
      case 'OVERDUE':
        return <Clock className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Заголовок и поиск */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Чаты</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <Filter className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по чатам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Фильтры */}
        {showFilters && (
          <div className="mt-4 space-y-2">
            <div className="flex space-x-2">
              {[
                { value: 'ALL', label: 'Все' },
                { value: 'ACTIVE', label: 'Активные' },
                { value: 'PENDING', label: 'Ожидают' },
                { value: 'ARCHIVED', label: 'Архив' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value as any)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    statusFilter === filter.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Список чатов */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle className="w-12 h-12 mb-4" />
            <p className="text-lg font-medium">Нет чатов</p>
            <p className="text-sm">Начните общение с клиентами</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  selectedChatId === chat.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Аватар */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      {chat.customerAvatar ? (
                        <img
                          src={chat.customerAvatar}
                          alt={chat.customerName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium">
                          {chat.customerName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Информация о чате */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {chat.customerName}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {getSLAStatusIcon(chat.slaStatus)}
                        <span className={`text-xs ${getSLAStatusColor(chat.slaStatus)}`}>
                          {chat.lastMessageAt && formatTime(chat.lastMessageAt)}
                        </span>
                      </div>
                    </div>

                    {chat.listingTitle && (
                      <p className="text-xs text-gray-500 truncate">
                        {chat.listingTitle}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage || 'Нет сообщений'}
                      </p>
                      <div className="flex items-center space-x-1">
                        {chat.status === 'PENDING' && (
                          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                        )}
                        {chat.status === 'ARCHIVED' && (
                          <Archive className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Статистика */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {chats.filter(c => c.status === 'ACTIVE').length}
            </p>
            <p className="text-xs text-gray-500">Активные</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {chats.filter(c => c.unreadCount > 0).length}
            </p>
            <p className="text-xs text-gray-500">Непрочитанные</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {chats.filter(c => c.slaStatus === 'OVERDUE').length}
            </p>
            <p className="text-xs text-gray-500">Просроченные</p>
          </div>
        </div>
      </div>
    </div>
  )
}
