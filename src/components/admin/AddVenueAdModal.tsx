'use client';

import { useState, useEffect } from 'react';
import { X, Search, Plus, Check, Calendar } from 'lucide-react';

interface Venue {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  priceFrom: number | null;
  priceTo: number | null;
  tariff: 'FREE' | 'SUPER' | 'MAXIMUM';
  address: string | null;
  district: string | null;
  city: {
    id: number;
    name: string;
    slug: string;
  };
  subcategory: {
    category: {
      name: string;
    };
  };
}

interface VenueAdData {
  venueId: number;
  startsAt: string;
  endsAt: string;
}

interface AddVenueAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (venueAds: VenueAdData[]) => void;
  currentVenueAds: Venue[];
}

export default function AddVenueAdModal({ isOpen, onClose, onAdd, currentVenueAds }: AddVenueAdModalProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenues, setSelectedVenues] = useState<number[]>([]);
  const [venueAdDates, setVenueAdDates] = useState<{[venueId: number]: {startsAt: string, endsAt: string}}>({});
  const [error, setError] = useState<string | null>(null);

  // Получаем ID уже добавленных мест
  const currentVenueIds = currentVenueAds.map(venue => venue.id);

  useEffect(() => {
    if (isOpen) {
      fetchVenues();
    }
  }, [isOpen]);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/venues?key=${process.env.NEXT_PUBLIC_ADMIN_KEY || 'kidsreview2025'}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch venues');
      }
      
      const data = await response.json();
      setVenues(data);
    } catch (error) {
      console.error('Error fetching venues:', error);
      setError('Ошибка загрузки мест');
    } finally {
      setLoading(false);
    }
  };

  const handleVenueSelect = (venueId: number) => {
    setSelectedVenues(prev => {
      if (prev.includes(venueId)) {
        // Убираем место из выбранных и удаляем его даты
        const newDates = { ...venueAdDates };
        delete newDates[venueId];
        setVenueAdDates(newDates);
        return prev.filter(id => id !== venueId);
      } else {
        // Добавляем место в выбранные и устанавливаем даты по умолчанию
        const today = new Date().toISOString().split('T')[0];
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const nextMonthStr = nextMonth.toISOString().split('T')[0];
        
        setVenueAdDates(prev => ({
          ...prev,
          [venueId]: {
            startsAt: today,
            endsAt: nextMonthStr
          }
        }));
        return [...prev, venueId];
      }
    });
  };

  const handleDateChange = (venueId: number, field: 'startsAt' | 'endsAt', value: string) => {
    setVenueAdDates(prev => ({
      ...prev,
      [venueId]: {
        ...prev[venueId],
        [field]: value
      }
    }));
  };

  const handleAdd = () => {
    if (selectedVenues.length === 0) {
      alert('Выберите хотя бы одно место');
      return;
    }

    // Проверяем, что все выбранные места имеют даты
    const missingDates = selectedVenues.filter(venueId => !venueAdDates[venueId]);
    if (missingDates.length > 0) {
      alert('Пожалуйста, укажите даты для всех выбранных мест');
      return;
    }

    // Проверяем, что дата окончания больше даты начала
    const invalidDates = selectedVenues.filter(venueId => {
      const dates = venueAdDates[venueId];
      return new Date(dates.endsAt) <= new Date(dates.startsAt);
    });
    if (invalidDates.length > 0) {
      alert('Дата окончания должна быть больше даты начала');
      return;
    }
    
    const venueAds = selectedVenues.map(venueId => ({
      venueId,
      startsAt: venueAdDates[venueId].startsAt,
      endsAt: venueAdDates[venueId].endsAt
    }));
    
    onAdd(venueAds);
    setSelectedVenues([]);
    setVenueAdDates({});
    setSearchQuery('');
    onClose();
  };

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         venue.city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         venue.subcategory.category.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Исключаем уже добавленные места
    const notAlreadyAdded = !currentVenueIds.includes(venue.id);
    
    return matchesSearch && notAlreadyAdded;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold">Добавить места в рекламу</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Поиск мест..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchVenues}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Попробовать снова
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVenues.map((venue) => (
                <div
                  key={venue.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    selectedVenues.includes(venue.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {venue.coverImage ? (
                          <img
                            src={venue.coverImage}
                            alt={venue.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-lg">🏢</span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{venue.name}</h4>
                        <p className="text-sm text-gray-600">
                          {venue.city.name} • {venue.subcategory.category.name}
                        </p>
                        {venue.address && (
                          <p className="text-xs text-gray-500 mt-1">{venue.address}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        venue.tariff === 'MAXIMUM' ? 'bg-red-100 text-red-800' :
                        venue.tariff === 'SUPER' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {venue.tariff}
                      </span>
                      
                      <button
                        onClick={() => handleVenueSelect(venue.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          selectedVenues.includes(venue.id)
                            ? 'bg-purple-600 text-white'
                            : 'border-2 border-gray-300 hover:border-purple-500'
                        }`}
                      >
                        {selectedVenues.includes(venue.id) && (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Поля для выбора дат - показываем только для выбранных мест */}
                  {selectedVenues.includes(venue.id) && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Дата начала рекламы
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="date"
                              value={venueAdDates[venue.id]?.startsAt || ''}
                              onChange={(e) => handleDateChange(venue.id, 'startsAt', e.target.value)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Дата окончания рекламы
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                              type="date"
                              value={venueAdDates[venue.id]?.endsAt || ''}
                              onChange={(e) => handleDateChange(venue.id, 'endsAt', e.target.value)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {filteredVenues.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Места не найдены</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Выбрано мест: {selectedVenues.length}
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleAdd}
                disabled={selectedVenues.length === 0}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить выбранные
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
