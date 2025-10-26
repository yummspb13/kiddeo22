# Hydration Reports

Эта директория содержит отчеты о проверке hydration mismatch на страницах сайта.

## Запуск проверки

```bash
npm run check-hydration
```

## Структура отчета

- `hydration-report-YYYY-MM-DDTHH-mm-ss.json` - JSON отчет с детальной информацией
- `summary.json` - Краткая сводка последней проверки

## Интерпретация результатов

- `hasHydrationMismatch: true` - на странице обнаружены hydration ошибки
- `status: "error"` - ошибка загрузки страницы
- `hydrationErrors` - количество ошибок hydration в консоли
- `pageErrors` - количество ошибок на странице

## Исправление проблем

1. Используйте `HydrationBoundary` для обертки проблемных компонентов
2. Избегайте использования `window`, `document`, `localStorage` в server components
3. Используйте `useEffect` для клиентской логики
4. Проверяйте `typeof window !== 'undefined'` перед использованием браузерных API
