'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ExpandableDescriptionProps {
  richDescription?: string | null
  fallbackDescription?: string | null
  className?: string
  maxHeight?: number // Максимальная высота в пикселях до сворачивания
}

// Функция для рендеринга TipTap контента (скопирована из RichDescriptionRenderer)
function renderTipTapContent(node: any): React.ReactNode {
  if (!node) return null;
  
  if (typeof node === 'string') {
    return node;
  }
  
  if (node.type === 'doc') {
    return <div>{node.content?.map((child: any, index: number) => 
      <div key={index}>{renderTipTapContent(child)}</div>
    )}</div>;
  }
  
  if (node.type === 'paragraph') {
    const content = node.content?.map((child: any, index: number) => 
      <span key={index}>{renderTipTapContent(child)}</span>
    ) || '';
    return <p className="mb-4">{content}</p>;
  }
  
  if (node.type === 'heading') {
    const level = node.attrs?.level || 1;
    const content = node.content?.map((child: any, index: number) => 
      <span key={index}>{renderTipTapContent(child)}</span>
    ) || '';
    const className = `font-bold mb-4 ${level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : 'text-lg'}`;
    
    if (level === 1) return <h1 className={className}>{content}</h1>;
    if (level === 2) return <h2 className={className}>{content}</h2>;
    if (level === 3) return <h3 className={className}>{content}</h3>;
    if (level === 4) return <h4 className={className}>{content}</h4>;
    if (level === 5) return <h5 className={className}>{content}</h5>;
    if (level === 6) return <h6 className={className}>{content}</h6>;
    return <h1 className={className}>{content}</h1>;
  }
  
  if (node.type === 'text') {
    let text = node.text || '';
    
    // Применяем форматирование
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === 'bold') {
          text = <strong key={Math.random()}>{text}</strong>;
        } else if (mark.type === 'italic') {
          text = <em key={Math.random()}>{text}</em>;
        } else if (mark.type === 'code') {
          text = <code key={Math.random()} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{text}</code>;
        } else if (mark.type === 'link') {
          const href = mark.attrs?.href || '#';
          const target = mark.attrs?.target || '_blank';
          text = <a key={Math.random()} href={href} target={target} className="text-blue-600 underline hover:text-blue-800">{text}</a>;
        }
      }
    }
    
    return text;
  }
  
  if (node.type === 'bulletList') {
    const content = node.content?.map((child: any, index: number) => 
      <li key={index} className="mb-2">{renderTipTapContent(child)}</li>
    ) || '';
    return <ul className="list-disc list-inside mb-4 space-y-1">{content}</ul>;
  }
  
  if (node.type === 'listItem') {
    const content = node.content?.map((child: any, index: number) => 
      <span key={index}>{renderTipTapContent(child)}</span>
    ) || '';
    return <span>{content}</span>;
  }
  
  if (node.type === 'blockquote') {
    const content = node.content?.map((child: any, index: number) => 
      <div key={index}>{renderTipTapContent(child)}</div>
    ) || '';
    return <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4 bg-gray-50 p-4 rounded-r">{content}</blockquote>;
  }
  
  if (node.type === 'image') {
    const src = node.attrs?.src || '';
    const alt = node.attrs?.alt || '';
    const title = node.attrs?.title || '';
    
    // Проверяем, является ли это эмодзи (изображение с CDN эмодзи)
    const isEmoji = src.includes('emoji-datasource') || src.includes('emoji') || 
                   (alt && alt.includes('emoji')) || 
                   (title && title.includes('emoji'));
    
    if (isEmoji) {
      // Для эмодзи пытаемся извлечь Unicode эмодзи из alt или title
      const emojiMatch = alt?.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu);
      if (emojiMatch && emojiMatch.length > 0) {
        return <span className="inline-block text-lg mx-0.5">{emojiMatch[0]}</span>;
      }
      
      // Если не удалось извлечь Unicode эмодзи, используем изображение с маленьким размером
      return <img key={Math.random()} src={src} alt={alt} title={title} className="inline-block w-5 h-5 align-text-bottom mx-0.5" />;
    }
    
    // Для обычных изображений используем полный размер
    return <img key={Math.random()} src={src} alt={alt} title={title} className="max-w-full h-auto rounded-lg mb-4" />;
  }
  
  if (node.type === 'hardBreak') {
    return <br key={Math.random()} />;
  }
  
  // Для неизвестных типов просто рендерим содержимое
  if (node.content) {
    return node.content.map((child: any, index: number) => 
      <span key={index}>{renderTipTapContent(child)}</span>
    );
  }
  
  return null;
}

export default function ExpandableDescription({ 
  richDescription, 
  fallbackDescription,
  className = '',
  maxHeight = 200 // По умолчанию 200px
}: ExpandableDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [needsExpansion, setNeedsExpansion] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight
      setNeedsExpansion(contentHeight > maxHeight)
    }
  }, [maxHeight, richDescription, fallbackDescription])

  const renderContent = () => {
    if (richDescription) {
      try {
        const json = JSON.parse(richDescription)
        return renderTipTapContent(json)
      } catch (error) {
        return richDescription
      }
    } else {
      return fallbackDescription || 'Описание мероприятия будет добавлено позже.'
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={contentRef}
        className={`prose prose-lg max-w-none text-gray-700 leading-relaxed font-unbounded transition-all duration-300 relative ${
          !isExpanded && needsExpansion ? 'overflow-hidden' : ''
        }`}
        style={{
          maxHeight: !isExpanded && needsExpansion ? `${maxHeight}px` : 'none'
        }}
      >
        {renderContent()}
        
        {/* Градиент внутри контейнера с текстом */}
        {!isExpanded && needsExpansion && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none z-10"
          />
        )}
      </div>
      
      {/* Кнопка "Читать далее" / "Свернуть" */}
      {needsExpansion && (
        <div className="flex justify-center mt-4 relative z-20">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-5 h-5" />
                Свернуть
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5" />
                Читать далее
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
