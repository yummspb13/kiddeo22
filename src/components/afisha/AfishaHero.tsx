import Link from "next/link";

type Ad = { imageUrl: string | null; hrefUrl: string | null; title: string };
export default function AfishaHero({
  cityName,
  ad,
  children,
}: {
  cityName: string;
  ad?: Ad | null;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400">
      {/* фон баннера */}
      {ad?.imageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ backgroundImage: `url(${ad.imageUrl})` }}
        />
      ) : null}
      <div className="relative px-6 sm:px-10 py-10 sm:py-16">
        <div className="max-w-4xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            Лучшие события {cityName}
          </h1>
          <p className="mt-3 text-white/95 text-base sm:text-lg">
            Спектакли, мастер-классы, праздники и активные выходные.
          </p>
          <div className="mt-6">{children}</div>
          {ad?.hrefUrl ? (
            <Link
              href={ad.hrefUrl}
              className="inline-block mt-6 text-sm font-semibold text-white/95 underline underline-offset-4 hover:text-white"
            >
              {ad.title || "Подробнее"}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
