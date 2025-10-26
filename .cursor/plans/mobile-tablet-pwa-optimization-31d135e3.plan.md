<!-- 31d135e3-2d69-4bda-a084-3bb01e8506ca ecfe5fa9-4f03-4a2e-a2eb-45873b606db3 -->
# План полной мобильной и PWA оптимизации Kiddeo

## Фаза 1: Фундамент и инфраструктура

### 1.1 Responsive Breakpoints и Typography

- Обновить `tailwind.config.mjs` с кастомными брейкпоинтами:
- `xs: 375px` (мобильные маленькие)
- `sm: 640px` (мобильные большие)
- `md: 768px` (планшеты портрет)
- `lg: 1024px` (планшеты ландшафт/маленькие десктопы)
- `xl: 1280px` (десктопы)
- `2xl: 1536px` (большие десктопы)
- Оптимизировать типографику в `globals.css` для мобильных (уменьшить размеры заголовков, улучшить line-height)
- Добавить CSS переменные для touch-targets (минимум 44px)

### 1.2 PWA Манифест и Service Worker

**Файлы:** `src/app/manifest.ts`, `public/sw.js`

- Улучшить манифест:
- Добавить различные размеры иконок (72, 96, 128, 144, 152, 192, 384, 512, 1024px)
- Настроить `display: "standalone"`, `theme_color`, `background_color`
- Добавить `screenshots` для промо установки
- Настроить `shortcuts` (быстрый доступ к разделам)
- Расширить Service Worker:
- Стратегии кеширования (Network First для API, Cache First для статики)
- Background Sync для офлайн действий (избранное, корзина)
- Push Notifications API
- Обработка обновлений SW (показ prompt пользователю)
- Офлайн режим с кешированием критичных страниц

### 1.3 Performance Utilities

**Создать:** `src/utils/performance.ts`, `src/hooks/useIntersectionObserver.ts`, `src/hooks/useImageOptimization.ts`

- Утилиты для lazy loading компонентов
- Image optimization хелперы (responsive images, WebP fallback)
- Virtual scrolling для длинных списков
- Debounce/throttle для скролла и resize

### 1.4 Touch Gesture Library

**Создать:** `src/hooks/useSwipe.ts`, `src/hooks/useLongPress.ts`, `src/hooks/usePullToRefresh.ts`

- Swipe detection (left, right, up, down)
- Long press handler
- Pull-to-refresh механизм
- Gesture prevention для конфликтующих взаимодействий

## Фаза 2: Навигация и Layout

### 2.1 Mobile Header с гибридной навигацией

**Файл:** `src/components/Header.tsx`

- Адаптивный Header:
- Desktop: текущий вид (логотип, навигация, поиск, корзина, профиль)
- Tablet: компактная версия с сворачиваемым меню
- Mobile: минимальный header (логотип, поиск-иконка, hamburger)
- Hamburger menu (slide-out drawer) для второстепенных разделов
- Fixed header на мобильных с hide-on-scroll behavior

### 2.2 Bottom Navigation Bar

**Создать:** `src/components/BottomNavigation.tsx`

- Фиксированная нижняя панель для главных разделов:
- Главная (🏠)
- События (📅)
- Места (📍)
- Корзина (🛒 с badge)
- Профиль (👤)
- Показывать только на мобильных (`< md`)
- Active state индикация
- Анимированные переходы

### 2.3 Mobile Footer

**Файл:** `src/components/Footer.tsx`

- Компактная версия для мобильных
- Аккордеон для групп ссылок
- Уменьшенные отступы и шрифты

### 2.4 Sidebar/Drawer Component

**Создать:** `src/components/MobileDrawer.tsx`

- Универсальный drawer для меню, фильтров
- Swipe-to-close функциональность
- Backdrop с tap-to-close
- Анимации открытия/закрытия

## Фаза 3: Публичные страницы

### 3.1 Главная страница

**Файл:** `src/app/page.tsx`

