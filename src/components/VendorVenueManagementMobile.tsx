'use client';

import { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical,
  Star,
  Calendar,
  Users,
  Phone,
  Mail,
  Globe
} from 'lucide-react';
import ResponsiveCard from './ResponsiveCard';
import ResponsiveButton from './ResponsiveForm';
import ResponsiveModal, { ConfirmationModal } from './ResponsiveModal';
import SwipeActions, { SwipeActionSets } from './SwipeActions';

interface Venue {
  id: string;
  name: string;
  address: string;
  description: string;
  rating: number;
  reviewCount: number;
  upcomingEvents: number;
  totalEvents: number;
  status: 'active' | 'inactive' | 'pending';
  image?: string;
  phone?: string;
  email?: string;
  website?: string;
  capacity?: number;
  amenities: string[];
}

interface VendorVenueManagementMobileProps {
  venues: Venue[];
  onEdit: (venue: Venue) => void;
  onDelete: (venueId: string) => void;
  onView: (venue: Venue) => void;
  onCreate: () => void;
}

export default function VendorVenueManagementMobile({
  venues,
  onEdit,
  onDelete,
  onView,
  onCreate
}: VendorVenueManagementMobileProps) {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');

  const filteredVenues = venues.filter(venue => {
    if (filter === 'all') return true;
    return venue.status === filter;
  });

  const handleDelete = (venue: Venue) => {
    setSelectedVenue(venue);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedVenue) {
      onDelete(selectedVenue.id);
      setIsDeleteModalOpen(false);
      setSelectedVenue(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активно';
      case 'inactive':
        return 'Неактивно';
      case 'pending':
        return 'На модерации';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Мои места</h1>
          <p className="text-gray-600">Управление площадками и локациями</p>
        </div>
        <ResponsiveButton
          onClick={onCreate}
          variant="primary"
          size="md"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Добавить место</span>
          <span className="sm:hidden">Добавить</span>
        </ResponsiveButton>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { key: 'all', label: 'Все', count: venues.length },
          { key: 'active', label: 'Активные', count: venues.filter(v => v.status === 'active').length },
          { key: 'pending', label: 'На модерации', count: venues.filter(v => v.status === 'pending').length },
          { key: 'inactive', label: 'Неактивные', count: venues.filter(v => v.status === 'inactive').length }
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === key
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Venues List */}
      <div className="space-y-4">
        {filteredVenues.map((venue) => (
          <SwipeActions
            key={venue.id}
            actions={SwipeActionSets.venue(
              () => onView(venue),
              () => onEdit(venue),
              () => handleDelete(venue)
            )}
          >
            <ResponsiveCard
              variant="elevated"
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {venue.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="line-clamp-1">{venue.address}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(venue.status)}`}>
                      {getStatusLabel(venue.status)}
                    </span>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Image */}
                {venue.image && (
                  <div className="mb-3">
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {venue.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{venue.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500">{venue.reviewCount} отзывов</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Calendar className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{venue.upcomingEvents}</span>
                    </div>
                    <p className="text-xs text-gray-500">Ближайшие</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{venue.capacity || 'N/A'}</span>
                    </div>
                    <p className="text-xs text-gray-500">Вместимость</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  {venue.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      <span>{venue.phone}</span>
                    </div>
                  )}
                  {venue.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      <span className="truncate">{venue.email}</span>
                    </div>
                  )}
                  {venue.website && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-1" />
                      <span className="truncate">Сайт</span>
                    </div>
                  )}
                </div>

                {/* Amenities */}
                {venue.amenities.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {venue.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                      {venue.amenities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{venue.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <ResponsiveButton
                    onClick={() => onView(venue)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Просмотр
                  </ResponsiveButton>
                  
                  <ResponsiveButton
                    onClick={() => onEdit(venue)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Редактировать
                  </ResponsiveButton>
                </div>
              </div>
            </ResponsiveCard>
          </SwipeActions>
        ))}
      </div>

      {/* Empty State */}
      {filteredVenues.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'Нет мест' : `Нет ${getStatusLabel(filter)} мест`}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? 'Добавьте первое место для начала работы'
              : `Попробуйте изменить фильтр или добавьте новое место`
            }
          </p>
          <ResponsiveButton
            onClick={onCreate}
            variant="primary"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Добавить место
          </ResponsiveButton>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Удалить место"
        message={`Вы уверены, что хотите удалить место "${selectedVenue?.name}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      />
    </div>
  );
}
