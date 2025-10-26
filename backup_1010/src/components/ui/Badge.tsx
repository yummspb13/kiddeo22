import { cn } from "@/lib/utils"

interface BadgeProps {
  count: number
  variant?: "default" | "destructive" | "secondary" | "warning"
  size?: "sm" | "md" | "lg"
  className?: string
  animated?: boolean
}

export default function Badge({ 
  count, 
  variant = "default", 
  size = "sm",
  className,
  animated = true
}: BadgeProps) {
  if (count === 0) return null

  const displayCount = count > 99 ? "99+" : count.toString()

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium text-white shadow-sm",
        {
          // Variants
          "bg-red-500": variant === "default",
          "bg-red-600": variant === "destructive", 
          "bg-gray-500": variant === "secondary",
          "bg-orange-500": variant === "warning",
          
          // Sizes
          "min-w-[18px] h-[18px] text-xs px-1": size === "sm",
          "min-w-[20px] h-[20px] text-xs px-1.5": size === "md",
          "min-w-[24px] h-[24px] text-sm px-2": size === "lg",
          
          // Animation
          "animate-pulse": animated && count > 0,
        },
        className
      )}
    >
      {displayCount}
    </span>
  )
}
