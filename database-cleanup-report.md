# 📊 Отчет по очистке базы данных Kiddeo

## 🎯 Общая статистика
- **Всего моделей:** 113
- **Активно используемых:** 76 (67%)
- **Неиспользуемых:** 37 (33%)
- **Безопасно удалить:** 34 (30%)
- **Требуют изучения:** 3 (3%)

---

## 🗑️ БЕЗОПАСНО УДАЛИТЬ (34 модели)

### VenueVendorUser
- **Описание:** Связующая таблица между пользователями и вендорами мест
- **Использование в коде:** ❌ 0 упоминаний
- **Записей в БД:** 0
- **API роуты:** Нет
- **Рекомендация:** 🗑️ **УДАЛИТЬ**

### BookingItem
- **Описание:** Элементы бронирования
- **Использование в коде:** ❌ 0 упоминаний
- **Записей в БД:** 0
- **API роуты:** Нет
- **Рекомендация:** 🗑️ **УДАЛИТЬ**

### Account
- **Описание:** Аккаунты пользователей
- **Использование в коде:** ❌ 0 упоминаний
- **Записей в БД:** 0
- **API роуты:** Нет
- **Рекомендация:** 🗑️ **УДАЛИТЬ**

### AdminDashboard
- **Описание:** Админские дашборды
- **Использование в коде:** ❌ 0 упоминаний
- **Записей в БД:** 0
- **API роуты:** Нет
- **Рекомендация:** 🗑️ **УДАЛИТЬ**

### Chat & Communication
- **Chat** - чаты
- **ChatTemplate** - шаблоны чатов
- **Message** - сообщения
- **Notification** - уведомления
- **EmailLog** - логи email
- **EmailTemplate** - шаблоны email
- **Использование в коде:** ❌ 0 упоминаний для всех
- **API роуты:** Нет
- **Рекомендация:** 🗑️ **УДАЛИТЬ ВСЕ**

### Content Management (неиспользуемые)
- **ContentAnalytics** - аналитика контента
- **ContentComment** - комментарии к контенту
- **ContentLike** - лайки контента
- **ContentListing** - связи контент-листинг
- **ContentTemplate** - шаблоны контента
- **Использование в коде:** ❌ 0 упоминаний для всех
- **API роуты:** Нет
- **Рекомендация:** 🗑️ **УДАЛИТЬ ВСЕ**

### Listing System (неиспользуемые)
- **ListingCommission** - комиссии листингов
- **ListingTag** - теги листингов
- **Использование в коде:** ❌ 0 упоминаний
- **API роуты:** Нет
- **Рекомендация:** 🗑️ **УДАЛИТЬ**

### Payment System (неиспользуемые)
- **OrderItem** - элементы заказов
- **Payout** - выплаты
- **Использование в коде:** ❌ 0 упоминаний
- **API роуты:** Нет
- **Рекомендация:** 🗑️ **УДАЛИТЬ**

### Publication System
- **PublicationPlan** - планы публикации
- **PublicationPlanItem** - элементы планов публикации
- **Использование в коде:** ❌ 0 упоминаний
- **API роуты:** Нет
- **Рекомендация:** 🗑️ **УДАЛИТЬ**

### Review System (неиспользуемые)
- **Review** - отзывы (общая модель)
- **Использование в коде:** ❌ 0 упоминаний
- **API роуты:** Нет
- **Рекомендация:** 🗑️ **УДАЛИТЬ**

### System Infrastructure (неиспользуемые)
- **FilterConfig** - конфигурация фильтров
- **SectionVisibility** - видимость секций
- **Session** - сессии
- **StockAvatar** - аватары по умолчанию
- **VerificationToken** - токены верификации
- **UserSession** - пользовательские сессии
- **Использование в коде:** ❌ 0 упоминаний для всех
- **API роуты:** Нет
- **Рекомендация:** 🗑️ **УДАЛИТЬ ВСЕ**