- Hero секция:
- Уменьшить высоту на мобильных (py-12 вместо py-20)
- Адаптивные размеры заголовков (text-3xl → text-4xl → text-5xl)
- Оптимизировать фоновое изображение для мобильных
- SmartSearch: мобильная версия с dropdown результатами
- Features Hero: стек вертикально на мобильных
- Блоки контента: адаптация `HomePageBlock.tsx`

### 3.2 HomePage Block и карусели

**Файл:** `src/components/homepage/HomePageBlock.tsx`

- Touch-оптимизация карусели:
- Swipe navigation (уже есть, улучшить)
- Snap scrolling для четких позиций
- Индикаторы прокрутки (dots)
- Оптимизация производительности (virtualization для длинных списков)
- Адаптивные карточки:
- Мобильные: 1 колонка или 1.5 колонки
- Планшеты: 2-3 колонки
- Desktop: 3-4 колонки

### 3.3 События - список и фильтры

**Файл:** `src/app/[city]/events/page.tsx`

- Timeline фильтры: мобильная версия в drawer
- EventsTimeline: горизонтальный скролл на мобильных
- Sidebar фильтры (CategoryFilter, AgeFilter, PriceFilter):
- Переместить в bottom sheet/drawer на мобильных
- Floating action button для открытия фильтров
- Badge с количеством активных фильтров
- Карта событий: скрыть на мобильных по умолчанию, кнопка для открытия в fullscreen
- Список событий: вертикальные карточки на мобильных

### 3.4 Карточка события

**Файл:** `src/app/event/[slug]/page.tsx`

- Hero изображение: адаптивная высота
- Галерея: swipeable carousel на мобильных
- Информационные блоки: вертикальный стек
- Кнопки действий: sticky bottom bar на мобильных
- Комментарии: оптимизация отображения

### 3.5 Места/Venues

**Файлы:** `src/app/city/[slug]/cat/venues/page.tsx`, `src/app/venue/[slug]/page.tsx`

- Аналогично событиям: фильтры в drawer, адаптивные карточки
- Venue карточка: мобильная оптимизация галереи, карты, отзывов
- Venue dashboard (публичная часть): адаптация для планшетов

### 3.6 Catalog и поиск

**Файлы:** `src/app/catalog/page.tsx`, `src/app/search/page.tsx`

- CatalogVenueCard: responsive варианты
- Фильтры категорий: горизонтальный скролл чипсов
- Результаты поиска: оптимизация для мобильных

### 3.7 Корзина и Checkout

**Файлы:** `src/app/cart/page.tsx`, `src/app/checkout/page.tsx`

- Корзина: вертикальный layout на мобильных
- Checkout форма: однокоронная компоновка, крупные поля
- Payment: адаптация для touch

### 3.8 Профиль пользователя

**Файлы:** `src/app/profile/*`

- ProfileLayoutClient: боковое меню → tabs или bottom sheet
- Все подстраницы профиля: адаптация форм и списков
- Favorites: grid → list на мобильных
- Orders: компактное отображение

### 3.9 Blog

**Файлы:** `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`

- Список статей: адаптивные карточки
- Статья: оптимизация типографики для чтения на мобильных
- Rich text editor стили: проверка отображения на узких экранах

## Фаза 4: Vendor Dashboard

### 4.1 Vendor Layout и навигация

**Файлы:** `src/app/vendor/layout.tsx`, `src/app/vendor/dashboard/*`

- Боковая навигация → hamburger menu + bottom bar для ключевых разделов
- Dashboard widgets: stack вертикально на мобильных, 2 колонки на планшетах
- Графики и аналитика: адаптивные размеры, свайп между периодами

### 4.2 Venue Management

**Файл:** `src/app/vendor/venues/*`

- Список venues: карточки вместо таблицы на мобильных
- Venue editor: форма в несколько экранов (wizard) или аккордеон секций
- Галерея: touch-оптимизированная загрузка и управление
- График работы: мобильный picker

### 4.3 Orders и Communications

