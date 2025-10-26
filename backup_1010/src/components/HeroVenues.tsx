"use client"

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from "next/navigation"
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Users,
  Sparkles,
  Mic,
  X,
  ArrowRight,
  Filter,
  Building2,
  Heart,
  Calendar
} from "lucide-react"

interface VenueSuggestion {
  id: string
  type: 'venue' | 'category' | 'ai_suggestion'
  title: string
  description?: string
  price?: number
  image?: string
  category?: string
  rating?: number
  location?: string
  isPopular?: boolean
  ageRange?: string
  distance?: string
}

interface HeroVenuesProps {
  cityName: string
  citySlug: string
}


const aiSuggestions = [
  { id: 'nearby', title: 'Места рядом с домом', icon: MapPin },
  { id: 'sports', title: 'Спортивные секции', icon: Users },
  { id: 'creative', title: 'Творческие студии', icon: Sparkles },
  { id: 'education', title: 'Образовательные центры', icon: Building2 },
  { id: 'health', title: 'Медицинские услуги', icon: Heart },
  { id: 'camps', title: 'Детские лагеря', icon: Calendar }
]

export default function HeroVenues({ cityName, citySlug }: HeroVenuesProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const router = useRouter()

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/city/${citySlug}/cat/venues?search=${encodeURIComponent(query)}`)
    }
  }


  const handleAISuggestion = (suggestion: string) => {
    setSearchQuery(suggestion)
    handleSearch(suggestion)
  }

  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.lang = 'ru-RU'
      recognition.onresult = (event: unknown) => {
        const transcript = (event as any).results[0][0].transcript
        setSearchQuery(transcript)
        handleSearch(transcript)
        setIsListening(false)
      }
      recognition.onerror = () => setIsListening(false)
      recognition.start()
      setIsListening(true)
    }
  }

  return (
    <div className="relative overflow-hidden text-white">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image src="/ads/sidebar-2.svg" alt="Фон" fill sizes="100vw" className="object-cover" priority />
      </div>
      {/* Gradient tint (≈20%) */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-black/45 via-black/45 to-black/45" />
      
      <div className="relative container py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Места для детей в {cityName}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Найдите идеальные места для развития, развлечений и обучения вашего ребенка
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/80" />
            </div>
            <input
              type="text"
              placeholder={`Поиск мест в ${cityName}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              className="w-full pl-12 pr-24 py-4 text-lg border border-white/30 bg-white/10 backdrop-blur rounded-2xl focus:ring-2 focus:ring-emerald-400/60 focus:border-transparent shadow-lg placeholder-white/70 text-white"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <button
                onClick={startVoiceSearch}
                disabled={isListening}
                className="p-2 text-white/80 hover:text-white transition-colors disabled:opacity-50"
              >
                <Mic className={`h-5 w-5 ${isListening ? 'animate-pulse text-emerald-600' : ''}`} />
              </button>
              <button
                onClick={() => handleSearch(searchQuery)}
                className="ml-2 px-6 py-2 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors font-medium"
              >
                Найти
              </button>
            </div>
          </div>

          {/* AI Suggestions */}
          {showSuggestions && (
            <div className="mt-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">AI предложения:</span>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {aiSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleAISuggestion(suggestion.title)}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 rounded-lg transition-colors"
                  >
                    <suggestion.icon className="h-4 w-4" />
                    {suggestion.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
