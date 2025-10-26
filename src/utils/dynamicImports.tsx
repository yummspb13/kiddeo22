import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Утилиты для динамического импорта тяжелых компонентов

// Rich Text Editor (Tiptap)
export const DynamicRichTextEditor = dynamic(
  () => import('@/components/RichTextEditor'),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 h-64 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Загрузка редактора...</span>
      </div>
    ),
    ssr: false
  }
);

// Maps компоненты - временно отключены
// export const DynamicYandexMap = dynamic(
//   () => import('@/components/YandexMap'),
//   {
//     loading: () => (
//       <div className="animate-pulse bg-gray-200 h-64 rounded-lg flex items-center justify-center">
//         <span className="text-gray-500">Загрузка карты...</span>
//       </div>
//     ),
//     ssr: false
//   }
// );

// Analytics компоненты - временно отключены
// export const DynamicAnalytics = dynamic(
//   () => import('@/components/Analytics'),
//   {
//     loading: () => (
//       <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
//     ),
//     ssr: false
//   }
// );

// Charts компоненты - временно отключены
// export const DynamicCharts = dynamic(
//   () => import('@/components/Charts'),
//   {
//     loading: () => (
//       <div className="animate-pulse bg-gray-200 h-64 rounded-lg flex items-center justify-center">
//         <span className="text-gray-500">Загрузка графиков...</span>
//       </div>
//     ),
//     ssr: false
//   }
// );

// Venue Sections (тяжелый компонент)
export const DynamicVenueSections = dynamic(
  () => import('@/components/VenueSections'),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 h-64 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Загрузка разделов...</span>
      </div>
    )
  }
);

// Admin Panel компоненты - временно отключены
// export const DynamicAdminTable = dynamic(
//   () => import('@/components/AdminTable'),
//   {
//     loading: () => (
//       <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
//     ),
//     ssr: false
//   }
// );

// export const DynamicAdminCharts = dynamic(
//   () => import('@/components/AdminCharts'),
//   {
//     loading: () => (
//       <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
//     ),
//     ssr: false
//   }
// );

// Vendor Dashboard компоненты - временно отключены
// export const DynamicVendorAnalytics = dynamic(
//   () => import('@/components/VendorAnalytics'),
//   {
//     loading: () => (
//       <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
//     ),
//     ssr: false
//   }
// );

// export const DynamicVendorOrders = dynamic(
//   () => import('@/components/VendorOrders'),
//   {
//     loading: () => (
//       <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
//     ),
//     ssr: false
//   }
// );

// Content CMS компоненты - используем существующий путь
export const DynamicContentEditor = dynamic(
  () => import('@/app/content/new/ContentEditor'),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 h-96 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Загрузка редактора контента...</span>
      </div>
    ),
    ssr: false
  }
);

// Image Gallery компоненты - временно отключены
// export const DynamicImageGallery = dynamic(
//   () => import('@/components/ImageGallery'),
//   {
//     loading: () => (
//       <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
//     ),
//     ssr: false
//   }
// );

// Virtual Scrolling компоненты
export const DynamicVirtualList = dynamic(
  () => import('@/components/VirtualList'),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
    ),
    ssr: false
  }
);

// PWA компоненты
export const DynamicPWAInstallPrompt = dynamic(
  () => import('@/components/PWAInstallPrompt'),
  {
    ssr: false
  }
);

export const DynamicPushNotificationSettings = dynamic(
  () => import('@/components/PushNotificationSettings'),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
    ),
    ssr: false
  }
);

// Utility функция для создания динамических компонентов с кастомными настройками
export const createDynamicComponent = <T = any>(
  importPath: string,
  options: {
    loading?: ComponentType | string;
    ssr?: boolean;
    delay?: number;
  } = {}
) => {
  const { loading, ssr = true, delay = 0 } = options;
  
  return dynamic(() => import(importPath), {
    loading: typeof loading === 'string' ? () => <div>{loading}</div> : loading || (() => (
      <div className="animate-pulse bg-gray-200 h-32 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Загрузка...</span>
      </div>
    )),
    ssr,
    delay
  });
};

// Pre-configured dynamic imports для часто используемых компонентов
export const DynamicComponents = {
  RichTextEditor: DynamicRichTextEditor,
  // YandexMap: DynamicYandexMap, // Отключен - компонент не существует
  // Analytics: DynamicAnalytics, // Отключен - компонент не существует
  // Charts: DynamicCharts, // Отключен - компонент не существует
  VenueSections: DynamicVenueSections,
  // AdminTable: DynamicAdminTable, // Отключен - компонент не существует
  // AdminCharts: DynamicAdminCharts, // Отключен - компонент не существует
  // VendorAnalytics: DynamicVendorAnalytics, // Отключен - компонент не существует
  // VendorOrders: DynamicVendorOrders, // Отключен - компонент не существует
  ContentEditor: DynamicContentEditor,
  // ImageGallery: DynamicImageGallery, // Отключен - компонент не существует
  VirtualList: DynamicVirtualList,
  PWAInstallPrompt: DynamicPWAInstallPrompt,
  PushNotificationSettings: DynamicPushNotificationSettings,
};
