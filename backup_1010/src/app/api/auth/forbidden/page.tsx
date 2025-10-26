// src/app/auth/forbidden/page.tsx
export default function Forbidden() {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="w-full max-w-lg border rounded-xl p-6 text-center">
          <h1 className="font-bold text-xl mb-2">Доступ запрещён</h1>
          <p className="opacity-70">
            У вашей роли нет прав на просмотр этой страницы. Обратитесь к администратору.
          </p>
        </div>
      </div>
    )
  }

  