### User System (неиспользуемые)
- **UserComment** - комментарии пользователей
- **UserCommentVote** - голоса за комментарии
- **UserInterest** - интересы пользователей
- **UserLoyaltyPoint** - баллы лояльности пользователей
- **UserReviewVote** - голоса за отзывы
- **UserSubscription** - подписки пользователей
- **Использование в коде:** ❌ 0 упоминаний для всех
- **API роуты:** Нет
- **Рекомендация:** 🗑️ **УДАЛИТЬ ВСЕ**

---

## ⚠️ ТРЕБУЮТ ДОПОЛНИТЕЛЬНОГО ИЗУЧЕНИЯ (3 модели)

### AIAssistant
- **Описание:** AI ассистенты
- **Использование в коде:** ❌ 0 упоминаний
- **Записей в БД:** 0
- **API роуты:** Нет
- **Рекомендация:** ⚠️ **ОСТАВИТЬ** (может использоваться в будущих AI функциях)

### AIRecommendation
- **Описание:** AI рекомендации
- **Использование в коде:** ❌ 0 упоминаний
- **Записей в БД:** 0
- **API роуты:** Нет
- **Рекомендация:** ⚠️ **ОСТАВИТЬ** (может использоваться в рекомендательной системе)

### SLARule
- **Описание:** Правила SLA
- **Использование в коде:** ❌ 0 упоминаний
- **Записей в БД:** 0
- **API роуты:** Нет
- **Рекомендация:** ⚠️ **ОСТАВИТЬ** (может использоваться в SLA системе)

---

## ✅ АКТИВНО ИСПОЛЬЗУЕМЫЕ МОДЕЛИ (76 моделей)

### 🏆 ТОП-10 САМЫХ ИСПОЛЬЗУЕМЫХ

#### 1. City (44 использования)
- **Описание:** Города
- **API роуты:** 
  - `/api/cities`
  - `/api/public/cities`
  - `/api/admin/cities`
- **Рекомендация:** ✅ **ОСТАВИТЬ**

#### 2. Vendor (40 использований)
- **Описание:** Вендоры
- **API роуты:**
  - `/api/vendor/onboarding`
  - `/api/vendors/start`
  - `/api/vendors/upgrade`
  - `/api/vendors/resubmit`
  - `/api/admin/vendors`
- **Рекомендация:** ✅ **ОСТАВИТЬ**

#### 3. VenuePartner (37 использований)
- **Описание:** Партнеры мест
- **API роуты:**
  - `/api/admin/venues/partners`
  - `/api/venues`
  - `/api/public/venues`
- **Рекомендация:** ✅ **ОСТАВИТЬ**

#### 4. User (23 использования)
- **Описание:** Пользователи
- **API роуты:**
  - `/api/auth/register`
  - `/api/profile/settings`
  - `/api/admin/users`
- **Рекомендация:** ✅ **ОСТАВИТЬ**

#### 5. AfishaEvent (22 использования)
- **Описание:** События афиши
- **API роуты:**
  - `/api/afisha/events`
  - `/api/admin/afisha/events`
  - `/api/events`
- **Рекомендация:** ✅ **ОСТАВИТЬ**

#### 6. Listing (21 использование)
- **Описание:** Листинги
- **API роуты:**
  - `/api/vendor/venues`
  - `/api/admin/listings`
  - `/api/listings/claim`
- **Рекомендация:** ✅ **ОСТАВИТЬ**

#### 7. VenueSubcategory (17 использований)
- **Описание:** Подкатегории мест
- **API роуты:**
  - `/api/admin/venues/subcategories`
  - `/api/venues/categories`
- **Рекомендация:** ✅ **ОСТАВИТЬ**

#### 8. HeroSlot (10 использований)
- **Описание:** Слоты на главной
- **API роуты:**
  - `/api/hero-slots`
  - `/api/admin/hero-slots`
- **Рекомендация:** ✅ **ОСТАВИТЬ**

#### 9. AfishaCategory (10 использований)
- **Описание:** Категории афиши
- **API роуты:**
  - `/api/admin/afisha/categories`
