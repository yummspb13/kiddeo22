'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const router = useRouter();
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : false);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <main className="min-h-[70vh] container mx-auto px-4 py-16 flex flex-col items-center text-center">
      <div className="max-w-xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          Похоже, вы офлайн
        </h1>
        <p className="text-gray-600 dark:text-slate-300 mb-8">
          Страница недоступна без соединения. Как только интернет появится —
          можно обновить страницу.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={() => router.refresh()}
            className="px-5 py-2 rounded-xl bg-black text-white hover:opacity-90"
            disabled={!online}
            title={online ? 'Обновить' : 'Нет сети'}
          >
            Обновить
          </button>

          <Link
            href="/"
            className="px-5 py-2 rounded-xl border border-gray-300 hover:bg-gray-50"
          >
            На главную
          </Link>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          Статус сети: {online ? 'онлайн' : 'офлайн'}
        </div>
      </div>
    </main>
  );
}
