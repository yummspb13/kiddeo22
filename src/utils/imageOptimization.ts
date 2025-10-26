// Утилиты для оптимизации изображений

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  blur?: boolean;
  responsive?: boolean;
}

export interface ResponsiveImageSizes {
  mobile: number;
  tablet: number;
  desktop: number;
}

// Генерация responsive sizes для разных устройств
export function generateResponsiveSizes(
  baseWidth: number,
  baseHeight: number
): ResponsiveImageSizes {
  return {
    mobile: Math.min(baseWidth, 400),
    tablet: Math.min(baseWidth, 600),
    desktop: baseWidth
  };
}

// Генерация sizes атрибута для Next.js Image
export function generateSizesAttribute(
  breakpoints: ResponsiveImageSizes,
  customSizes?: string
): string {
  if (customSizes) return customSizes;
  
  return `(max-width: 768px) ${breakpoints.mobile}px, (max-width: 1200px) ${breakpoints.tablet}px, ${breakpoints.desktop}px`;
}

// Оптимизация URL изображения для CDN
export function optimizeImageUrl(
  src: string,
  options: ImageOptimizationOptions = {}
): string {
  const {
    width,
    height,
    quality = 75,
    format = 'webp',
    blur = false
  } = options;

  // Если это внешний URL, возвращаем как есть
  if (src.startsWith('http') && !src.includes(process.env.NEXT_PUBLIC_BASE_URL || 'localhost')) {
    return src;
  }

  // Для локальных изображений используем Next.js Image Optimization API
  const params = new URLSearchParams();
  
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (quality) params.set('q', quality.toString());
  if (format) params.set('f', format);
  if (blur) params.set('blur', '1');

  const queryString = params.toString();
  return queryString ? `${src}?${queryString}` : src;
}

// Генерация blur placeholder
export function generateBlurDataURL(width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Создаем простой градиент для blur placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

// Определение оптимального формата изображения
export function getOptimalImageFormat(): 'webp' | 'avif' | 'jpeg' {
  if (typeof window === 'undefined') return 'webp';
  
  // Проверяем поддержку AVIF
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  const avifSupported = canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  if (avifSupported) return 'avif';
  
  // Проверяем поддержку WebP
  const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  if (webpSupported) return 'webp';
  
  return 'jpeg';
}

// Генерация srcSet для responsive изображений
export function generateSrcSet(
  baseSrc: string,
  sizes: ResponsiveImageSizes,
  quality: number = 75
): string {
  const format = getOptimalImageFormat();
  
  return [
    `${optimizeImageUrl(baseSrc, { width: sizes.mobile, quality, format })} ${sizes.mobile}w`,
    `${optimizeImageUrl(baseSrc, { width: sizes.tablet, quality, format })} ${sizes.tablet}w`,
    `${optimizeImageUrl(baseSrc, { width: sizes.desktop, quality, format })} ${sizes.desktop}w`
  ].join(', ');
}

// Предзагрузка критичных изображений
export function preloadImage(src: string, options: ImageOptimizationOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = optimizeImageUrl(src, options);
  });
}

// Предзагрузка множественных изображений
export function preloadImages(
  sources: string[],
  options: ImageOptimizationOptions = {}
): Promise<void[]> {
  return Promise.all(sources.map(src => preloadImage(src, options)));
}

// Оптимизация изображений для разных контекстов
export const ImageOptimizationPresets = {
  // Для hero изображений
  hero: {
    quality: 85,
    format: 'webp' as const,
    priority: true,
    sizes: '100vw'
  },
  
  // Для карточек событий/мест
  card: {
    quality: 75,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  },
  
  // Для миниатюр
  thumbnail: {
    quality: 60,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw'
  },
  
  // Для аватаров
  avatar: {
    quality: 70,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 40px, 48px'
  },
  
  // Для галерей
  gallery: {
    quality: 80,
    format: 'webp' as const,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  }
};

// Утилита для создания оптимизированного изображения
export function createOptimizedImage(
  src: string,
  preset: keyof typeof ImageOptimizationPresets,
  customOptions: Partial<ImageOptimizationOptions> = {}
) {
  const presetOptions = ImageOptimizationPresets[preset];
  const options = { ...presetOptions, ...customOptions };
  
  return {
    src: optimizeImageUrl(src, options),
    ...options
  };
}

// Проверка поддержки современных форматов изображений
export function checkImageFormatSupport(): {
  webp: boolean;
  avif: boolean;
  jpeg: boolean;
} {
  if (typeof window === 'undefined') {
    return { webp: false, avif: false, jpeg: true };
  }
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return {
    webp: canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0,
    avif: canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0,
    jpeg: true
  };
}

// Ленивая загрузка изображений с Intersection Observer
export function createLazyImageLoader(
  callback: (src: string) => void,
  options: {
    rootMargin?: string;
    threshold?: number;
  } = {}
) {
  const { rootMargin = '50px', threshold = 0.1 } = options;
  
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          callback(img.dataset.src || '');
          observer?.unobserve(img);
        }
      });
    },
    { rootMargin, threshold }
  );
}
