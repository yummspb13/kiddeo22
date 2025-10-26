import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import AfishaHero from "@/components/afisha/AfishaHero";
import QuickFilters from "@/components/afisha/QuickFilters";

type Params = { slug: string; cat: string };
type Search = { q?: string; qf?: string };

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { slug, cat } = await params;
  const sp = await searchParams;

  const city = await prisma.city.findUnique({
    where: { slug },
    select: { id: true, name: true, isPublic: true, slug: true },
  });
  if (!city || !city.isPublic) return notFound();

  // Быстрые фильтры для херо (глобальные + по городу), активные/по порядку
  const qfRows = await prisma.quickFilter.findMany({
    where: {
      page: "afisha",
      isActive: true,
      OR: [{ cityId: null }, { cityId: city.id }],
    },
    orderBy: [{ order: "asc" }, { id: "asc" }],
    select: { label: true },
  });
  const quickItems = qfRows.map((x) => ({ label: x.label }));

  // Рекламные места
  const [adCityHero, adGlobalHero] = await Promise.all([
    prisma.adPlacement.findFirst({
      where: { position: "HERO", cityId: city.id, isActive: true },
      orderBy: { order: "asc" },
      select: { title: true, imageUrl: true, hrefUrl: true },
    }),
    prisma.adPlacement.findFirst({
      where: { position: "HERO", cityId: null, isActive: true },
      orderBy: { order: "asc" },
      select: { title: true, imageUrl: true, hrefUrl: true },
    }),
  ]);
  const heroAd = adCityHero ?? adGlobalHero ?? null;

  // Построение where для листингов
  // Категория — по slug
  const category = await prisma.category.findUnique({
    where: { slug: cat },
    select: { id: true, slug: true, name: true, defaultBookingMode: true },
  });
  if (!category) return notFound();

  const baseWhere: unknown = {
    cityId: city.id,
    categoryId: category.id,
    isActive: true,
  };

  // Текстовый поиск
  if (sp.q?.trim()) {
    (baseWhere as any).OR = [
      { title: { contains: sp.q.trim(), mode: "insensitive" } },
      { description: { contains: sp.q.trim(), mode: "insensitive" } },
    ];
  }

  // Быстрые фильтры по ярлыку (label)
  switch (sp.qf) {
    case "В эти выходные":
      // Простейшая евристика: “выходн” в описании/названии
      (baseWhere as any).OR = [
        ...((baseWhere as any).OR || []),
        { title: { contains: "выходн", mode: "insensitive" } },
        { description: { contains: "выходн", mode: "insensitive" } },
      ];
      break;
    case "Сегодня":
      // Для демо — просто “сегодня” строкой
      (baseWhere as any).OR = [
        ...((baseWhere as any).OR || []),
        { title: { contains: "сегодня", mode: "insensitive" } },
        { description: { contains: "сегодня", mode: "insensitive" } },
      ];
      break;
    case "4–7 лет":
      // В будущем тут будет явная модель возрастов; сейчас — евристика
      (baseWhere as any).OR = [
        ...((baseWhere as any).OR || []),
        { title: { contains: "4", mode: "insensitive" } },
        { title: { contains: "5", mode: "insensitive" } },
        { title: { contains: "6", mode: "insensitive" } },
        { title: { contains: "7", mode: "insensitive" } },
      ];
      break;
    case "Бесплатно":
      // Когда будет ценообразование — фильтр по цене; пока — строковый триггер
      (baseWhere as any).OR = [
        ...((baseWhere as any).OR || []),
        { title: { contains: "беспл", mode: "insensitive" } },
        { description: { contains: "беспл", mode: "insensitive" } },
      ];
      break;
    default:
      break;
  }

  const listings = await prisma.listing.findMany({
    where: baseWhere,
    orderBy: [{ createdAt: "desc" }],
    take: 12,
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      address: true,
      categoryId: true,
    },
  });

  return (
    <div className="space-y-8">
      {/* ХЕРО */}
      <AfishaHero cityName={city.name} ad={heroAd}>
        <QuickFilters items={quickItems} />
      </AfishaHero>

      {/* Навигация по категориям — быстрая связка */}
      <nav className="flex gap-3 text-sm text-slate-600">
        <Link
          href={`/city/${city.slug}/cat/events`}
          className={cat === "events" ? "font-semibold text-slate-900" : "hover:text-slate-900"}
        >
          Афиша
        </Link>
        <span aria-hidden>·</span>
        <Link
          href={`/city/${city.slug}/cat/venues`}
          className={cat === "venues" ? "font-semibold text-slate-900" : "hover:text-slate-900"}
        >
          Места
        </Link>
        <span aria-hidden>·</span>
        <Link
          href={`/city/${city.slug}/cat/parties`}
          className={cat === "parties" ? "font-semibold text-slate-900" : "hover:text-slate-900"}
        >
          Праздники
        </Link>
      </nav>

      {/* Список карточек */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <Link
            key={l.id}
            href={`/listing/${l.slug}`}
            className="group rounded-2xl border bg-white hover:shadow-lg transition-shadow p-5"
          >
            <div className="aspect-[16/9] w-full rounded-xl bg-gradient-to-br from-sky-100 to-violet-100 group-hover:from-sky-200 group-hover:to-violet-200 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{l.title}</h3>
            <p className="mt-2 text-sm text-slate-600 line-clamp-3">{l.description}</p>
            {l.address ? <p className="mt-3 text-xs text-slate-500">{l.address}</p> : null}
          </Link>
        ))}
        {listings.length === 0 && (
          <div className="col-span-full rounded-xl border bg-white p-6 text-slate-600">
            По выбранным условиям ничего не найдено.
          </div>
        )}
      </section>

      {/* Inline рекламный баннер */}
      <InlineAd cityId={city.id} />
    </div>
  );
}

// Отдельно рендерим inline баннер (берём городской, иначе глобальный)
async function InlineAd({ cityId }: { cityId: number }) {
  const [cityInline, globalInline] = await Promise.all([
    prisma.adPlacement.findFirst({
      where: { position: "INLINE", cityId, isActive: true },
      orderBy: { order: "asc" },
      select: { title: true, imageUrl: true, hrefUrl: true },
    }),
    prisma.adPlacement.findFirst({
      where: { position: "INLINE", cityId: null, isActive: true },
      orderBy: { order: "asc" },
      select: { title: true, imageUrl: true, hrefUrl: true },
    }),
  ]);
  const ad = cityInline ?? globalInline ?? null;
  if (!ad) return null;
  return (
    <div className="rounded-2xl overflow-hidden border">
      <Link href={ad.hrefUrl || "#"} aria-label={ad.title}>
        <img
          src={ad.imageUrl || "/ads/inline-1.svg"}
          alt={ad.title}
          className="w-full h-auto"
          loading="lazy"
        />
      </Link>
    </div>
  );
}
