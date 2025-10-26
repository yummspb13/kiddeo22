'use client'

import { useEffect, useState } from 'react'

export default function TestLinksPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/homepage/content?citySlug=moskva')
        const result = await response.json()
        setData(result)
        console.log('Полученные данные:', result)
      } catch (error) {
        console.error('Ошибка:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div>Загрузка...</div>
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Тест ссылок HomePageBlock</h1>
      
      {data && Object.keys(data).map(blockType => {
        const block = data[blockType]
        if (!block.content || block.content.length === 0) return null
        
        return (
          <div key={blockType} style={{ margin: '20px 0', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>{blockType}</h2>
            <p>Количество элементов: {block.content.length}</p>
            
            {block.content.slice(0, 3).map((item: any, index: number) => (
              <div key={index} style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <h3>{item.title}</h3>
                <p><strong>Тип:</strong> {item.type}</p>
                <p><strong>ID:</strong> {item.id}</p>
                <p><strong>Slug:</strong> {item.slug || 'НЕТ'}</p>
                <p><strong>Ссылка будет:</strong> {
                  item.type === 'BLOG_POST' ? `/blog/${item.slug || item.id}` : 
                  item.type === 'EVENT' ? `/event/${item.slug || item.id}` :
                  item.type === 'VENUE' ? `/city/moskva/venue/${item.slug || item.id}` :
                  item.type === 'SERVICE' ? `/city/moskva/service/${item.slug || item.id}` :
                  `/city/moskva/${item.type.toLowerCase()}/${item.slug || item.id}`
                }</p>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
