'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import VenueAdList from '@/components/admin/VenueAdList';
import AddVenueAdModal from '@/components/admin/AddVenueAdModal';

interface VenueAd {
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

export default function VenueAdsClient() {
  const [venueAds, setVenueAds] = useState<VenueAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchVenueAds();
  }, []);

  const fetchVenueAds = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/venue-ads?key=${process.env.NEXT_PUBLIC_ADMIN_KEY || 'kidsreview2025'}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch venue ads');
      }
      
      const data = await response.json();
      setVenueAds(data);
    } catch (error) {
      console.error('Error fetching venue ads:', error);
      setError('Ошибка загрузки рекламных мест');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (venue: VenueAd) => {
    // TODO: Implement edit functionality
    console.log('Edit venue:', venue);
  };

  const handleAdd = async (venueAds: Array<{venueId: number, startsAt: string, endsAt: string}>) => {
    try {
      const promises = venueAds.map(venueAd => 
        fetch(`/api/admin/venue-ads?key=${process.env.NEXT_PUBLIC_ADMIN_KEY || 'kidsreview2025'}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            venueId: venueAd.venueId,
            section: 'RECOMMENDED',
            startsAt: venueAd.startsAt,
            endsAt: venueAd.endsAt
          }),
        })
      );

      const responses = await Promise.all(promises);
      
      const failedResponses = responses.filter(response => !response.ok);
      if (failedResponses.length > 0) {
        throw new Error(`Failed to add ${failedResponses.length} venues`);
      }

      // Refresh the list
      await fetchVenueAds();
      alert(`Успешно добавлено ${venueAds.length} мест в рекламу`);
    } catch (error) {
      console.error('Error adding venue ads:', error);
      alert('Ошибка при добавлении мест в рекламу');
    }
  };

  const handleDelete = async (venueId: number) => {
    if (!confirm('Вы уверены, что хотите убрать это место из рекламы?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/venue-ads?key=${process.env.NEXT_PUBLIC_ADMIN_KEY || 'kidsreview2025'}&venueId=${venueId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove venue ad');
      }

      // Remove from local state
      setVenueAds(venueAds.filter(venue => venue.id !== venueId));
    } catch (error) {
      console.error('Error removing venue ad:', error);
      alert('Ошибка при удалении места из рекламы');
    }
  };

  const handleToggleActive = async (venueId: number, isActive: boolean) => {
    // TODO: Implement toggle active functionality
    console.log('Toggle active:', venueId, isActive);
  };

  const filteredVenueAds = venueAds.filter(venue =>
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.subcategory.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchVenueAds}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Реклама мест</h1>
        <p className="text-gray-600">Управление рекламными размещениями мест</p>
      </div>

      {/* Поиск и кнопки - мобильная версия */}
      <div className="block md:hidden mb-6">
        <div className="space-y-4">
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
          
          <div className="flex flex-col gap-3">
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              Фильтры
            </button>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить место
            </button>
          </div>
        </div>
      </div>

      {/* Поиск и кнопки - десктопная версия */}
      <div className="hidden md:flex items-center justify-between gap-4 mb-6">
        <div className="flex-1 max-w-md">
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
        
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Фильтры
          </button>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить место
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">💎</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Рекомендуем</p>
              <p className="text-2xl font-bold text-gray-900">{venueAds.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Популярные</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✨</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Новинки</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Venue Ads List */}
      <VenueAdList
        venueAds={filteredVenueAds}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      {/* Add Modal */}
      <AddVenueAdModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAdd}
        currentVenueAds={venueAds}
      />
    </div>
  );
}