**Файлы:** `src/app/vendor/orders/page.tsx`, `src/app/vendor/communications/*`

- Заказы: компактные карточки, свайп для действий
- Сообщения: chat-like интерфейс на мобильных

### 4.4 Onboarding

**Файл:** `src/app/vendor/onboarding/*`

- Multi-step wizard: адаптация для маленьких экранов
- Прогресс бар: sticky top

## Фаза 5: Admin Panel

### 5.1 Admin Layout

**Файл:** `src/app/admin/layout.tsx`

- Sidebar → collapsible drawer
- Dashboard: адаптивные виджеты и таблицы

### 5.2 Content Management

**Файлы:** `src/app/admin/listings/*`, `src/app/admin/venues/*`, `src/app/admin/blog/*`

- Таблицы → карточки на мобильных
- Inline editing → modal/drawer forms
- Bulk actions: touch-friendly selection

### 5.3 Afisha Admin

**Файл:** `src/app/admin/afisha/*`

- События, категории, редакторы: адаптивные формы
- Drag-and-drop: touch support через библиотеку (@hello-pangea/dnd уже есть)

### 5.4 Moderation и Analytics

**Файлы:** `src/app/admin/review-moderation/*`, `src/app/admin/moderation-analytics/*`

- Списки модерации: swipe actions для approve/reject
- Аналитика: responsive charts

### 5.5 Настройки и конфиги

**Файлы:** `src/app/admin/cities/`, `src/app/admin/filters/`, etc.

- Формы настроек: вертикальный layout
- Switches и toggles: увеличенные touch targets

## Фаза 6: Content CMS

### 6.1 Content Navigation

**Файл:** `src/app/content/ContentNavigation.tsx`

- Уже есть мобильная версия, улучшить:
- Добавить bottom bar для быстрого доступа
- Анимации переходов

### 6.2 Content Editor

**Файлы:** `src/app/content/new/*`

- Rich text editor (Tiptap): мобильная тулбар
- Sticky toolbar на мобильных
- Image upload: touch-optimized
- Preview: responsive modes

### 6.3 Plans и Analytics

**Файлы:** `src/app/content/plans/*`, `src/app/content/analytics/*`

- Calendar picker: мобильная версия
- Графики: swipe между периодами

## Фаза 7: UI Components оптимизация

### 7.1 Cards

**Файлы:** `src/components/CatalogVenueCard.tsx`, `src/components/EventCard.tsx`, etc.

- Responsive sizes
- Touch-friendly buttons и ссылки
- Image lazy loading

### 7.2 Forms и Inputs

**Разбросаны по проекту**

- Увеличенные input fields (min-height: 44px)
- Numeric keyboards для телефонов/цен
- Date pickers: native на мобильных
- File upload: улучшенный для touch

### 7.3 Modals и Dialogs

**Создать:** `src/components/MobileModal.tsx`

- Full-screen modals на мобильных
- Bottom sheets для быстрых действий
- Swipe-to-close

### 7.4 Tables

**Создать:** `src/components/ResponsiveTable.tsx`

- Desktop: обычные таблицы
- Tablet: скроллируемые таблицы
- Mobile: карточки или аккордеоны

### 7.5 Filters и Sorting

- Chip-based фильтры: horizontal scroll
- Sort dropdown: bottom sheet на мобильных
- Applied filters: dismissible chips

### 7.6 Maps

**Yandex Maps интеграция**

- Адаптивные размеры карты
- Touch controls
- Fullscreen mode на мобильных

### 7.7 Image Galleries

- Lightbox с swipe navigation
- Pinch-to-zoom
- Lazy loading

## Фаза 8: Touch Interactions

### 8.1 Swipe Actions

**Примеры использования:**

- Корзина: swipe для удаления товара
- Заказы: swipe для approve/reject
- Favorites: swipe для удаления
- Notifications: swipe для dismiss

### 8.2 Pull-to-Refresh

**Страницы:**

