'use client'

import { useState } from 'react'
import Link from 'next/link'
import CategoryCards from '@/components/CategoryCards'
import { Calendar, Users, Star, Heart, Eye, Clock, MapPin, DollarSign, Sparkles, Zap, Target, Award, BookOpen, Gamepad2, Camera, Music, Paintbrush, Microscope, Trophy, Compass } from 'lucide-react'

// Тестовые данные для 10 разных категорий
const testCategories = [
  {
    id: 1,
    name: 'Театры',
    slug: 'theater',
    description: 'Кукольные спектакли, детские мюзиклы и интерактивные представления',
    icon: 'theater',
    color: 'purple',
    eventCount: 24,
    isPopular: true,
    isNew: false,
    isTrending: false
  },
  {
    id: 2,
    name: 'Музыка',
    slug: 'music',
    description: 'Концерты, музыкальные мастер-классы и вокальные студии',
    icon: 'music',
    color: 'blue',
    eventCount: 18,
    isPopular: false,
    isNew: true,
    isTrending: false
  },
  {
    id: 3,
    name: 'Спорт',
    slug: 'sport',
    description: 'Спортивные секции, соревнования и активные игры',
    icon: 'sport',
    color: 'green',
    eventCount: 32,
    isPopular: true,
    isNew: false,
    isTrending: true
  },
  {
    id: 4,
    name: 'Мастер-классы',
    slug: 'workshop',
    description: 'Творческие мастерские, кулинарные уроки и ремесла',
    icon: 'workshop',
    color: 'orange',
    eventCount: 15,
    isPopular: false,
    isNew: false,
    isTrending: false
  },
  {
    id: 5,
    name: 'Искусство',
    slug: 'art',
    description: 'Выставки, художественные студии и творческие проекты',
    icon: 'art',
    color: 'pink',
    eventCount: 12,
    isPopular: false,
    isNew: true,
    isTrending: false
  },
  {
    id: 6,
    name: 'Образование',
    slug: 'education',
    description: 'Развивающие занятия, языковые курсы и научные эксперименты',
    icon: 'education',
    color: 'indigo',
    eventCount: 28,
    isPopular: true,
    isNew: false,
    isTrending: false
  },
  {
    id: 7,
    name: 'Развлечения',
    slug: 'entertainment',
    description: 'Игровые центры, аттракционы и веселые активности',
    icon: 'entertainment',
    color: 'yellow',
    eventCount: 21,
    isPopular: false,
    isNew: false,
    isTrending: true
  },
  {
    id: 8,
    name: 'Наука',
    slug: 'science',
    description: 'Научные шоу, эксперименты и познавательные программы',
    icon: 'science',
    color: 'teal',
    eventCount: 9,
    isPopular: false,
    isNew: true,
    isTrending: false
  },
  {
    id: 9,
    name: 'Книги',
    slug: 'books',
    description: 'Чтение, литературные клубы и книжные ярмарки',
    icon: 'books',
    color: 'brown',
    eventCount: 7,
    isPopular: false,
    isNew: false,
    isTrending: false
  },
  {
    id: 10,
    name: 'Игры',
    slug: 'games',
    description: 'Настольные игры, квесты и интерактивные развлечения',
    icon: 'games',
    color: 'red',
    eventCount: 14,
    isPopular: false,
    isNew: false,
    isTrending: true
  }
]

export default function TestCategoriesPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Заголовок */}
      <div className="bg-white shadow-sm border-b">
        <div className="w-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Тестовая страница категорий
              </h1>
              <p className="text-gray-600 mt-2">
                10 разных видов карточек категорий с 4 режимами отображения
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/city/moskva/cat/events"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Назад к событиям
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент с CategoryCards */}
      <div className="w-full">
        <CategoryCards 
          categories={testCategories}
          citySlug="moskva"
        />
      </div>
    </div>
  )
}