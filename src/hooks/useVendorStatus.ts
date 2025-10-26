import { useState, useEffect } from 'react'

export function useVendorStatus(userId?: string) {
  const [isVendor, setIsVendor] = useState(false)
  const [vendorData, setVendorData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const refreshVendorStatus = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Очищаем кэш
      const cacheKey = `vendor_status_${userId}`;
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_time`);
      
      const res = await fetch('/api/vendor/onboarding', {
        cache: 'no-store'
      });
      
      if (res.ok) {
        const text = await res.text();
        if (text.trim()) {
          try {
            const data = JSON.parse(text);
            if (data.vendor) {
              setIsVendor(true);
              setVendorData(data.vendor);
              // Кэшируем результат
              localStorage.setItem(cacheKey, text);
              localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
            } else {
              setIsVendor(false);
              setVendorData(null);
              // Кэшируем отрицательный результат
              localStorage.setItem(cacheKey, '{"vendor":null}');
              localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
            }
          } catch (parseError) {
            console.warn('useVendorStatus: Failed to parse JSON response:', parseError);
          }
        } else {
          setIsVendor(false);
          setVendorData(null);
        }
      }
    } catch (err) {
      console.error('Error refreshing vendor status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setIsVendor(false);
      setVendorData(null);
      return;
    }
    
    // Проверяем кэш
    const cacheKey = `vendor_status_${userId}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(`${cacheKey}_time`);
    
    // Если кэш свежий (менее 5 минут), используем его
    if (cachedData && cacheTime) {
      const now = Date.now();
      const cacheAge = now - parseInt(cacheTime);
      if (cacheAge < 5 * 60 * 1000) { // 5 минут
        try {
          const data = JSON.parse(cachedData);
          if (data.vendor) {
            setIsVendor(true);
            setVendorData(data.vendor);
            return;
          }
        } catch (e) {
          // Игнорируем ошибки парсинга кэша
        }
      }
    }
    
    // Если кэша нет или он устарел, делаем запрос
    refreshVendorStatus();
  }, [userId]);

  return {
    isVendor,
    vendorData,
    loading,
    refreshVendorStatus
  };
}
