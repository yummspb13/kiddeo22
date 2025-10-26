// Система ролей и разрешений
export interface Permission {
  id: string
  name: string
  description: string
  category: 'events' | 'venues' | 'content' | 'users' | 'system'
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  color: string
  level: number // Уровень доступа (чем выше, тем больше прав)
}

// Определения разрешений
export const PERMISSIONS: Record<string, Permission> = {
  // События (Events)
  'events.create': {
    id: 'events.create',
    name: 'Создание событий',
    description: 'Создавать новые события',
    category: 'events'
  },
  'events.edit': {
    id: 'events.edit',
    name: 'Редактирование событий',
    description: 'Редактировать существующие события',
    category: 'events'
  },
  'events.delete': {
    id: 'events.delete',
    name: 'Удаление событий',
    description: 'Удалять события',
    category: 'events'
  },
  'events.moderate': {
    id: 'events.moderate',
    name: 'Модерация событий',
    description: 'Модерировать события других пользователей',
    category: 'events'
  },
  'events.publish': {
    id: 'events.publish',
    name: 'Публикация событий',
    description: 'Публиковать события',
    category: 'events'
  },

  // Места (Venues)
  'venues.create': {
    id: 'venues.create',
    name: 'Создание мест',
    description: 'Создавать новые места',
    category: 'venues'
  },
  'venues.edit': {
    id: 'venues.edit',
    name: 'Редактирование мест',
    description: 'Редактировать существующие места',
    category: 'venues'
  },
  'venues.delete': {
    id: 'venues.delete',
    name: 'Удаление мест',
    description: 'Удалять места',
    category: 'venues'
  },
  'venues.moderate': {
    id: 'venues.moderate',
    name: 'Модерация мест',
    description: 'Модерировать места других пользователей',
    category: 'venues'
  },

  // Контент (Content)
  'content.create': {
    id: 'content.create',
    name: 'Создание контента',
    description: 'Создавать статьи и контент',
    category: 'content'
  },
  'content.edit': {
    id: 'content.edit',
    name: 'Редактирование контента',
    description: 'Редактировать контент',
    category: 'content'
  },
  'content.delete': {
    id: 'content.delete',
    name: 'Удаление контента',
    description: 'Удалять контент',
    category: 'content'
  },
  'content.moderate': {
    id: 'content.moderate',
    name: 'Модерация контента',
    description: 'Модерировать контент других пользователей',
    category: 'content'
  },

  // Пользователи
  'users.view': {
    id: 'users.view',
    name: 'Просмотр пользователей',
    description: 'Просматривать список пользователей',
    category: 'users'
  },
  'users.edit': {
    id: 'users.edit',
    name: 'Редактирование пользователей',
    description: 'Редактировать пользователей',
    category: 'users'
  },
  'users.roles': {
    id: 'users.roles',
    name: 'Управление ролями',
    description: 'Назначать роли пользователям',
    category: 'users'
  },

  // Система
  'system.admin': {
    id: 'system.admin',
    name: 'Администрирование системы',
    description: 'Полный доступ к системе',
    category: 'system'
  },
  'system.analytics': {
    id: 'system.analytics',
    name: 'Аналитика',
    description: 'Просматривать аналитику',
    category: 'system'
  },
  'system.settings': {
    id: 'system.settings',
    name: 'Настройки системы',
    description: 'Изменять настройки системы',
    category: 'system'
  }
}