- Главная
- События/места списки
- Профиль (заказы, уведомления)
- Vendor dashboard

### 8.3 Long Press

- Карточки: long press для контекстного меню
- Images: long press для share/download

### 8.4 Gestures

- Pinch-to-zoom на картах и изображениях
- Two-finger scroll для вложенного скролла

## Фаза 9: Performance оптимизация

### 9.1 Code Splitting

**Файл:** `next.config.ts`

- Dynamic imports для тяжелых компонентов
- Route-based splitting (уже есть в Next.js)
- Vendor chunks optimization

### 9.2 Image Optimization

- Next.js Image component везде
- Responsive images (srcSet)
- WebP/AVIF форматы
- Blur placeholders
- Lazy loading

### 9.3 Font Optimization

**Файл:** `src/app/fonts.ts`

- Проверить font loading strategy
- Subset fonts для кириллицы
- Font display: swap

### 9.4 Virtual Scrolling

**Библиотека:** `react-window` или `react-virtual`

- Длинные списки событий
- Admin таблицы
- Комментарии

### 9.5 React Optimization

- Мемоизация компонентов (React.memo)
- useMemo/useCallback для дорогих вычислений
- Lazy loading роутов
- Suspense boundaries

### 9.6 Analytics и Monitoring

**Создать:** `src/utils/performance-monitor.ts`

- Web Vitals tracking (LCP, FID, CLS)
- Custom performance marks
- Error boundary с reporting

## Фаза 10: PWA Features

### 10.1 Install Prompt

**Создать:** `src/components/PWAInstallPrompt.tsx`

- Кастомный промпт для установки
- Показывать после определенных действий
- A2HS (Add to Home Screen) guidance
- Dismiss и "don't show again"

### 10.2 Push Notifications

**Создать:** `src/utils/push-notifications.ts`, API endpoint

- Запрос разрешения
- Subscription management
- Notification types:
- Новые события в избранных категориях
- Статус заказа
- Напоминания о событиях
- Vendor: новые заказы/сообщения
- Notification actions (quick reply, etc.)

### 10.3 Background Sync

**Service Worker расширение**

- Синхронизация избранного офлайн
- Отложенная отправка форм
- Загрузка изображений в фоне

### 10.4 Offline Mode

- Определение online/offline статуса
- Offline indicator UI
- Кеширование критичных данных (профиль, избранное)
- Offline страница с полезным контентом
- Retry механизм для failed requests

### 10.5 App Shortcuts

**Манифест**

- Быстрый доступ к разделам:
- Поиск событий
- Мои заказы
- Избранное
- (Vendor) Новые заказы

## Фаза 11: Tablet-Specific оптимизация

### 11.1 Breakpoint Strategy

- Portrait tablets (md: 768px): гибрид мобильного и desktop
- Landscape tablets (lg: 1024px): почти desktop с адаптациями

### 11.2 Layout Adjustments

- Sidebar: collapsible на планшетах
- Content: 2-колоночный layout где возможно
- Forms: две колонки для полей

### 11.3 Touch Targets

- Проверить все кнопки (минимум 44x44px)
- Увеличенные dropdowns и selects
- Spacing между интерактивными элементами

### 11.4 Typography

- Промежуточные размеры шрифтов
- Оптимальная длина строк (60-80 символов)

## Фаза 12: Testing и Documentation

### 12.1 Device Testing Checklist

**Создать:** `MOBILE_TESTING_CHECKLIST.md`

- iPhone: SE, 12/13/14, 14 Pro Max
- Android: Samsung Galaxy S21, Pixel 6, OnePlus
- Tablets: iPad, iPad Pro, Samsung Tab
- Браузеры: Safari iOS, Chrome Android, Firefox Android

### 12.2 Responsive Testing Matrix

**Создать:** `RESPONSIVE_TEST_MATRIX.md`

- Breakpoints тестирование
- Orientation (portrait/landscape)
- Touch interactions
- PWA features

### 12.3 Performance Testing

