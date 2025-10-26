'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

interface Breadcrumb {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: Breadcrumb[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  return (
    <motion.nav
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center space-x-2 text-sm text-gray-600 mb-8"
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="flex items-center space-x-2"
        >
          {index > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="text-gray-400"
            >
              /
            </motion.span>
          )}
          
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-red-600 transition-colors duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">
              {item.label}
            </span>
          )}
        </motion.div>
      ))}
    </motion.nav>
  )
}









