"use client"

interface SocialMetaProps {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'event' | 'place'
  siteName?: string
  locale?: string
  baseUrl?: string
}

export default function SocialMeta({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName = 'KidsReview',
  locale = 'ru_RU',
  baseUrl = 'https://kidsreview.ru'
}: SocialMetaProps) {
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  const fullImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : `${baseUrl}/og-default.jpg`

  return (
    <>
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Дополнительные мета-теги */}
      <meta name="description" content={description} />
      <meta name="keywords" content="детские мероприятия, афиша, события, места для детей, развлечения" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
    </>
  )
}
