'use client'

import { useState, useEffect } from 'react'

interface ManualAddressInfoProps {
  district: string
  metro: string
  onDistrictChange: (district: string) => void
  onMetroChange: (metro: string) => void
  city?: string
  className?: string
  disabled?: boolean
}

// Список районов для основных городов
const CITY_DISTRICTS: { [key: string]: string[] } = {
  'Москва': [
    'Центральный административный округ',
    'Северный административный округ',
    'Северо-Восточный административный округ',
    'Восточный административный округ',
    'Юго-Восточный административный округ',
    'Южный административный округ',
    'Юго-Западный административный округ',
    'Западный административный округ',
    'Северо-Западный административный округ',
    'Новомосковский административный округ',
    'Троицкий административный округ'
  ],
  'Санкт-Петербург': [
    'Адмиралтейский район',
    'Василеостровский район',
    'Выборгский район',
    'Калининский район',
    'Кировский район',
    'Колпинский район',
    'Красногвардейский район',
    'Красносельский район',
    'Кронштадтский район',
    'Курортный район',
    'Московский район',
    'Невский район',
    'Петроградский район',
    'Петродворцовый район',
    'Приморский район',
    'Пушкинский район',
    'Фрунзенский район',
    'Центральный район'
  ]
}

// Список станций метро для основных городов
const CITY_METRO: { [key: string]: string[] } = {
  'Москва': [
    'Авиамоторная', 'Автозаводская', 'Академическая', 'Александровский сад', 'Алма-Атинская',
    'Алтуфьево', 'Аннино', 'Арбатская', 'Аэропорт', 'Бабушкинская', 'Багратионовская',
    'Баррикадная', 'Бауманская', 'Беговая', 'Белокаменная', 'Беломорская', 'Беляево',
    'Бибирево', 'Библиотека имени Ленина', 'Битцевский парк', 'Борисово', 'Боровицкая',
    'Ботанический сад', 'Братиславская', 'Бульвар Адмирала Ушакова', 'Бульвар Дмитрия Донского',
    'Бульвар Рокоссовского', 'Бунинская аллея', 'Варшавская', 'ВДНХ', 'Владыкино',
    'Водный стадион', 'Войковская', 'Волгоградский проспект', 'Волжская', 'Волоколамская',
    'Воробьёвы горы', 'Выставочная', 'Выхино', 'Говорово', 'Деловой центр', 'Динамо',
    'Дмитровская', 'Добрынинская', 'Домодедовская', 'Достоевская', 'Дубровка', 'Жулебино',
    'Зябликово', 'Измайловская', 'Калужская', 'Кантемировская', 'Каховская', 'Каширская',
    'Киевская', 'Китай-город', 'Кожуховская', 'Коломенская', 'Комсомольская', 'Коньково',
    'Красногвардейская', 'Краснопресненская', 'Красносельская', 'Красные ворота',
    'Крестьянская застава', 'Кропоткинская', 'Крылатское', 'Кузнецкий мост', 'Кузьминки',
    'Кунцевская', 'Курская', 'Кутузовская', 'Ленинский проспект', 'Лермонтовский проспект',
    'Лесопарковая', 'Лихоборы', 'Локомотив', 'Ломоносовский проспект', 'Лубянка',
    'Люблино', 'Марксистская', 'Марьина роща', 'Марьино', 'Маяковская', 'Медведково',
    'Международная', 'Менделеевская', 'Митино', 'Мичуринский проспект', 'Молодёжная',
    'Мякинино', 'Нагатинская', 'Нагорная', 'Нахимовский проспект', 'Некрасовка',
    'Новогиреево', 'Новокосино', 'Новокузнецкая', 'Новопеределкино', 'Новослободская',
    'Новоясеневская', 'Новые Черёмушки', 'Окружная', 'Октябрьская', 'Октябрьское поле',
    'Орехово', 'Отрадное', 'Охотный ряд', 'Павелецкая', 'Панфиловская', 'Парк культуры',
    'Парк Победы', 'Партизанская', 'Первомайская', 'Перово', 'Петровско-Разумовская',
    'Печатники', 'Пионерская', 'Планерная', 'Площадь Ильича', 'Площадь Революции',
    'Полежаевская', 'Полянка', 'Пражская', 'Преображенская площадь', 'Пролетарская',
    'Проспект Вернадского', 'Проспект Мира', 'Профсоюзная', 'Пушкинская', 'Пятницкое шоссе',
    'Раменки', 'Рассказовка', 'Рижская', 'Римская', 'Румянцево', 'Рязанский проспект',
    'Савёловская', 'Саларьево', 'Свиблово', 'Севастопольская', 'Селигерская', 'Семёновская',
    'Серпуховская', 'Славянский бульвар', 'Смоленская', 'Сокол', 'Сокольники', 'Спартак',
    'Спортивная', 'Сретенский бульвар', 'Строгино', 'Студенческая', 'Сухаревская', 'Сходненская',
    'Таганская', 'Тверская', 'Театральная', 'Текстильщики', 'Тёплый стан', 'Тимирязевская',
    'Третьяковская', 'Тропарёво', 'Трубная', 'Тульская', 'Тургеневская', 'Тушинская',
    'Улица 1905 года', 'Улица Академика Янгеля', 'Улица Горчакова', 'Улица Дмитриевского',
    'Улица Милашенкова', 'Улица Скобелевская', 'Улица Старокачаловская', 'Университет',
    'Филатов луг', 'Фили', 'Фонвизинская', 'Фрунзенская', 'Ховрино', 'Хорошёво',
    'Хорошёвская', 'Царицыно', 'Цветной бульвар', 'Черкизовская', 'Чертановская',
    'Чеховская', 'Чистые пруды', 'Чкаловская', 'Шаболовская', 'Шипиловская', 'Шоссе Энтузиастов',
    'Щёлковская', 'Щукинская', 'Электрозаводская', 'Юго-Западная', 'Южная', 'Ясенево'
  ],
  'Санкт-Петербург': [
    'Автово', 'Адмиралтейская', 'Академическая', 'Балтийская', 'Бухарестская', 'Василеостровская',
    'Владимирская', 'Волковская', 'Выборгская', 'Горьковская', 'Гостиный двор', 'Гражданский проспект',
    'Девяткино', 'Достоевская', 'Елизаровская', 'Звёздная', 'Звенигородская', 'Кировский завод',
    'Комендантский проспект', 'Крестовский остров', 'Купчино', 'Ладожская', 'Ленинский проспект',
    'Лесная', 'Лиговский проспект', 'Ломоносовская', 'Маяковская', 'Международная', 'Московская',
    'Московские ворота', 'Нарвская', 'Невский проспект', 'Новочеркасская', 'Обводный канал',
    'Обухово', 'Озерки', 'Парк Победы', 'Парнас', 'Петроградская', 'Пионерская', 'Площадь Александра Невского',
    'Площадь Восстания', 'Площадь Ленина', 'Политехническая', 'Приморская', 'Пролетарская',
    'Проспект Большевиков', 'Проспект Ветеранов', 'Проспект Просвещения', 'Пушкинская',
    'Рыбацкое', 'Садовая', 'Сенная площадь', 'Спасская', 'Спортивная', 'Старая Деревня',
    'Технологический институт', 'Удельная', 'Улица Дыбенко', 'Фрунзенская', 'Чёрная речка',
    'Чернышевская', 'Чкаловская', 'Шушары', 'Электросила'
  ]
}

