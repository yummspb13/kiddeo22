'use client';

import { useState } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Clock,
  Star
} from 'lucide-react';
import ResponsiveCard from './ResponsiveCard';
import ResponsiveButton from './ResponsiveForm';
import ResponsiveModal, { ConfirmationModal } from './ResponsiveModal';
import SwipeActions, { SwipeActionSets } from './SwipeActions';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'vendor' | 'user';
  status: 'active' | 'inactive' | 'banned' | 'pending';
  avatar?: string;
  joinDate: string;
  lastActive: string;
  eventsCount: number;
  venuesCount: number;
  rating: number;
  isVerified: boolean;
}

interface AdminUsersManagementMobileProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onView: (user: User) => void;
  onBan: (userId: string) => void;
  onUnban: (userId: string) => void;
  onVerify: (userId: string) => void;
  onCreate: () => void;
}

export default function AdminUsersManagementMobile({
  users,
  onEdit,
  onDelete,
  onView,
  onBan,
  onUnban,
  onVerify,
  onCreate
}: AdminUsersManagementMobileProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isUnbanModalOpen, setIsUnbanModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'banned' | 'pending'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'vendor' | 'user'>('all');

  const filteredUsers = users.filter(user => {
    const statusMatch = filter === 'all' || user.status === filter;
    const roleMatch = roleFilter === 'all' || user.role === roleFilter;
    return statusMatch && roleMatch;
  });

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleBan = (user: User) => {
    setSelectedUser(user);
    setIsBanModalOpen(true);
  };

  const handleUnban = (user: User) => {
    setSelectedUser(user);
    setIsUnbanModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUser) {
      onDelete(selectedUser.id);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  const confirmBan = () => {
    if (selectedUser) {
      onBan(selectedUser.id);
      setIsBanModalOpen(false);
      setSelectedUser(null);
    }
  };

  const confirmUnban = () => {
    if (selectedUser) {
      onUnban(selectedUser.id);
      setIsUnbanModalOpen(false);
      setSelectedUser(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'banned':
        return 'text-red-600 bg-red-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активен';
      case 'inactive':
        return 'Неактивен';
      case 'banned':
        return 'Заблокирован';
      case 'pending':
        return 'На модерации';
      default:
        return 'Неизвестно';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 bg-red-100';
      case 'vendor':
        return 'text-blue-600 bg-blue-100';
      case 'user':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'vendor':
        return 'Вендор';
      case 'user':
        return 'Пользователь';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
          <p className="text-gray-600">Управление пользователями системы</p>
        </div>
        <ResponsiveButton
          onClick={onCreate}
          variant="primary"
          size="md"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Добавить пользователя</span>
          <span className="sm:hidden">Добавить</span>
        </ResponsiveButton>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-4">
        {/* Status Filter */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'Все', count: users.length },
            { key: 'active', label: 'Активные', count: users.filter(u => u.status === 'active').length },
            { key: 'pending', label: 'На модерации', count: users.filter(u => u.status === 'pending').length },
            { key: 'banned', label: 'Заблокированные', count: users.filter(u => u.status === 'banned').length }
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

        {/* Role Filter */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'Все роли', count: users.length },
            { key: 'admin', label: 'Админы', count: users.filter(u => u.role === 'admin').length },
            { key: 'vendor', label: 'Вендоры', count: users.filter(u => u.role === 'vendor').length },
            { key: 'user', label: 'Пользователи', count: users.filter(u => u.role === 'user').length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setRoleFilter(key as any)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                roleFilter === key
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <SwipeActions
            key={user.id}
            actions={SwipeActionSets.user(
              () => onView(user),
              () => onEdit(user),
              () => handleDelete(user)
            )}
          >
            <ResponsiveCard
              variant="elevated"
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.name}
                        </h3>
                        {user.isVerified && (
                          <Shield className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Mail className="w-4 h-4 mr-1" />
                        <span>{user.email}</span>
                      </div>
                      
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Phone className="w-4 h-4 mr-1" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                      {getStatusLabel(user.status)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Calendar className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{user.eventsCount}</span>
                    </div>
                    <p className="text-xs text-gray-500">События</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{user.venuesCount}</span>
                    </div>
                    <p className="text-xs text-gray-500">Места</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium text-gray-900">{user.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500">Рейтинг</p>
                  </div>
                </div>

                {/* Join Date & Last Active */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Регистрация: {new Date(user.joinDate).toLocaleDateString('ru')}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Активен: {new Date(user.lastActive).toLocaleDateString('ru')}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <ResponsiveButton
                    onClick={() => onView(user)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Просмотр
                  </ResponsiveButton>
                  
                  <ResponsiveButton
                    onClick={() => onEdit(user)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Редактировать
                  </ResponsiveButton>
                  
                  {user.status === 'banned' ? (
                    <ResponsiveButton
                      onClick={() => handleUnban(user)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <UserCheck className="w-4 h-4 mr-1" />
                      Разблокировать
                    </ResponsiveButton>
                  ) : (
                    <ResponsiveButton
                      onClick={() => handleBan(user)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <UserX className="w-4 h-4 mr-1" />
                      Заблокировать
                    </ResponsiveButton>
                  )}
                </div>
              </div>
            </ResponsiveCard>
          </SwipeActions>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'Нет пользователей' : `Нет ${getStatusLabel(filter)} пользователей`}
          </h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? 'Добавьте первого пользователя для начала работы'
              : `Попробуйте изменить фильтр или добавьте нового пользователя`
            }
          </p>
          <ResponsiveButton
            onClick={onCreate}
            variant="primary"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Добавить пользователя
          </ResponsiveButton>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Удалить пользователя"
        message={`Вы уверены, что хотите удалить пользователя "${selectedUser?.name}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      />

      {/* Ban Confirmation Modal */}
      <ConfirmationModal
        isOpen={isBanModalOpen}
        onClose={() => setIsBanModalOpen(false)}
        onConfirm={confirmBan}
        title="Заблокировать пользователя"
        message={`Вы уверены, что хотите заблокировать пользователя "${selectedUser?.name}"? Он не сможет войти в систему.`}
        confirmText="Заблокировать"
        cancelText="Отмена"
        variant="danger"
      />

      {/* Unban Confirmation Modal */}
      <ConfirmationModal
        isOpen={isUnbanModalOpen}
        onClose={() => setIsUnbanModalOpen(false)}
        onConfirm={confirmUnban}
        title="Разблокировать пользователя"
        message={`Вы уверены, что хотите разблокировать пользователя "${selectedUser?.name}"? Он снова сможет войти в систему.`}
        confirmText="Разблокировать"
        cancelText="Отмена"
        variant="default"
      />
    </div>
  );
}
