'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type Quick = { label: string; query: Record<string, string> };

export default function HeroAfisha({
  cityName,
  citySlug,
  quickFilters,
}: {
  cityName: string;
  citySlug: string;
  quickFilters: Quick[];
}) {
  const sp = useSearchParams();

  const buildHref = (q: Record<string, string>) => {
    const p = new URLSearchParams(sp.toString());
    // очистим пагинацию при быстром фильтре
    p.delete('page');
    for (const [k, v] of Object.entries(q)) {
      if (v === '') p.delete(k);
      else p.set(k, v);
    }
    return `/city/${citySlug}/cat/events?` + p.toString();
  };

  return (
    <section className="container pb-4 pt-2">
      <div className="rounded-3xl bg-gradient-to-r from-violet-500 to-fuchsia-500 p-8 text-white md:p-12">
        <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
          Лучшие события&nbsp;вашего города
        </h1>
        <p className="mt-2 max-w-2xl text-white/90">
          Афиша мероприятий для детей и всей семьи — {cityName}.
        </p>

        {/* Быстрые фильтры */}
        <div className="mt-4 flex flex-wrap gap-2">
          {quickFilters.map((q, i) => (
            <Link
              key={i}
              href={buildHref(q.query)}
              className="rounded-full bg-white/95 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-white"
            >
              {q.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
