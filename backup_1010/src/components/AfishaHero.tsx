// src/components/AfishaHero.tsx
'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { useMemo } from 'react';

type QuickFilter = {
  id: number;
  slug: string;
  title: string;
};

export default function AfishaHero({
  cityName,
  filters,
  selected,
}: {
  cityName: string;
  filters: QuickFilter[];
  selected?: string | null;
}) {
  const search = useSearchParams();
  const pathname = usePathname();

  const links = useMemo(() => {
    return filters.map((f) => {
      const params = new URLSearchParams(search?.toString() ?? '');
      if (selected === f.slug) {
        // повторный клик — снимаем фильтр
        params.delete('qf');
      } else {
        params.set('qf', f.slug);
      }
      return {
        slug: f.slug,
        title: f.title,
        href: `${pathname}?${params.toString()}`,
        active: selected === f.slug,
      };
    });
  }, [filters, pathname, search, selected]);

  return (
    <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-rose-50 via-white to-indigo-50 p-6 sm:p-10">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
        Лучшие события вашего города
      </h1>
      <p className="mt-2 text-gray-600">
        Сейчас в&nbsp;{cityName}: афиша мероприятий, билеты и спецпредложения.
      </p>

      {/* Быстрые фильтры */}
      <div className="mt-6 flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.slug}
            href={l.href}
            className={[
              'rounded-full border px-4 py-2 text-sm transition',
              l.active
                ? 'bg-black text-white border-black'
                : 'bg-white hover:bg-gray-50',
            ].join(' ')}
          >
            {l.title}
          </Link>
        ))}
      </div>
    </section>
  );
}
