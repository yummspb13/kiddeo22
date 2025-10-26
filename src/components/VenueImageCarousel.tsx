'use client';

import { useState, useEffect } from 'react';
import { MapPin, Building, Camera, Coffee, ChevronLeft, ChevronRight } from 'lucide-react';

type VenueImage = {
  id: number;
  image: string;
  title: string;
};

// Компонент карусели изображений
export function VenueImageCarousel({ venueId, images: venueImages, showIndicators = true }: { venueId: number; images?: string[]; showIndicators?: boolean }) {
  const [currentImage, setCurrentImage] = useState(0);
  
  // Инициализируем images сразу, если venueImages доступны
  const initialImages = venueImages && Array.isArray(venueImages) && venueImages.length > 0 
    ? venueImages.map((image, index) => ({
        id: index + 1,
        image,
        title: `Изображение ${index + 1}`
      }))
    : [];
  
  const [images, setImages] = useState<VenueImage[]>(initialImages);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Загружаем изображения места через API, если не переданы через пропсы
  useEffect(() => {
    // Если изображения уже есть через пропсы, ничего не делаем
    if (venueImages && venueImages.length > 0) {
      return;
    }

    const loadVenueImages = async () => {
      try {
        const response = await fetch(`/api/venues/${venueId}/images`);
        if (response.ok) {
          const data = await response.json();
          const formattedImages = (data.images || []).map((image: string, index: number) => ({
            id: index + 1,
            image,
            title: `Изображение ${index + 1}`
          }));
          setImages(formattedImages);
        } else {
          // Fallback к заглушкам если нет изображений
          setImages(getFallbackImages(venueId));
        }
      } catch (error) {
        console.error('Error loading venue images:', error);
        setImages(getFallbackImages(venueId));
      }
    };

    // Загружаем изображения через API только если не переданы через пропсы
    loadVenueImages();
  }, [venueId, venueImages]);

  // Сбрасываем текущее изображение при изменении массива изображений
  useEffect(() => {
    setCurrentImage(0);
    setImageLoaded(false);
  }, [images]);

  // Принудительно устанавливаем imageLoaded в true через 3 секунды
  useEffect(() => {
    if (images.length > 0) {
      const timer = setTimeout(() => {
        setImageLoaded(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [images]);

  // Fallback изображения
  const getFallbackImages = (id: number): VenueImage[] => {
    const fallbackImages = [
        {
          id: 1,
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=512&h=320&fit=crop&crop=center&auto=format&q=80',
        title: 'Изображение места'
      }
    ];
    return fallbackImages;
  };

  // Автопрокрутка отключена - только по клику
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentImage((prev) => (prev + 1) % images.length);
  //   }, 4000);

  //   return () => clearInterval(interval);
  // }, [images.length]);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 0) {
      setImageLoaded(false);
    setCurrentImage((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 0) {
      setImageLoaded(false);
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const goToImage = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (index >= 0 && index < images.length) {
      setImageLoaded(false);
    setCurrentImage(index);
    }
  };

  const currentImageData = images[currentImage];

  // Если нет изображений, показываем заглушку
  if (!images || images.length === 0 || !currentImageData) {
    return (
      <div className="relative group">
        <div className="w-full h-full relative overflow-hidden bg-gray-200 flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <Camera className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm">Нет изображений</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group w-full h-full">
      <div className="w-full h-full relative overflow-hidden rounded-xl" style={{ height: '100%', minHeight: '100%' }}>
        <img 
          src={currentImageData.image} 
          alt={currentImageData.title}
          className="w-full h-full object-cover object-center"
          style={{
            objectFit: 'cover',
            objectPosition: 'center center',
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0
          }}
          onLoad={() => {
            setImageLoaded(true);
          }}
          onError={(e) => {
            console.error('Image load error for:', currentImageData.image, e);
            setImageLoaded(true);
          }}
        />
        
        {/* Показываем загрузку пока изображение не загрузилось */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Левая кликабельная зона (20%) с градиентом */}
        <button
          onClick={prevImage}
          className="absolute left-0 top-0 w-[20%] h-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-black/30 via-black/10 to-transparent hover:from-black/40 hover:via-black/20 flex items-center justify-start pl-4 z-10"
          aria-label="Предыдущее изображение"
        >
          <ChevronLeft className="w-8 h-8 text-white/80 hover:text-white transition-colors" />
        </button>
        
        {/* Правая кликабельная зона (20%) с градиентом */}
        <button
          onClick={nextImage}
          className="absolute right-0 top-0 w-[20%] h-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-black/30 via-black/10 to-transparent hover:from-black/40 hover:via-black/20 flex items-center justify-end pr-4 z-10"
          aria-label="Следующее изображение"
        >
          <ChevronRight className="w-8 h-8 text-white/80 hover:text-white transition-colors" />
        </button>
        
        {/* Улучшенные индикаторы */}
        {showIndicators && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={goToImage(index)}
                className={`transition-all duration-300 ${
                  index === currentImage 
                    ? 'w-8 h-2 bg-white rounded-full shadow-lg' 
                    : 'w-2 h-2 bg-white/60 rounded-full hover:bg-white/80'
                }`}
                aria-label={`Перейти к изображению ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
