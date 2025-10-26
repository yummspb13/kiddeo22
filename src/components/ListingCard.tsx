'use client';

import Link from 'next/link';

type Props = {
  slug: string;
  title: string;
  subtitle?: string;
  badge?: string;
  priceFrom?: number | null;
};

export default function ListingCard({ slug, title, subtitle, badge, priceFrom }: Props) {
  return (
    <Link
      href={`/listing/${slug}`}
      className="group block overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md"
    >
      {/* cover-заглушка */}
      <div className="relative h-40 w-full bg-gradient-to-br from-violet-200 to-fuchsia-200">
        <div className="absolute inset-0 flex items-center justify-center text-white/80">
          <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">изображение</span>
        </div>
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-slate-700">
            {badge}
          </span>
        )}
      </div>

      <div className="space-y-1 p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-slate-900 group-hover:underline">
          {title}
        </h3>
        {subtitle && <p className="line-clamp-2 text-sm text-slate-600">{subtitle}</p>}
        {typeof priceFrom === 'number' && (
          <div className="pt-1 text-sm font-semibold text-slate-800">
            от {priceFrom.toLocaleString('ru-RU')} ₽
          </div>
        )}
      </div>
    </Link>
  );
}
