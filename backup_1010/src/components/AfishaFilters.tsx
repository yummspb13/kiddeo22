'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function AfishaFilters() {
  const sp = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [date, setDate] = useState(sp.get('date') ?? 'any');
  const [age, setAge] = useState(sp.get('age') ?? 'any');
  const [price, setPrice] = useState(sp.get('price') ?? 'any');
  const [q, setQ] = useState(sp.get('q') ?? '');

  const update = useMemo(
    () => (next: Partial<Record<string, string>>) => {
      const p = new URLSearchParams(sp.toString());
      // сбрасываем страницу при изменении
      p.delete('page');
      for (const [k, v] of Object.entries(next)) {
        if (!v || v === 'any' || v === '') p.delete(k);
        else p.set(k, v);
      }
      replace(`${pathname}?${p.toString()}`);
    },
    [sp, pathname, replace]
  );

  useEffect(() => {
    setDate(sp.get('date') ?? 'any');
    setAge(sp.get('age') ?? 'any');
    setPrice(sp.get('price') ?? 'any');
    setQ(sp.get('q') ?? '');
  }, [sp]);

  return (
    <div className="container">
      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border bg-white p-3">
        {/* Дата */}
        <select
          value={date}
          onChange={(e) => {
            const v = e.target.value;
            setDate(v);
            update({ date: v });
          }}
          className="rounded-xl border bg-white px-3 py-2 text-sm"
          aria-label="Дата"
        >
          <option value="any">Любая дата</option>
          <option value="today">Сегодня</option>
          <option value="tomorrow">Завтра</option>
          <option value="weekend">В эти выходные</option>
          <option value="next7">Следующие 7 дней</option>
        </select>

        {/* Возраст */}
        <select
          value={age}
          onChange={(e) => {
            const v = e.target.value;
            setAge(v);
            update({ age: v });
          }}
          className="rounded-xl border bg-white px-3 py-2 text-sm"
          aria-label="Возраст"
        >
          <option value="any">Любой возраст</option>
          <option value="0-3">0–3</option>
          <option value="4-7">4–7</option>
          <option value="8-12">8–12</option>
          <option value="13-17">13–17</option>
        </select>

        {/* Цена */}
        <select
          value={price}
          onChange={(e) => {
            const v = e.target.value;
            setPrice(v);
            update({ price: v });
          }}
          className="rounded-xl border bg-white px-3 py-2 text-sm"
          aria-label="Цена"
        >
          <option value="any">Любая цена</option>
          <option value="free">Бесплатно</option>
          <option value="lt1000">До 1000 ₽</option>
          <option value="1000-3000">1000–3000 ₽</option>
          <option value="gt3000">От 3000 ₽</option>
        </select>

        {/* Поиск */}
        <div className="ml-auto flex w-full items-center gap-2 sm:w-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') update({ q });
            }}
            placeholder="Поиск по названию"
            className="w-full rounded-xl border px-3 py-2 text-sm sm:w-64"
          />
          <button
            onClick={() => update({ q })}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Найти
          </button>
        </div>
      </div>
    </div>
  );
}
