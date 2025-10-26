import Link from 'next/link';

export default function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="mb-4 text-sm text-slate-600">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center">
            {it.href ? (
              <Link href={it.href} className="hover:underline">
                {it.label}
              </Link>
            ) : (
              <span className="text-slate-500">{it.label}</span>
            )}
            {i < items.length - 1 && <span className="mx-2 text-slate-400">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
