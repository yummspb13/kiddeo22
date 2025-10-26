// src/app/vendor/communications/CommunicationsClient.tsx
"use client"

import { useState, useEffect } from "react"
import { 
  MessageSquare, 
  Star, 
  Bell, 
  Settings,
  Users,
  Clock,
  TrendingUp
} from "lucide-react"
import ChatList from "@/components/chat/ChatList"
import ChatInterface from "@/components/chat/ChatInterface"
import ChatTemplates from "@/components/chat/ChatTemplates"
import ReviewsManager from "@/components/chat/ReviewsManager"
import NotificationsManager from "@/components/chat/NotificationsManager"

interface CommunicationsClientProps {
  vendorId: number
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
  lastMessage?: string
  slaStatus?: 'ON_TIME' | 'WARNING' | 'OVERDUE'
}

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

interface Review {
  id: number
  listingId: number
  listingTitle: string
  userId: number
  userName: string
  userAvatar?: string
  rating: number
  title?: string
  content: string
  isPublic: boolean
  isModerated: boolean
  moderatorId?: number
  moderatedAt?: Date
  vendorReply?: string
  replyAt?: Date
  createdAt: Date
  helpfulCount: number
  reportCount: number
}

interface Notification {
  id: number
  type: 'MESSAGE' | 'REVIEW' | 'BOOKING' | 'PAYMENT' | 'SYSTEM'
  channel: 'EMAIL' | 'PUSH' | 'INBOX' | 'SMS'
  title: string
  content: string
  data?: unknown
  isRead: boolean
  sentAt?: Date
  readAt?: Date
  createdAt: Date
}

interface Template {
  id: number
  name: string
  content: string
  category: string
  isActive: boolean
  usageCount: number
  createdAt: Date
}

