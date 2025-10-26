'use client';

import { useState, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Link, 
  Image, 
  Video, 
  Code, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Undo, 
  Redo, 
  Save, 
  Eye, 
  Download, 
  Share, 
  MoreVertical,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import ResponsiveCard from './ResponsiveCard';
import ResponsiveButton from './ResponsiveForm';
import ResponsiveModal, { ConfirmationModal } from './ResponsiveModal';
import MobileDrawer from './MobileDrawer';

interface ContentEditorMobileProps {
  content?: string;
  title?: string;
  onSave: (content: string, title: string) => void;
  onPublish?: (content: string, title: string) => void;
  onPreview?: (content: string, title: string) => void;
  isDraft?: boolean;
  isPublished?: boolean;
  lastSaved?: string;
}

export default function ContentEditorMobile({
  content = '',
  title = '',
  onSave,
  onPublish,
  onPreview,
  isDraft = false,
  isPublished = false,
  lastSaved
}: ContentEditorMobileProps) {
  const [editorContent, setEditorContent] = useState(content);
  const [editorTitle, setEditorTitle] = useState(title);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const handleContentChange = (newContent: string) => {
    setEditorContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleTitleChange = (newTitle: string) => {
    setEditorTitle(newTitle);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editorContent, editorTitle);
      setHasUnsavedChanges(false);
      setIsSaveModalOpen(false);
    } catch (error) {
      console.error('Failed to save content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish?.(editorContent, editorTitle);
      setHasUnsavedChanges(false);
      setIsPublishModalOpen(false);
    } catch (error) {
      console.error('Failed to publish content:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePreview = () => {
    onPreview?.(editorContent, editorTitle);
    setIsPreviewOpen(true);
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertText = (text: string) => {
    const textarea = editorRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = editorContent.substring(0, start) + text + editorContent.substring(end);
      setEditorContent(newText);
      setHasUnsavedChanges(true);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
      }, 0);
    }
  };

  const getStatusColor = () => {
    if (isPublished) return 'text-green-600 bg-green-100';
    if (isDraft) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getStatusLabel = () => {
    if (isPublished) return 'Опубликовано';
    if (isDraft) return 'Черновик';
    return 'Не сохранено';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Back Button */}
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-touch min-w-touch">
            ←
          </button>

          {/* Title */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-semibold text-gray-900">Редактор контента</h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Save Status */}
            <div className="flex items-center space-x-2">
              {hasUnsavedChanges && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              )}
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
                {getStatusLabel()}
              </span>
            </div>

            {/* More Options */}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-touch min-w-touch"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        <div className="p-4 space-y-4">
          {/* Title Input */}
          <div>
            <input
              ref={titleRef}
              type="text"
              placeholder="Заголовок статьи..."
              value={editorTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-3 text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Editor */}
          <div className="relative">
            <textarea
              ref={editorRef}
              value={editorContent}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Начните писать статью..."
              className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <ResponsiveButton
              onClick={() => formatText('bold')}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Bold className="w-4 h-4" />
              <span className="hidden sm:inline">Жирный</span>
            </ResponsiveButton>
            
            <ResponsiveButton
              onClick={() => formatText('italic')}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Italic className="w-4 h-4" />
              <span className="hidden sm:inline">Курсив</span>
            </ResponsiveButton>
            
            <ResponsiveButton
              onClick={() => formatText('insertUnorderedList')}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Список</span>
            </ResponsiveButton>
            
            <ResponsiveButton
              onClick={() => insertText('## ')}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <span className="text-sm font-bold">H2</span>
            </ResponsiveButton>
            
            <ResponsiveButton
              onClick={() => insertText('### ')}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <span className="text-sm font-bold">H3</span>
            </ResponsiveButton>
            
            <ResponsiveButton
              onClick={() => insertText('> ')}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Quote className="w-4 h-4" />
            </ResponsiveButton>
            
            <ResponsiveButton
              onClick={() => setIsMediaOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Медиа</span>
            </ResponsiveButton>
          </div>
        </div>
      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30 md:hidden">
        <div className="flex space-x-3">
          <ResponsiveButton
            onClick={() => setIsSaveModalOpen(true)}
            variant="outline"
            size="md"
            className="flex-1 flex items-center justify-center gap-2"
            loading={isSaving}
          >
            <Save className="w-4 h-4" />
            <span>Сохранить</span>
          </ResponsiveButton>
          
          <ResponsiveButton
            onClick={handlePreview}
            variant="outline"
            size="md"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Просмотр</span>
          </ResponsiveButton>
          
          <ResponsiveButton
            onClick={() => setIsPublishModalOpen(true)}
            variant="primary"
            size="md"
            className="flex-1 flex items-center justify-center gap-2"
            loading={isPublishing}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Опубликовать</span>
          </ResponsiveButton>
        </div>
      </div>

      {/* Media Drawer */}
      <MobileDrawer
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        title="Медиа"
        position="bottom"
        size="lg"
      >
        <div className="p-4">
          <div className="space-y-4">
            {/* Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Перетащите изображения сюда или нажмите для выбора</p>
              <ResponsiveButton
                variant="outline"
                size="md"
                className="w-full"
              >
                Выбрать файлы
              </ResponsiveButton>
            </div>

            {/* Media Gallery */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Галерея</h3>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MobileDrawer>

      {/* Settings Drawer */}
      <MobileDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Настройки"
        position="right"
        size="md"
      >
        <div className="p-4">
          <div className="space-y-6">
            {/* Content Settings */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Настройки контента</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Категория
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
                    <option>Выберите категорию</option>
                    <option>События</option>
                    <option>Места</option>
                    <option>Советы</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Теги
                  </label>
                  <input
                    type="text"
                    placeholder="Введите теги через запятую"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    placeholder="Краткое описание статьи"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 h-20 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Publishing Settings */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Публикация</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Опубликовать сразу</span>
                </label>
                
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Уведомить подписчиков</span>
                </label>
                
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 text-red-600 focus:ring-red-500" />
                  <span className="text-sm text-gray-700">Разрешить комментарии</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-gray-200">
              <div className="space-y-2">
                <ResponsiveButton
                  onClick={() => setIsDeleteModalOpen(true)}
                  variant="outline"
                  size="md"
                  className="w-full flex items-center justify-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Удалить статью</span>
                </ResponsiveButton>
                
                <ResponsiveButton
                  onClick={() => {}}
                  variant="outline"
                  size="md"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Экспорт</span>
                </ResponsiveButton>
              </div>
            </div>
          </div>
        </div>
      </MobileDrawer>

      {/* Save Confirmation Modal */}
      <ConfirmationModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onConfirm={handleSave}
        title="Сохранить изменения"
        message="Вы уверены, что хотите сохранить изменения в статье?"
        confirmText="Сохранить"
        cancelText="Отмена"
        variant="default"
      />

      {/* Publish Confirmation Modal */}
      <ConfirmationModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        onConfirm={handlePublish}
        title="Опубликовать статью"
        message="Вы уверены, что хотите опубликовать эту статью? Она станет доступна всем пользователям."
        confirmText="Опубликовать"
        cancelText="Отмена"
        variant="default"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {}}
        title="Удалить статью"
        message="Вы уверены, что хотите удалить эту статью? Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      />
    </div>
  );
}
