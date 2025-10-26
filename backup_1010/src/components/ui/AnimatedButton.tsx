"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

interface AnimatedButtonProps {
  children: React.ReactNode
  onClick?: () => void | Promise<void>
  disabled?: boolean
  loading?: boolean
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function AnimatedButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
  className = ""
}: AnimatedButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 active:bg-gray-800",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500 active:bg-gray-100",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200"
  }
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }

  const handleClick = async () => {
    if (disabled || loading) return
    
    setIsPressed(true)
    
    try {
      if (onClick) {
        await onClick()
      }
    } finally {
      setTimeout(() => setIsPressed(false), 150)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isPressed ? 'scale-95' : 'hover:scale-105'}
        ${loading ? 'cursor-wait' : ''}
        ${className}
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Загрузка...
        </>
      ) : (
        children
      )}
    </button>
  )
}
