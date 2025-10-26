'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface Category {
  id: number
  name: string
  slug: string
  postCount: number
  color?: string
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const buttonVariants = {
    rest: { 
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    },
    hover: { 
      scale: 1.08,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    tap: { 
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  }

  const shimmerVariants = {
    rest: { 
      x: "-100%",
      opacity: 0
    },
    hover: { 
      x: "100%",
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  }

  return (
    <div className="relative">
      {/* Mobile Filter Button */}
      <div className="md:hidden mb-6">
        <motion.button
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-white via-gray-50 to-white rounded-xl shadow-lg border border-gray-200 overflow-hidden group"
        >
          {/* Shimmer effect */}
          <motion.div
            variants={shimmerVariants}
            initial="rest"
            whileHover="hover"
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
          <span className="font-medium text-gray-700">
            {selectedCategory === 'all' ? 'Все категории' : 
             categories.find(cat => cat.slug === selectedCategory)?.name || 'Все категории'}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </motion.button>

        {/* Mobile Dropdown */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isOpen ? 1 : 0, 
            height: isOpen ? 'auto' : 0 
          }}
          transition={{ duration: 0.3 }}
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isOpen ? "visible" : "hidden"}
            className="p-2"
          >
            {categories.map((category) => (
              <motion.button
                key={category.id}
                variants={itemVariants}
                onClick={() => {
                  onCategoryChange(category.slug)
                  setIsOpen(false)
                }}
                className={`relative w-full text-left px-3 py-2 rounded-lg transition-all duration-300 overflow-hidden group ${
                  selectedCategory === category.slug
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium shadow-lg shadow-red-200'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50'
                }`}
              >
                {/* Shimmer effect for mobile */}
                <motion.div
                  variants={shimmerVariants}
                  initial="rest"
                  whileHover="hover"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                <div className="flex items-center justify-between">
                  <span>{category.name}</span>
                  <span className="text-sm text-gray-500">({category.postCount})</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Desktop Filter */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="hidden md:flex flex-wrap gap-3 justify-center"
      >
        {categories.map((category) => (
          <motion.button
            key={category.id}
            variants={itemVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={() => onCategoryChange(category.slug)}
            className={`relative px-6 py-3 rounded-full font-medium transition-all duration-300 overflow-hidden group ${
              selectedCategory === category.slug
                ? 'bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white shadow-lg shadow-red-200'
                : 'bg-gradient-to-r from-gray-100 via-white to-gray-100 text-gray-700 hover:from-gray-200 hover:via-gray-50 hover:to-gray-200'
            }`}
            style={{
              backgroundColor: selectedCategory === category.slug ? undefined : category.color ? category.color + '20' : undefined,
              borderColor: selectedCategory === category.slug ? undefined : category.color,
              borderWidth: selectedCategory === category.slug ? 0 : '1px'
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              variants={shimmerVariants}
              initial="rest"
              whileHover="hover"
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
            
            {/* Glow effect for selected */}
            {selectedCategory === category.slug && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-400/20 via-pink-400/20 to-red-400/20 rounded-full"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
            
            <span className="relative flex items-center space-x-2 z-10">
              <span>{category.name}</span>
              <motion.span
                className={`text-xs px-2 py-1 rounded-full ${
                  selectedCategory === category.slug
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'bg-gray-200/50'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.1 }}
              >
                {category.postCount}
              </motion.span>
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}

