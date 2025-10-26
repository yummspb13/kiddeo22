// src/app/simple/page.tsx
export default function SimplePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Простая страница</h1>
      <p>Сервер работает!</p>
      <p>Время: {new Date().toLocaleString()}</p>
    </div>
  )
}
