'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, Clock, MapPin, User, Calendar, Eye, Trash2 } from 'lucide-react';

interface VenueSuggestion {
  id: number;
  name: string;
  address: string;
  description: string;
  category: string;
  contact: string | null;
  status: string;
  createdAt: string;
  user: {
    id: number;
    name: string | null;
    email: string;
  };
  city: {
    id: number;
    name: string;
    slug: string;
  };
}

interface VenueSuggestionsClientProps {
  initialSuggestions: VenueSuggestion[];
}

export default function VenueSuggestionsClient({ initialSuggestions }: VenueSuggestionsClientProps) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [filter, setFilter] = useState('ALL');
  const [selectedSuggestion, setSelectedSuggestion] = useState<VenueSuggestion | null>(null);

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (filter === 'ALL') return true;
    return suggestion.status === filter;
  });

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/venue-suggestions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        setSuggestions(prev => 
          prev.map(s => s.id === id ? { ...s, status: newStatus } : s)
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить это предложение?')) return;

    try {
      const response = await fetch(`/api/admin/venue-suggestions?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuggestions(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting suggestion:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Одобрено';
      case 'REJECTED':
        return 'Отклонено';
      default:
        return 'На рассмотрении';
    }
  };

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="flex space-x-4">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'ALL' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Все ({suggestions.length})
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'PENDING' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          На рассмотрении ({suggestions.filter(s => s.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilter('APPROVED')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'APPROVED' 
              ? 'bg-green-500 text-white' 
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Одобрено ({suggestions.filter(s => s.status === 'APPROVED').length})
        </button>
        <button
          onClick={() => setFilter('REJECTED')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'REJECTED' 
              ? 'bg-red-500 text-white' 
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          Отклонено ({suggestions.filter(s => s.status === 'REJECTED').length})
        </button>
      </div>

      {/* Список предложений */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredSuggestions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Предложения не найдены</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {suggestion.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(suggestion.status)}`}>
                        {getStatusLabel(suggestion.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {suggestion.address}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        {suggestion.user.name || suggestion.user.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(suggestion.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Категория:</span> {suggestion.category}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-4">
                      {suggestion.description}
                    </p>

                    {suggestion.contact && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Контакты:</span> {suggestion.contact}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedSuggestion(suggestion)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    {suggestion.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(suggestion.id, 'APPROVED')}
                          className="p-2 text-green-600 hover:text-green-800"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(suggestion.id, 'REJECTED')}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => handleDelete(suggestion.id)}
                      className="p-2 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно для детального просмотра */}
      {selectedSuggestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedSuggestion.name}
                </h2>
                <button
                  onClick={() => setSelectedSuggestion(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Адрес</h3>
                  <p className="text-gray-700">{selectedSuggestion.address}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Описание</h3>
                  <p className="text-gray-700">{selectedSuggestion.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Категория</h3>
                    <p className="text-gray-700">{selectedSuggestion.category}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Статус</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSuggestion.status)}`}>
                      {getStatusLabel(selectedSuggestion.status)}
                    </span>
                  </div>
                </div>

                {selectedSuggestion.contact && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Контакты</h3>
                    <p className="text-gray-700">{selectedSuggestion.contact}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Пользователь</h3>
                    <p className="text-gray-700">
                      {selectedSuggestion.user.name || selectedSuggestion.user.email}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Дата подачи</h3>
                    <p className="text-gray-700">
                      {new Date(selectedSuggestion.createdAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedSuggestion(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Закрыть
                </button>
                {selectedSuggestion.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedSuggestion.id, 'APPROVED');
                        setSelectedSuggestion(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Одобрить
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedSuggestion.id, 'REJECTED');
                        setSelectedSuggestion(null);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Отклонить
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