- Lighthouse mobile audits (target: 90+)
- Network throttling (3G, 4G)
- Device throttling (mid-tier mobile)
- Web Vitals targets:
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

### 12.4 Accessibility Testing

- Touch target sizes
- Contrast ratios
- Screen reader compatibility
- Keyboard navigation (планшеты с клавиатурой)

### 12.5 Documentation

**Создать:**

- `MOBILE_GUIDE.md` - гайд по разработке мобильных компонентов
- `PWA_FEATURES.md` - документация PWA функций
- `TOUCH_INTERACTIONS.md` - гайд по touch interactions
- Обновить README с инструкциями по тестированию

## Фаза 13: Final Polish

### 13.1 Browser Testing

- Safari iOS (специфичные баги)
- Chrome Android
- Samsung Internet
- Firefox Android

### 13.2 Edge Cases

- Notch/Safe areas (iPhone)
- Fold phones (Samsung Z Fold)
- Small screens (< 375px)
- Large tablets (> 1024px)

### 13.3 Performance Audit

- Bundle size анализ
- Lighthouse CI integration
- Performance regression tests

### 13.4 UX Review

- User flow testing на мобильных
- Touch interaction smoothness
- Loading states
- Error states на мобильных

### 13.5 Final QA

- Критичные пути (регистрация, оформление заказа)
- PWA установка и работа
- Offline functionality
- Push notifications delivery

### To-dos

- [ ] Настроить responsive breakpoints в Tailwind, оптимизировать типографику и CSS переменные для touch-targets
- [ ] Улучшить PWA манифест (иконки, screenshots, shortcuts) и расширить Service Worker (push notifications, background sync)
- [ ] Создать утилиты производительности (lazy loading, image optimization, virtual scrolling)
- [ ] Реализовать touch gesture hooks (swipe, long press, pull-to-refresh)
- [ ] Создать гибридную навигацию (адаптивный Header, Bottom Navigation Bar, Mobile Drawer)
- [ ] Адаптировать публичные страницы (главная, события, места, карточки) для мобильных и планшетов
- [ ] Оптимизировать HomePageBlock и карусели для touch (swipe, snap, virtualization)
- [ ] Переместить фильтры в drawer/bottom sheet на мобильных с floating action button
- [ ] Адаптировать Vendor Dashboard (layout, venue management, orders, onboarding) для мобильных/планшетов
- [ ] Адаптировать Admin Panel (layout, tables→cards, forms, moderation) для мобильных/планшетов
- [ ] Оптимизировать Content CMS (editor toolbar, планы, аналитика) для мобильных
- [ ] Создать responsive версии UI компонентов (cards, forms, modals, tables, filters, maps, galleries)
- [ ] Реализовать swipe actions для корзины, заказов, избранного, уведомлений
- [ ] Добавить pull-to-refresh на главную, списки событий/мест, профиль, vendor dashboard
- [ ] Настроить code splitting, dynamic imports для тяжелых компонентов
- [ ] Оптимизировать изображения (Next.js Image, responsive, WebP, lazy loading)
- [ ] Внедрить virtual scrolling для длинных списков (события, admin таблицы, комментарии)
- [ ] Оптимизировать React (мемоизация, useMemo/useCallback, Suspense)
- [ ] Создать кастомный PWA install prompt с A2HS guidance
- [ ] Реализовать push notifications (subscription, типы уведомлений, actions)
- [ ] Добавить background sync для избранного, форм, загрузки изображений
- [ ] Реализовать offline mode (indicator, кеширование, offline страница, retry)
- [ ] Специфичная оптимизация для планшетов (layouts, touch targets, typography)
- [ ] Создать testing checklist, responsive matrix, performance targets, accessibility проверки
- [ ] Тестирование на Safari iOS, Chrome/Firefox Android, Samsung Internet
- [ ] Performance audit (Lighthouse, bundle size, Web Vitals)
- [ ] Финальное QA (критичные пути, PWA функции, offline, push notifications)