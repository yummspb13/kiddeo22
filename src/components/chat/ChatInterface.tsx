// src/components/chat/ChatInterface.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video,
  Archive,
  Ban,
  Star,
  Clock,
  Check,
  CheckCheck
} from "lucide-react"

interface Message {
  id: number
  content: string
  senderId: number
  senderType: 'vendor' | 'customer'
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' | 'TEMPLATE'
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
  readAt?: Date
  createdAt: Date
  metadata?: unknown
}

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
}

interface ChatInterfaceProps {
  chat: Chat
  messages: Message[]
  onSendMessage: (content: string, type?: 'TEXT' | 'TEMPLATE') => void
  onSendFile: (file: File) => void
  onArchiveChat: () => void
  onBlockChat: () => void
  onMarkAsRead: () => void
  templates?: Array<{
    id: number
    name: string
    content: string
    category: string
  }>
}

export default function ChatInterface({
  chat,
  messages,
  onSendMessage,
  onSendFile,
  onArchiveChat,
  onBlockChat,
  onMarkAsRead,
  templates = []
}: ChatInterfaceProps) {
  const [message, setMessage] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Отмечаем сообщения как прочитанные при открытии чата
    onMarkAsRead()
  }, [chat.id])

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onSendFile(file)
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <Check className="w-4 h-4 text-gray-400" />
      case 'DELIVERED':
        return <CheckCheck className="w-4 h-4 text-gray-400" />
      case 'READ':
        return <CheckCheck className="w-4 h-4 text-blue-500" />
      case 'FAILED':
        return <span className="text-red-500">!</span>
      default:
        return null
    }
  }

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, typeof templates>)

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Заголовок чата */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            {chat.customerAvatar ? (
              <img
                src={chat.customerAvatar}
                alt={chat.customerName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-600 font-medium">
                {chat.customerName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{chat.customerName}</h3>
            {chat.listingTitle && (
              <p className="text-sm text-gray-500">{chat.listingTitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Video className="w-5 h-5" />
          </button>
          <div className="relative">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <MoreVertical className="w-5 h-5" />
            </button>
            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <div className="py-1">
                <button
                  onClick={onArchiveChat}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Архивировать
                </button>
                <button
                  onClick={onBlockChat}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Заблокировать
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderType === 'vendor' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.senderType === 'vendor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs opacity-70">
                  {formatTime(msg.createdAt)}
                </span>
                {msg.senderType === 'vendor' && (
                  <div className="ml-2">
                    {getStatusIcon(msg.status)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Шаблоны ответов */}
      {showTemplates && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="space-y-4">
            {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                  {category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {categoryTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        onSendMessage(template.content, 'TEMPLATE')
                        setShowTemplates(false)
                      }}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Поле ввода */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <Star className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <Smile className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Введите сообщение..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Скрытый input для файлов */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx"
        />
      </div>
    </div>
  )
}