export default function CommunicationsClient({ vendorId }: CommunicationsClientProps) {
  const [activeTab, setActiveTab] = useState<'chats' | 'templates' | 'reviews' | 'notifications'>('chats')
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [templates, setTemplates] = useState<Template[]>([])

  // Загрузка данных
  useEffect(() => {
    loadChats()
    loadReviews()
    loadNotifications()
    loadTemplates()
  }, [vendorId])

  const loadChats = async () => {
    // TODO: Загрузить чаты с сервера
    const mockChats: Chat[] = [
      {
        id: 1,
        vendorId,
        customerId: 1,
        customerName: 'Анна Петрова',
        listingTitle: 'Мастер-класс по рисованию',
        status: 'ACTIVE',
        lastMessageAt: new Date(),
        unreadCount: 2,
        lastMessage: 'Спасибо за интересный мастер-класс!',
        slaStatus: 'ON_TIME'
      },
      {
        id: 2,
        vendorId,
        customerId: 2,
        customerName: 'Михаил Иванов',
        listingTitle: 'Спортивная секция',
        status: 'ACTIVE',
        lastMessageAt: new Date(Date.now() - 1000 * 60 * 30),
        unreadCount: 0,
        lastMessage: 'Когда будет следующее занятие?',
        slaStatus: 'WARNING'
      }
    ]
    setChats(mockChats)
  }

  const loadMessages = async (chatId: number) => {
    // TODO: Загрузить сообщения чата с сервера
    const mockMessages: Message[] = [
      {
        id: 1,
        content: 'Здравствуйте! Интересует мастер-класс по рисованию',
        senderId: 1,
        senderType: 'customer',
        type: 'TEXT',
        status: 'READ',
        readAt: new Date(),
        createdAt: new Date(Date.now() - 1000 * 60 * 60)
      },
      {
        id: 2,
        content: 'Добро пожаловать! Мастер-класс проходит каждую субботу в 15:00',
        senderId: vendorId,
        senderType: 'vendor',
        type: 'TEXT',
        status: 'READ',
        readAt: new Date(),
        createdAt: new Date(Date.now() - 1000 * 60 * 45)
      }
    ]
    setMessages(mockMessages)
  }

  const loadReviews = async () => {
    // TODO: Загрузить отзывы с сервера
    const mockReviews: Review[] = [
      {
        id: 1,
        listingId: 1,
        listingTitle: 'Мастер-класс по рисованию',
        userId: 1,
        userName: 'Анна Петрова',
        rating: 5,
        title: 'Отличный мастер-класс!',
        content: 'Очень понравилось, преподаватель объясняет понятно, атмосфера дружелюбная',
        isPublic: true,
        isModerated: true,
        moderatedAt: new Date(),
        helpfulCount: 3,
        reportCount: 0,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
      }
    ]
    setReviews(mockReviews)
  }

  const loadNotifications = async () => {
    // TODO: Загрузить уведомления с сервера
    const mockNotifications: Notification[] = [
      {
        id: 1,
        type: 'MESSAGE',
        channel: 'INBOX',
        title: 'Новое сообщение',
        content: 'Анна Петрова написала в чат',
        isRead: false,
        createdAt: new Date()
      }
    ]
    setNotifications(mockNotifications)
  }

  const loadTemplates = async () => {
    // TODO: Загрузить шаблоны с сервера
    const mockTemplates: Template[] = [
      {
        id: 1,
        name: 'Приветствие',
        content: 'Добро пожаловать! Чем могу помочь?',
        category: 'greeting',
        isActive: true,
        usageCount: 15,
        createdAt: new Date()
      }
    ]
    setTemplates(mockTemplates)
  }

  const handleSelectChat = (chatId: number) => {
    setSelectedChatId(chatId)
    loadMessages(chatId)
  }

  const handleSendMessage = async (content: string, type: 'TEXT' | 'TEMPLATE' = 'TEXT') => {
    if (!selectedChatId) return
    
    // TODO: Отправить сообщение на сервер
    const newMessage: Message = {
      id: Date.now(),
      content,
      senderId: vendorId,
      senderType: 'vendor',
      type,
      status: 'SENT',
      createdAt: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
  }

  const handleSendFile = async (file: File) => {
    if (!selectedChatId) return
    
    // TODO: Загрузить файл и отправить сообщение
    console.log('Sending file:', file.name)
  }

  const handleArchiveChat = async (chatId: number) => {
    // TODO: Архивировать чат
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, status: 'ARCHIVED' as const } : chat
    ))
  }

  const handleBlockChat = async (chatId: number) => {
    // TODO: Заблокировать чат
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, status: 'BLOCKED' as const } : chat
    ))
  }

  const handleMarkAsRead = async (chatId: number) => {
    // TODO: Отметить сообщения как прочитанные
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
    ))
  }

  const handleCreateTemplate = async (template: Omit<Template, 'id' | 'usageCount' | 'createdAt'>) => {
    // TODO: Создать шаблон на сервере
    const newTemplate: Template = {
      ...template,
      id: Date.now(),
      usageCount: 0,
      createdAt: new Date()
    }
    setTemplates(prev => [...prev, newTemplate])
  }

  const handleUpdateTemplate = async (id: number, updates: Partial<Template>) => {
    // TODO: Обновить шаблон на сервере
    setTemplates(prev => prev.map(template => 
      template.id === id ? { ...template, ...updates } : template
    ))
  }

  const handleDeleteTemplate = async (id: number) => {
    // TODO: Удалить шаблон на сервере
    setTemplates(prev => prev.filter(template => template.id !== id))
  }

  const handleUseTemplate = async (id: number) => {
    // TODO: Использовать шаблон
    const template = templates.find(t => t.id === id)
    if (template && selectedChatId) {
      await handleSendMessage(template.content, 'TEMPLATE')
      setTemplates(prev => prev.map(t => 
        t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t
      ))
    }
  }

  const handleReplyToReview = async (reviewId: number, reply: string) => {
    // TODO: Ответить на отзыв
    setReviews(prev => prev.map(review => 
      review.id === reviewId ? { 
        ...review, 
        vendorReply: reply, 
        replyAt: new Date() 
      } : review
    ))
  }

  const handleModerateReview = async (reviewId: number, action: 'approve' | 'reject' | 'hide') => {
    // TODO: Модерировать отзыв
    setReviews(prev => prev.map(review => 
      review.id === reviewId ? { 
        ...review, 
        isModerated: true,
        isPublic: action === 'approve',
        moderatedAt: new Date()
      } : review
    ))
  }

  const handleMarkHelpful = async (reviewId: number) => {
    // TODO: Отметить отзыв как полезный
    setReviews(prev => prev.map(review => 
      review.id === reviewId ? { 
        ...review, 
        helpfulCount: review.helpfulCount + 1 
      } : review
    ))
  }

  const handleReportReview = async (reviewId: number, reason: string) => {
    // TODO: Пожаловаться на отзыв
    setReviews(prev => prev.map(review => 
      review.id === reviewId ? { 
        ...review, 
        reportCount: review.reportCount + 1 
      } : review
    ))
  }

  const handleMarkNotificationAsRead = async (id: number) => {
    // TODO: Отметить уведомление как прочитанное
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, isRead: true, readAt: new Date() } : notification
    ))
  }

  const handleMarkAllNotificationsAsRead = async () => {
    // TODO: Отметить все уведомления как прочитанные
    setNotifications(prev => prev.map(notification => ({
      ...notification, 
      isRead: true, 
      readAt: new Date()
    })))
  }

  const handleDeleteNotification = async (id: number) => {
    // TODO: Удалить уведомление
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const handleUpdateNotificationSettings = async (settings: unknown) => {
    // TODO: Обновить настройки уведомлений
    console.log('Updating notification settings:', settings)
  }

  const selectedChat = selectedChatId ? chats.find(c => c.id === selectedChatId) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Коммуникации</h1>
          <p className="text-gray-600">Управляйте общением с клиентами</p>
        </div>

        {/* Навигация */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'chats', label: 'Чаты', icon: MessageSquare, count: chats.filter(c => c.unreadCount > 0).length },
              { id: 'templates', label: 'Шаблоны', icon: Settings },
              { id: 'reviews', label: 'Отзывы', icon: Star, count: reviews.filter(r => !r.isModerated).length },
              { id: 'notifications', label: 'Уведомления', icon: Bell, count: notifications.filter(n => !n.isRead).length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
                {tab.count && tab.count > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Контент */}
        {activeTab === 'chats' && (
          <div className="bg-white rounded-lg shadow">
            <div className="h-[600px] flex">
              <div className="w-1/3 border-r border-gray-200">
                <ChatList
                  chats={chats}
                  selectedChatId={selectedChatId || undefined}
                  onSelectChat={handleSelectChat}
                  onArchiveChat={handleArchiveChat}
                  onBlockChat={handleBlockChat}
                  onMarkAsRead={handleMarkAsRead}
                />
              </div>
              <div className="flex-1">
                {selectedChat ? (
                  <ChatInterface
                    chat={selectedChat}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onSendFile={handleSendFile}
                    onArchiveChat={() => handleArchiveChat(selectedChat.id)}
                    onBlockChat={() => handleBlockChat(selectedChat.id)}
                    onMarkAsRead={() => handleMarkAsRead(selectedChat.id)}
                    templates={templates}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                      <p>Выберите чат для начала общения</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <ChatTemplates
            templates={templates}
            onCreateTemplate={handleCreateTemplate}
            onUpdateTemplate={handleUpdateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onUseTemplate={handleUseTemplate}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewsManager
            reviews={reviews}
            onReplyToReview={handleReplyToReview}
            onModerateReview={handleModerateReview}
            onMarkHelpful={handleMarkHelpful}
            onReportReview={handleReportReview}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsManager
            notifications={notifications}
            onMarkAsRead={handleMarkNotificationAsRead}
            onMarkAllAsRead={handleMarkAllNotificationsAsRead}
            onDeleteNotification={handleDeleteNotification}
            onUpdateSettings={handleUpdateNotificationSettings}
          />
        )}
      </div>
    </div>
  )
}