export default function ManualAddressInfo({
  district,
  metro,
  onDistrictChange,
  onMetroChange,
  city,
  className = "",
  disabled = false
}: ManualAddressInfoProps) {
  const [districtInput, setDistrictInput] = useState(district)
  const [metroInput, setMetroInput] = useState(metro)
  const [showDistrictSuggestions, setShowDistrictSuggestions] = useState(false)
  const [showMetroSuggestions, setShowMetroSuggestions] = useState(false)
  const [filteredDistricts, setFilteredDistricts] = useState<string[]>([])
  const [filteredMetro, setFilteredMetro] = useState<string[]>([])

  const currentCity = city || 'Москва'
  const availableDistricts = CITY_DISTRICTS[currentCity] || []
  const availableMetro = CITY_METRO[currentCity] || []

  useEffect(() => {
    setDistrictInput(district)
  }, [district])

  useEffect(() => {
    setMetroInput(metro)
  }, [metro])

  const handleDistrictChange = (value: string) => {
    setDistrictInput(value)
    onDistrictChange(value)
    
    if (value.length > 0) {
      const filtered = availableDistricts.filter(d => 
        d.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredDistricts(filtered)
      setShowDistrictSuggestions(true)
    } else {
      setShowDistrictSuggestions(false)
    }
  }

  const handleMetroChange = (value: string) => {
    setMetroInput(value)
    onMetroChange(value)
    
    if (value.length > 0) {
      const filtered = availableMetro.filter(m => 
        m.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredMetro(filtered)
      setShowMetroSuggestions(true)
    } else {
      setShowMetroSuggestions(false)
    }
  }

  const selectDistrict = (selectedDistrict: string) => {
    setDistrictInput(selectedDistrict)
    onDistrictChange(selectedDistrict)
    setShowDistrictSuggestions(false)
  }

  const selectMetro = (selectedMetro: string) => {
    setMetroInput(selectedMetro)
    onMetroChange(selectedMetro)
    setShowMetroSuggestions(false)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Район города */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Район города
        </label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={districtInput}
              onChange={(e) => handleDistrictChange(e.target.value)}
              onFocus={() => {
                if (districtInput.length > 0) {
                  setShowDistrictSuggestions(true)
                }
              }}
              placeholder="Введите район города"
              disabled={disabled}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
            {districtInput && (
              <button
                type="button"
                onClick={() => {
                  setDistrictInput('')
                  onDistrictChange('')
                  setShowDistrictSuggestions(false)
                }}
                disabled={disabled}
                className="px-2 py-2 text-gray-400 hover:text-gray-600 disabled:text-gray-300"
                title="Очистить"
              >
                ✕
              </button>
            )}
          </div>
          
          {showDistrictSuggestions && filteredDistricts.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {filteredDistricts.map((district, index) => (
                <div
                  key={index}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => selectDistrict(district)}
                >
                  {district}
                </div>
              ))}
            </div>
          )}
          
          {!districtInput && (
            <div className="text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <span>ℹ️</span>
                <span>Введите район города для {currentCity}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ближайшее метро */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ближайшее метро
        </label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={metroInput}
              onChange={(e) => handleMetroChange(e.target.value)}
              onFocus={() => {
                if (metroInput.length > 0) {
                  setShowMetroSuggestions(true)
                }
              }}
              placeholder="Введите станцию метро"
              disabled={disabled}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            />
            {metroInput && (
              <button
                type="button"
                onClick={() => {
                  setMetroInput('')
                  onMetroChange('')
                  setShowMetroSuggestions(false)
                }}
                disabled={disabled}
                className="px-2 py-2 text-gray-400 hover:text-gray-600 disabled:text-gray-300"
                title="Очистить"
              >
                ✕
              </button>
            )}
          </div>
          
          {showMetroSuggestions && filteredMetro.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {filteredMetro.map((metro, index) => (
                <div
                  key={index}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => selectMetro(metro)}
                >
                  {metro}
                </div>
              ))}
            </div>
          )}
          
          {!metroInput && (
            <div className="text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <span>ℹ️</span>
                <span>Введите станцию метро для {currentCity}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