- **Рекомендация:** ✅ **ОСТАВИТЬ**

#### 10. EventReview (10 использований)
- **Описание:** Отзывы на события
- **API роуты:**
  - `/api/simple-create-review`
  - `/api/simple-reviews`
- **Рекомендация:** ✅ **ОСТАВИТЬ**

### 📁 ПО КАТЕГОРИЯМ

#### Core User System (✅ Активны)
- **User** (23) - `/api/auth/register`, `/api/profile/settings`
- **UserSettings** (1) - `/api/profile/settings`
- **UserBehaviorEvent** (8) - `/api/simple-create-review`
- **UserChild** (6) - `/api/profile/children`
- **UserFavorite** (2) - `/api/profile/simple-favorites`
- **UserNotification** (3) - `/api/profile/notifications`
- **UserNotificationSettings** (1) - `/api/profile/notifications/settings`
- **UserReview** (1) - `/api/profile/reviews`
- **UserWallet** (1) - `/api/profile/settings`
- **UserPoints** (4) - `/api/points`
- **UserReward** (3) - `/api/points/rewards`
- **UserInvite** (3) - `/api/referral/generate`

#### Vendor System (✅ Активны)
- **Vendor** (40) - `/api/vendor/onboarding`, `/api/vendors/start`
- **VendorRole** (6) - `/api/admin/roles`
- **VendorOnboarding** (5) - `/api/vendor/onboarding`
- **VendorPerformanceMetric** (1) - `/api/vendor/venues/[id]/analytics`
- **VendorSubscription** (3) - `/api/vendor/upgrade`
- **VendorTariffPlan** (4) - `/api/vendor/upgrade`
- **VendorModerationHistory** (1) - `/api/admin/vendor-moderation-history`

#### Venue System (✅ Активны)
- **VenueCategory** (6) - `/api/admin/venues/categories`
- **VenueCategoryCity** (1) - `/api/admin/venues/categories`
- **VenueSubcategory** (17) - `/api/admin/venues/subcategories`
- **VenueSubcategoryCity** (1) - `/api/admin/venues/subcategories`
- **VenueParameter** (6) - `/api/admin/venues/parameters`
- **VenueFilter** (4) - `/api/admin/venues/filters`
- **VenuePartner** (37) - `/api/admin/venues/partners`
- **VenuePartnerParameter** (3) - `/api/admin/venues/partners`
- **VenueVendor** (5) - `/api/admin/venues/vendors`

#### Listing System (✅ Активны)
- **Listing** (21) - `/api/vendor/venues`, `/api/admin/listings`
- **ListingClaim** (4) - `/api/listings/claim`
- **ListingModeration** (1) - `/api/admin/listings`

#### Booking & Payment (✅ Активны)
- **Slot** (1) - `/api/vendor/venues`
- **Booking** (2) - `/api/vendor/venues`
- **Payment** (4) - `/api/pay/yookassa`
- **Order** (6) - `/api/profile/orders`
- **Refund** (1) - `/api/pay/yookassa`
- **Ticket** (1) - `/api/vendor/venues`

#### Content & Events (✅ Активны)
- **AfishaEvent** (22) - `/api/afisha/events`, `/api/events`
- **EventTicketType** (2) - `/api/afisha/events`
- **AfishaCategory** (10) - `/api/admin/afisha/categories`
- **AfishaEventPopularCategory** (2) - `/api/admin/afisha-events`
- **EventReview** (10) - `/api/simple-create-review`
- **EventView** (1) - `/api/afisha/events/[id]/view`

#### Reviews & Ratings (✅ Активны)
- **VenueReview** (9) - `/api/simple-create-venue-review`
- **ReviewReaction** (2) - `/api/simple-reactions`
- **VenueReviewReaction** (1) - `/api/venue-reviews/[reviewId]/reactions`
- **ReviewReply** (1) - `/api/reviews/[reviewId]/replies`
- **VenueReviewReply** (2) - `/api/venue-review-replies`