// Определения ролей
export const ROLES: Record<string, Role> = {
  ADMIN: {
    id: 'ADMIN',
    name: 'Администратор',
    description: 'Полный доступ ко всем функциям системы',
    permissions: Object.keys(PERMISSIONS),
    color: 'red',
    level: 100
  },
  MANAGER: {
    id: 'MANAGER',
    name: 'Управляющий (SEO)',
    description: 'Управление контентом и аналитикой',
    permissions: [
      'events.create', 'events.edit', 'events.moderate', 'events.publish',
      'venues.create', 'venues.edit', 'venues.moderate',
      'content.create', 'content.edit', 'content.moderate',
      'users.view', 'users.edit',
      'system.analytics'
    ],
    color: 'purple',
    level: 80
  },
  CONTENT_CREATOR: {
    id: 'CONTENT_CREATOR',
    name: 'Контент-креатор',
    description: 'Создание и редактирование контента',
    permissions: [
      'events.create', 'events.edit',
      'venues.create', 'venues.edit',
      'content.create', 'content.edit',
      'system.analytics'
    ],
    color: 'blue',
    level: 50
  },
  VENDOR: {
    id: 'VENDOR',
    name: 'Вендор',
    description: 'Управление своими местами и событиями',
    permissions: [
      'events.create', 'events.edit',
      'venues.create', 'venues.edit'
    ],
    color: 'green',
    level: 30
  },
  USER: {
    id: 'USER',
    name: 'Пользователь',
    description: 'Базовые права пользователя',
    permissions: [],
    color: 'gray',
    level: 10
  }
}

// Специализированные роли для конкретных областей
export const SPECIALIZED_ROLES = {
  'EVENTS_PRODUCT_MANAGER': {
    id: 'EVENTS_PRODUCT_MANAGER',
    name: 'Продуктолог по событиям',
    description: 'Управление событиями и их модерация',
    permissions: [
      'events.create', 'events.edit', 'events.moderate', 'events.publish',
      'system.analytics'
    ],
    color: 'orange',
    level: 60
  },
  'EVENTS_CONTENT_CREATOR': {
    id: 'EVENTS_CONTENT_CREATOR',
    name: 'Контент-креатор по событиям',
    description: 'Создание контента для событий',
    permissions: [
      'events.create', 'events.edit',
      'content.create', 'content.edit',
      'system.analytics'
    ],
    color: 'cyan',
    level: 40
  },
  'VENUES_PRODUCT_MANAGER': {
    id: 'VENUES_PRODUCT_MANAGER',
    name: 'Продуктолог по местам',
    description: 'Управление местами и их модерация',
    permissions: [
      'venues.create', 'venues.edit', 'venues.moderate',
      'system.analytics'
    ],
    color: 'teal',
    level: 60
  },
  'VENUES_CONTENT_CREATOR': {
    id: 'VENUES_CONTENT_CREATOR',
    name: 'Контент-креатор по местам',
    description: 'Создание контента для мест',
    permissions: [
      'venues.create', 'venues.edit',
      'content.create', 'content.edit',
      'system.analytics'
    ],
    color: 'indigo',
    level: 40
  },
  'BLOG_CONTENT_CREATOR': {
    id: 'BLOG_CONTENT_CREATOR',
    name: 'Контент-креатор блога',
    description: 'Создание контента для блога',
    permissions: [
      'content.create', 'content.edit',
      'system.analytics'
    ],
    color: 'pink',
    level: 40
  }
}

// Функции для работы с ролями
export function hasPermission(userRole: string, permission: string): boolean {
  const role = ROLES[userRole] || SPECIALIZED_ROLES[userRole]
  return role?.permissions.includes(permission) || false
}

export function hasAnyPermission(userRole: string, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission))
}

export function getRoleLevel(roleId: string): number {
  const role = ROLES[roleId] || SPECIALIZED_ROLES[roleId]
  return role?.level || 0
}

export function canAccessAdmin(userRole: string): boolean {
  return ['ADMIN', 'MANAGER', 'CONTENT_CREATOR'].includes(userRole) ||
         Object.keys(SPECIALIZED_ROLES).includes(userRole)
}

export function canAccessVendor(userRole: string): boolean {
  return ['VENDOR', 'ADMIN', 'MANAGER', 'USER'].includes(userRole)
}

// Получить все роли для выбора
export function getAllRoles(): Role[] {
  return [
    ...Object.values(ROLES),
    ...Object.values(SPECIALIZED_ROLES)
  ]
}
