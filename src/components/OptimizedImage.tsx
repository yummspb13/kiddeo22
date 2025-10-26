'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  className?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallback?: string;
  responsive?: boolean;
  lazy?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 75,
  sizes,
  className = '',
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  fallback = '/images/placeholder.jpg',
  responsive = true,
  lazy = true
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer для lazy loading
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  // Обработка ошибок загрузки изображения
  const handleError = () => {
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
      setHasError(true);
    }
    setIsLoading(false);
    onError?.();
  };

  // Обработка успешной загрузки
  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // Генерация blur placeholder
  const generateBlurDataURL = (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, width, height);
    }
    return canvas.toDataURL();
  };

  // Responsive sizes для разных устройств
  const getResponsiveSizes = () => {
    if (sizes) return sizes;
    
    if (responsive) {
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    }
    
    return undefined;
  };

  // Оптимизированные размеры для разных устройств
  const getOptimizedSizes = () => {
    if (width && height) {
      return {
        mobile: Math.min(width, 400),
        tablet: Math.min(width, 600),
        desktop: width
      };
    }
    return undefined;
  };

  // Показываем изображение только если оно видимо или не lazy
  const shouldLoad = !lazy || isVisible || priority;

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {shouldLoad ? (
        <>
          {/* Loading placeholder */}
          {isLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Optimized Image */}
          <Image
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            fill={fill}
            priority={priority}
            quality={quality}
            sizes={getResponsiveSizes()}
            placeholder={placeholder}
            blurDataURL={blurDataURL || (placeholder === 'blur' ? generateBlurDataURL(width || 400, height || 300) : undefined)}
            className={`transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            } ${hasError ? 'grayscale' : ''}`}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />

          {/* Error state */}
          {hasError && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l2-2m-2 2l-2-2m2 2l2 2M3 20h18a2 2 0 002-2V6a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Изображение недоступно</span>
              </div>
            </div>
          )}
        </>
      ) : (
        // Placeholder для lazy loading
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l2-2m-2 2l-2-2m2 2l2 2M3 20h18a2 2 0 002-2V6a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

// Специализированные компоненты для разных типов изображений
export const HeroImage = (props: OptimizedImageProps) => (
  <OptimizedImage
    {...props}
    priority={true}
    quality={85}
    sizes="100vw"
    placeholder="blur"
  />
);

export const CardImage = (props: OptimizedImageProps) => (
  <OptimizedImage
    {...props}
    quality={75}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    lazy={true}
  />
);

export const ThumbnailImage = (props: OptimizedImageProps) => (
  <OptimizedImage
    {...props}
    quality={60}
    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
    lazy={true}
  />
);

export const AvatarImage = (props: OptimizedImageProps) => (
  <OptimizedImage
    {...props}
    quality={70}
    sizes="(max-width: 768px) 40px, 48px"
    lazy={true}
    className="rounded-full"
  />
);

// Компонент для галереи изображений
interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ImageGallery({ images, alt, className = '' }: ImageGalleryProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {images.map((src, index) => (
        <CardImage
          key={index}
          src={src}
          alt={`${alt} ${index + 1}`}
          width={300}
          height={200}
          className="aspect-[3/2] rounded-lg"
        />
      ))}
    </div>
  );
}
