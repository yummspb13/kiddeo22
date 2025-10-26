'use client'

/**
 * Менеджер сессий для предотвращения конфликтов между пользователями
 */
export class SessionManager {
  private static instance: SessionManager
  private currentUserId: string | null = null
  private sessionId: string | null = null
  private broadcastChannel: BroadcastChannel | null = null

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  constructor() {
    // Инициализируем BroadcastChannel для синхронизации между вкладками
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('session-sync')
      this.broadcastChannel.addEventListener('message', this.handleBroadcastMessage.bind(this))
    }

    // Отслеживаем изменения localStorage
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange.bind(this))
    }
  }

  /**
   * Инициализация новой сессии пользователя
   */
  async initializeSession(userId: string): Promise<void> {
    console.log('🔄 SessionManager: Initializing session for user:', userId)
    
    // Если это новый пользователь, очищаем все данные
    if (this.currentUserId && this.currentUserId !== userId) {
      console.log('🔄 SessionManager: Different user detected, clearing data')
      await this.clearAllData()
    }

    this.currentUserId = userId
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Сохраняем информацию о сессии
    localStorage.setItem('currentUserId', userId)
    localStorage.setItem('sessionId', this.sessionId)
    
    // Уведомляем другие вкладки о входе пользователя
    this.broadcastMessage('USER_LOGIN', { userId, sessionId: this.sessionId })
    
    console.log('✅ SessionManager: Session initialized', { userId, sessionId: this.sessionId })
  }

  /**
   * Проверка актуальности сессии
   */
  isSessionValid(userId: string): boolean {
    const storedUserId = localStorage.getItem('currentUserId')
    const storedSessionId = localStorage.getItem('sessionId')
    
    if (!storedUserId || !storedSessionId) {
      return false
    }

    if (storedUserId !== userId) {
      console.log('⚠️ SessionManager: User mismatch detected')
      return false
    }

    return true
  }

  /**
   * Очистка всех данных при смене пользователя
   */
  async clearAllData(): Promise<void> {
    console.log('🧹 SessionManager: Clearing all data')
    
    // Уведомляем другие вкладки о выходе пользователя
    this.broadcastMessage('USER_LOGOUT', {})
    
    // Очищаем localStorage
    localStorage.clear()
    
    // Очищаем sessionStorage
    sessionStorage.clear()
    
    // Очищаем cookies (только те, что можем)
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=")
      const name = eqPos > -1 ? c.substr(0, eqPos) : c
      document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
    })
    
    // Сбрасываем внутренние переменные
    this.currentUserId = null
    this.sessionId = null
    
    // Принудительно обновляем страницу для полной очистки
    window.location.reload()
  }

  /**
   * Получение текущего пользователя
   */
  getCurrentUserId(): string | null {
    return this.currentUserId || localStorage.getItem('currentUserId')
  }

  /**
   * Получение ID сессии
   */
  getSessionId(): string | null {
    return this.sessionId || localStorage.getItem('sessionId')
  }

  /**
   * Выход из системы
   */
  async logout(): Promise<void> {
    console.log('🚪 SessionManager: Logging out')
    await this.clearAllData()
  }

  /**
   * Обработка сообщений от других вкладок
   */
  private handleBroadcastMessage(event: MessageEvent): void {
    const { type, data } = event.data
    
    console.log('📡 SessionManager: Received broadcast message', { type, data })
    
    switch (type) {
      case 'USER_LOGIN':
        this.handleUserLogin(data.userId, data.sessionId)
        break
      case 'USER_LOGOUT':
        this.handleUserLogout()
        break
      case 'SESSION_CHANGE':
        this.handleSessionChange(data.userId, data.sessionId)
        break
    }
  }

  /**
   * Обработка изменений localStorage
   */
  private handleStorageChange(event: StorageEvent): void {
    if (event.key === 'currentUserId' || event.key === 'sessionId') {
      console.log('💾 SessionManager: Storage changed', { key: event.key, newValue: event.newValue })
      
      if (event.key === 'currentUserId') {
        if (event.newValue && event.newValue !== this.currentUserId) {
          // Пользователь изменился в другой вкладке
          this.handleSessionChange(event.newValue, localStorage.getItem('sessionId'))
        } else if (!event.newValue && this.currentUserId) {
          // Пользователь вышел в другой вкладке
          this.handleUserLogout()
        }
      }
    }
  }

  /**
   * Обработка входа пользователя
   */
  private handleUserLogin(userId: string, sessionId: string): void {
    console.log('👤 SessionManager: User login detected', { userId, sessionId })
    
    if (this.currentUserId && this.currentUserId !== userId) {
      // Другой пользователь вошел, очищаем данные
      this.clearAllData()
    }
    
    this.currentUserId = userId
    this.sessionId = sessionId
  }

  /**
   * Обработка выхода пользователя
   */
  private handleUserLogout(): void {
    console.log('👋 SessionManager: User logout detected')
    this.currentUserId = null
    this.sessionId = null
  }

  /**
   * Обработка смены сессии
   */
  private handleSessionChange(userId: string, sessionId: string | null): void {
    console.log('🔄 SessionManager: Session change detected', { userId, sessionId })
    
    if (this.currentUserId && this.currentUserId !== userId) {
      // Пользователь изменился, очищаем данные
      this.clearAllData()
    }
    
    this.currentUserId = userId
    this.sessionId = sessionId
  }

  /**
   * Отправка сообщения другим вкладкам
   */
  private broadcastMessage(type: string, data: any): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type, data })
    }
  }
}

/**
 * Хук для управления сессиями
 */
export function useSessionManager() {
  const sessionManager = SessionManager.getInstance()

  const initializeSession = async (userId: string) => {
    await sessionManager.initializeSession(userId)
  }

  const isSessionValid = (userId: string) => {
    return sessionManager.isSessionValid(userId)
  }

  const clearAllData = async () => {
    await sessionManager.clearAllData()
  }

  const logout = async () => {
    await sessionManager.logout()
  }

  const getCurrentUserId = () => {
    return sessionManager.getCurrentUserId()
  }

  const getSessionId = () => {
    return sessionManager.getSessionId()
  }

  return {
    initializeSession,
    isSessionValid,
    clearAllData,
    logout,
    getCurrentUserId,
    getSessionId
  }
}
