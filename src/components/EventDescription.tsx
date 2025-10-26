'use client'

import ExpandableDescription from './ExpandableDescription'

interface EventDescriptionProps {
  richDescription?: string | null
  fallbackDescription?: string | null
  maxHeight?: number
}

export default function EventDescription({ 
  richDescription, 
  fallbackDescription,
  maxHeight = 200 
}: EventDescriptionProps) {
  return (
    <ExpandableDescription 
      richDescription={richDescription}
      fallbackDescription={fallbackDescription}
      maxHeight={maxHeight}
    />
  )
}
