'use client'

import { useState, useEffect } from 'react'
import { safeArray, safeFetch } from '@/lib/api-utils'

interface UseAdminDataOptions {
  cities?: boolean
  categories?: boolean
  vendors?: boolean
  venues?: boolean
}

export function useAdminData(options: UseAdminDataOptions = {}) {
  const [data, setData] = useState({
    cities: [] as { id: number; name: string; slug: string }[],
    categories: [] as { id: number; name: string; slug: string }[],
    vendors: [] as unknown[],
    venues: [] as unknown[],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const promises: Promise<unknown>[] = []
        const endpoints: string[] = []

        if (options.cities) {
          promises.push(safeFetch('/api/admin/cities?key=kidsreview2025', { cities: [] }))
          endpoints.push('cities')
        }
        if (options.categories) {
          promises.push(safeFetch('/api/admin/afisha/categories?key=kidsreview2025', []))
          endpoints.push('categories')
        }
        if (options.vendors) {
          promises.push(safeFetch('/api/admin/vendors', []))
          endpoints.push('vendors')
        }
        if (options.venues) {
          promises.push(safeFetch('/api/admin/venues', []))
          endpoints.push('venues')
        }

        const results = await Promise.all(promises)

        const newData = { ...data }
        results.forEach((result, index) => {
          const endpoint = endpoints[index]
          if (endpoint === 'cities') {
            newData.cities = safeArray(result)
          } else if (endpoint === 'categories') {
            newData.categories = safeArray(result)
          } else if (endpoint === 'vendors') {
            newData.vendors = safeArray(result)
          } else if (endpoint === 'venues') {
            newData.venues = safeArray(result)
          }
        })

        setData(newData)
      } catch (err) {
        console.error('Error loading admin data:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [options.cities, options.categories, options.vendors, options.venues])

  return { data, loading, error }
}
