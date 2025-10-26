"use client"

import { useState, useTransition } from "react"
import { Heart, Loader2 } from "lucide-react"

interface OptimisticToggleProps {
  isActive: boolean
  onToggle: () => Promise<void>
  activeIcon?: React.ReactNode
  inactiveIcon?: React.ReactNode
  activeText?: string
  inactiveText?: string
  className?: string
}

export default function OptimisticToggle({
  isActive: initialActive,
  onToggle,
  activeIcon = <Heart className="w-4 h-4 fill-current" />,
  inactiveIcon = <Heart className="w-4 h-4" />,
  activeText = "В избранном",
  inactiveText = "В избранное",
  className = ""
}: OptimisticToggleProps) {
  const [isActive, setIsActive] = useState(initialActive)
  const [isPending, startTransition] = useTransition()

  const handleToggle = () => {
    // Оптимистичное обновление
    setIsActive(!isActive)
    
    startTransition(async () => {
      try {
        await onToggle()
      } catch (error) {
        // Откатываем изменения при ошибке
        setIsActive(isActive)
        console.error("Toggle failed:", error)
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
        transition-all duration-200 hover:scale-105 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isActive 
          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
        ${className}
      `}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isActive ? (
        activeIcon
      ) : (
        inactiveIcon
      )}
      <span>
        {isPending ? "Обновляем..." : isActive ? activeText : inactiveText}
      </span>
    </button>
  )
}