#### Admin & Analytics (✅ Активны)
- **AdminAudit** (1) - `/api/admin/audit-log`
- **AdminInsight** (1) - `/api/admin/insights`
- **AuditLog** (5) - `/api/admin/audit-log`
- **AdEvent** (7) - `/api/ads/imp`, `/api/ads/click`
- **AdPlacement** (9) - `/api/ads/placement`

#### Content Management (✅ Частично активны)
- **Content** (5) - `/api/admin/blog/posts`
- **ContentCategory** (1) - `/api/admin/blog/posts`

#### System & Infrastructure (✅ Активны)
- **City** (44) - `/api/cities`, `/api/public/cities`
- **Category** (7) - `/api/categories`
- **Collection** (8) - `/api/collections`
- **CollectionEvent** (2) - `/api/admin/collections`
- **CollectionVenue** (2) - `/api/admin/collections`
- **QuickFilter** (4) - `/api/search`
- **RoleAssignment** (2) - `/api/admin/roles`

#### Loyalty & Rewards (✅ Активны)
- **LoyaltyPoint** (1) - `/api/points`
- **PointsTransaction** (4) - `/api/points/transactions`
- **Reward** (4) - `/api/points/rewards`
- **PromoCode** (2) - `/api/orders`

#### AI & Analytics (✅ Частично активны)
- **UserBehaviorEvent** (8) - `/api/simple-create-review`

#### Other (✅ Активны)
- **Document** (7) - `/api/vendor/upload-document`
- **BankAccount** (2) - `/api/vendor/upload-document`
- **TaxProfile** (2) - `/api/vendor/upload-document`
- **Interest** (1) - `/api/profile/settings`
- **Lead** (3) - `/api/admin/leads`
- **PopularEvent** (8) - `/api/admin/popular-events`
- **PopularCategory** (6) - `/api/admin/popular-categories`
- **HeroSlot** (10) - `/api/hero-slots`
- **Favorite** (2) - `/api/profile/simple-favorites`
- **Cart** (1) - `/api/cart`

---

## 🎯 ПЛАН ДЕЙСТВИЙ

### Этап 1: Безопасное удаление (34 модели)
1. Создать резервную копию базы данных
2. Удалить неиспользуемые модели из схемы
3. Создать миграцию для удаления таблиц
4. Протестировать приложение

### Этап 2: Мониторинг (3 модели)
1. Оставить AIAssistant, AIRecommendation, SLARule
2. Отслеживать их использование в будущих версиях
3. Принять решение через 6 месяцев

### Этап 3: Оптимизация активных моделей
1. Проанализировать индексы
2. Оптимизировать запросы
3. Добавить недостающие связи

---

## 📋 ЧЕКЛИСТ ДЛЯ УДАЛЕНИЯ

### Модели для удаления:
- [ ] VenueVendorUser
- [ ] BookingItem
- [ ] Account
- [ ] AdminDashboard
- [ ] Chat
- [ ] ChatTemplate
- [ ] ContentAnalytics
- [ ] ContentComment
- [ ] ContentLike
- [ ] ContentListing
- [ ] ContentTemplate
- [ ] EmailLog
- [ ] EmailTemplate
- [ ] FilterConfig
- [ ] ListingCommission
- [ ] ListingTag
- [ ] Message
- [ ] Notification
- [ ] OrderItem
- [ ] Payout
- [ ] PublicationPlan
- [ ] PublicationPlanItem
- [ ] Review
- [ ] SectionVisibility
- [ ] Session
- [ ] StockAvatar
- [ ] UserComment
- [ ] UserCommentVote
- [ ] UserInterest
- [ ] UserLoyaltyPoint
- [ ] UserReviewVote
- [ ] UserSubscription
- [ ] VerificationToken
- [ ] UserSession

### Модели для мониторинга:
- [ ] AIAssistant
- [ ] AIRecommendation
- [ ] SLARule

---

*Отчет создан: $(date)*
*Версия схемы: Prisma 5.x*
*Всего проанализировано файлов: 246*
