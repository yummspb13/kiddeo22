'use client'

import { useState, useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import dynamic from 'next/dynamic'
import { useToast } from '@/contexts/ToastContext'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3,
  Image as ImageIcon,
  Link as LinkIcon,
  Quote,
  Code,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  CheckSquare,
  Palette,
  Type,
  RotateCcw,
  ChevronDown
} from 'lucide-react'

interface RichTextEditorProps {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export default function RichTextEditor({ 
  content = '', 
  onChange, 
  placeholder = 'Начните писать...',
  disabled = false,
  className = ''
}: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Закрытие выпадающего списка при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFontSizeDropdown) {
        const target = event.target as Element
        if (!target.closest('.font-size-dropdown')) {
          setShowFontSizeDropdown(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFontSizeDropdown])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: false, // Отключаем встроенный Link из StarterKit
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: (() => {
      // Обрабатываем контент - если это строка JSON, парсим её
      if (typeof content === 'string' && content.trim().startsWith('{')) {
        try {
          return JSON.parse(content)
        } catch (e) {
          console.warn('Failed to parse content as JSON:', e)
          return content
        }
      }
      return content
    })(),
    editable: !disabled,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
        style: 'min-height: 200px; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; background: white;',
      },
      handlePaste: (view, event, slice) => {
        // Сохраняем стили при вставке
        return false; // Позволяем TipTap обработать вставку с сохранением стилей
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      onChange?.(JSON.stringify(json))
    },
    onFocus: ({ editor }) => {
      // Улучшаем видимость курсора при фокусе
      const view = editor.view
      if (view) {
        view.dom.style.borderColor = '#3b82f6'
        view.dom.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
      }
    },
    onBlur: ({ editor }) => {
      // Возвращаем обычные стили при потере фокуса
      const view = editor.view
      if (view) {
        view.dom.style.borderColor = '#d1d5db'
        view.dom.style.boxShadow = 'none'
      }
    },
  })

  const addImage = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      setIsImageModalOpen(false)
    }
  }, [editor, imageUrl])

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return

    try {
      // Создаем FormData для загрузки
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'background')

      // Загружаем файл на сервер
      const response = await fetch('/api/admin/upload?key=kidsreview2025', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const imageUrl = data.url || data.path
        
        // Добавляем изображение в редактор
        editor.chain().focus().setImage({ src: imageUrl }).run()
        setIsImageModalOpen(false)
      } else {
        console.error('Ошибка загрузки изображения:', response.statusText)
        addToast({
          type: 'error',
          title: 'Ошибка загрузки изображения',
          message: 'Не удалось загрузить изображение. Проверьте URL и попробуйте еще раз.',
          duration: 6000
        })
      }
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error)
      addToast({
        type: 'error',
        title: 'Ошибка загрузки изображения',
        message: 'Произошла ошибка при загрузке изображения. Попробуйте еще раз.',
        duration: 6000
      })
    }
  }, [editor])

  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
      setLinkUrl('')
      setIsLinkModalOpen(false)
    }
  }, [editor, linkUrl])

  const setTextColor = useCallback((color: string) => {
    if (editor) {
      editor.chain().focus().setColor(color).run()
      setShowColorPicker(false)
    }
  }, [editor])

  const setHighlight = useCallback((color: string) => {
    if (editor) {
      editor.chain().focus().setHighlight({ color }).run()
      setShowHighlightPicker(false)
    }
  }, [editor])

  const clearFormatting = useCallback(() => {
    if (editor) {
      editor.chain().focus().clearNodes().unsetAllMarks().run()
    }
  }, [editor])



  if (!editor) {
    return null
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    disabled = false, 
    children, 
    title 
  }: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-blue-100 text-blue-600' 
          : 'text-gray-600 hover:bg-gray-100'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )

  if (!isMounted) {
    return (
      <div className={`border border-gray-300 rounded-lg ${className}`}>
        <div className="p-4 text-gray-500 text-center">
          Загрузка редактора...
        </div>
      </div>
    )
  }

  return (
    <div className={`border border-gray-300 rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 overflow-x-auto">
        {/* Очистка стилей */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={clearFormatting}
            title="Очистить стили"
          >
            <RotateCcw className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Основное форматирование */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Жирный"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Курсив"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>

        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Заголовки */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="Заголовок 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="Заголовок 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="Заголовок 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
          
          {/* Выпадающий список размеров шрифта */}
          <div className="relative font-size-dropdown">
            <button
              type="button"
              onClick={() => setShowFontSizeDropdown(!showFontSizeDropdown)}
              className="p-2 rounded-md transition-colors text-gray-600 hover:bg-gray-100 flex items-center gap-1"
              title="Размер шрифта"
            >
              <Type className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </button>
            
            {showFontSizeDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[120px]">
                <div className="py-1">
                       <button
                         type="button"
                         onClick={() => {
                           editor.chain().focus().setMark('textStyle', { 
                             fontSize: '1.125rem',
                             fontWeight: '600',
                             color: '#111827'
                           }).run()
                           setShowFontSizeDropdown(false)
                         }}
                         className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-gray-700"
                       >
                         H4 - Заголовок 4 (1.125rem)
                       </button>
                       <button
                         type="button"
                         onClick={() => {
                           editor.chain().focus().setMark('textStyle', { 
                             fontSize: '1rem',
                             fontWeight: '600',
                             color: '#111827'
                           }).run()
                           setShowFontSizeDropdown(false)
                         }}
                         className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-gray-700"
                       >
                         H5 - Заголовок 5 (1rem)
                       </button>
                       <button
                         type="button"
                         onClick={() => {
                           editor.chain().focus().setMark('textStyle', { 
                             fontSize: '0.875rem',
                             fontWeight: '600',
                             color: '#111827'
                           }).run()
                           setShowFontSizeDropdown(false)
                         }}
                         className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-gray-700"
                       >
                         H6 - Заголовок 6 (0.875rem)
                       </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setParagraph().run()
                      setShowFontSizeDropdown(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${
                      editor.isActive('paragraph') ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    Обычный текст
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Списки */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Маркированный список"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Нумерованный список"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive('taskList')}
            title="Список задач"
          >
            <CheckSquare className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Выравнивание */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Выровнять по левому краю"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Выровнять по центру"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Выровнять по правому краю"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="Выровнять по ширине"
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Цвета */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <ToolbarButton
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Цвет текста"
            >
              <Palette className="h-4 w-4" />
            </ToolbarButton>
            {showColorPicker && (
              <div className="absolute top-8 left-0 bg-white border rounded-lg shadow-lg p-2 z-10">
                <div className="grid grid-cols-6 gap-1">
                  {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#FFC0CB', '#A52A2A'].map(color => (
                    <button
                      type="button"
                      key={color}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => setTextColor(color)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <ToolbarButton
              onClick={() => setShowHighlightPicker(!showHighlightPicker)}
              title="Выделение текста"
            >
              <Highlighter className="h-4 w-4" />
            </ToolbarButton>
            {showHighlightPicker && (
              <div className="absolute top-8 left-0 bg-white border rounded-lg shadow-lg p-2 z-10">
                <div className="grid grid-cols-6 gap-1">
                  {['#FFFF00', '#FFA500', '#FF69B4', '#00FF00', '#87CEEB', '#DDA0DD', '#F0E68C', '#FFB6C1', '#98FB98', '#F5DEB3', '#FFE4E1', '#E0E0E0'].map(color => (
                    <button
                      type="button"
                      key={color}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => setHighlight(color)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Дополнительные элементы */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Цитата"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Блок кода"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>


        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Отмена/Повтор */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Отменить"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Повторить"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Медиа */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            onClick={() => setIsImageModalOpen(true)}
            title="Добавить изображение"
          >
            <ImageIcon className="h-4 w-4" />
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => setIsLinkModalOpen(true)}
            title="Добавить ссылку"
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <div className="p-4">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm max-w-none focus:outline-none rich-text-editor"
        />
      </div>

      <style jsx global>{`
        .rich-text-editor .ProseMirror {
          outline: none;
          min-height: 200px;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          transition: border-color 0.2s;
        }
        
        .rich-text-editor .ProseMirror:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .rich-text-editor .ProseMirror p {
          margin: 0.5em 0;
          line-height: 1.6;
        }
        
        .rich-text-editor .ProseMirror p:first-child {
          margin-top: 0;
        }
        
        .rich-text-editor .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        
        
        .rich-text-editor .ProseMirror h1,
        .rich-text-editor .ProseMirror h2,
        .rich-text-editor .ProseMirror h3,
        .rich-text-editor .ProseMirror h4,
        .rich-text-editor .ProseMirror h5,
        .rich-text-editor .ProseMirror h6 {
          margin: 1em 0 0.5em 0;
          line-height: 1.3;
        }
        
        .rich-text-editor .ProseMirror h1 {
          font-size: 1.875rem !important;
          font-weight: 700 !important;
          color: #111827 !important;
        }
        
        .rich-text-editor .ProseMirror h2 {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          color: #111827 !important;
        }
        
        .rich-text-editor .ProseMirror h3 {
          font-size: 1.25rem !important;
          font-weight: 600 !important;
          color: #111827 !important;
        }
        
        .rich-text-editor .ProseMirror h4 {
          font-size: 1.125rem !important;
          font-weight: 600 !important;
          color: #111827 !important;
        }
        
        .rich-text-editor .ProseMirror h5 {
          font-size: 1rem !important;
          font-weight: 600 !important;
          color: #111827 !important;
        }
        
        .rich-text-editor .ProseMirror h6 {
          font-size: 0.875rem !important;
          font-weight: 600 !important;
          color: #111827 !important;
        }
        
               .rich-text-editor .ProseMirror h1:first-child,
               .rich-text-editor .ProseMirror h2:first-child,
               .rich-text-editor .ProseMirror h3:first-child,
               .rich-text-editor .ProseMirror h4:first-child,
               .rich-text-editor .ProseMirror h5:first-child,
               .rich-text-editor .ProseMirror h6:first-child {
                 margin-top: 0;
               }
               
               /* Стили для textStyle с fontSize */
               .rich-text-editor .ProseMirror p [style*="font-size: 1.125rem"] {
                 font-size: 1.125rem !important;
                 font-weight: 600 !important;
                 color: #111827 !important;
               }
               
               .rich-text-editor .ProseMirror p [style*="font-size: 1rem"] {
                 font-size: 1rem !important;
                 font-weight: 600 !important;
                 color: #111827 !important;
               }
               
               .rich-text-editor .ProseMirror p [style*="font-size: 0.875rem"] {
                 font-size: 0.875rem !important;
                 font-weight: 600 !important;
                 color: #111827 !important;
               }
               
               /* Дополнительные стили для параграфов с textStyle */
               .rich-text-editor .ProseMirror p:has([style*="font-size: 1.125rem"]) {
                 margin-top: 1rem !important;
                 margin-bottom: 0.5rem !important;
                 line-height: 1.4 !important;
               }
               
               .rich-text-editor .ProseMirror p:has([style*="font-size: 1rem"]) {
                 margin-top: 0.875rem !important;
                 margin-bottom: 0.375rem !important;
                 line-height: 1.4 !important;
               }
               
               .rich-text-editor .ProseMirror p:has([style*="font-size: 0.875rem"]) {
                 margin-top: 0.75rem !important;
                 margin-bottom: 0.25rem !important;
                 line-height: 1.4 !important;
               }
        
        .rich-text-editor .ProseMirror ul,
        .rich-text-editor .ProseMirror ol {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }
        
        .rich-text-editor .ProseMirror li {
          margin: 0.25em 0;
        }
        
        .rich-text-editor .ProseMirror blockquote {
          margin: 1em 0;
          padding-left: 1em;
          border-left: 3px solid #e5e7eb;
          color: #6b7280;
        }
        
        .rich-text-editor .ProseMirror code {
          background: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-size: 0.9em;
        }
        
        .rich-text-editor .ProseMirror pre {
          background: #f3f4f6;
          padding: 1em;
          border-radius: 6px;
          overflow-x: auto;
          margin: 1em 0;
        }
        
        .rich-text-editor .ProseMirror pre code {
          background: none;
          padding: 0;
        }
        
        .rich-text-editor .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .rich-text-editor .ProseMirror a:hover {
          color: #1d4ed8;
        }
        
        .rich-text-editor .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
          margin: 0.5em 0;
        }
        
        /* Улучшенная видимость курсора */
        .rich-text-editor .ProseMirror .ProseMirror-cursor {
          display: inline-block;
          width: 2px;
          background: #3b82f6;
          animation: blink 1s infinite;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        /* Улучшенный фокус */
        .rich-text-editor .ProseMirror:focus .ProseMirror-cursor {
          background: #1d4ed8;
          box-shadow: 0 0 0 1px #3b82f6;
        }
        
      `}</style>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Добавить изображение</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Выберите файл
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleImageUpload(file)
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="text-sm text-gray-500">
                Или введите URL изображения:
              </div>
              <div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={addImage}
                  disabled={!imageUrl}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Добавить по URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsImageModalOpen(false)
                    setImageUrl('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Добавить ссылку</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL ссылки
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={addLink}
                  disabled={!linkUrl}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Добавить
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLinkModalOpen(false)
                    setLinkUrl('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
