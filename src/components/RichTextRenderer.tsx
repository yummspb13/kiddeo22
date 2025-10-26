'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { useEffect } from 'react'

interface RichTextRendererProps {
  content?: string
  className?: string
}

export default function RichTextRenderer({ 
  content, 
  className = ''
}: RichTextRendererProps) {
  // Обрабатываем null/undefined
  const safeContent = content || ''
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
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
    ],
    content: '',
    editable: false, // Read-only режим
  })

  useEffect(() => {
    if (editor && safeContent && safeContent.trim() !== '') {
      try {
        // Пытаемся парсить как JSON
        const parsedContent = JSON.parse(safeContent)
        editor.commands.setContent(parsedContent)
      } catch (error) {
        // Если не JSON, используем как обычный текст
        editor.commands.setContent(safeContent)
      }
    }
  }, [editor, safeContent])

  if (!editor) {
    return null
  }

  // Если контент пустой, не рендерим ничего
  if (!safeContent || safeContent.trim() === '') {
    return null
  }

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <EditorContent 
        editor={editor}
        className="[&_.ProseMirror]:outline-none [&_.ProseMirror]:p-0"
      />
    </div>
  )
}
