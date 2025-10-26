import Link from "next/link";
import { getServerSession  } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function VendorHome() {
  const session = await getServerSession();
  const uid = session?.user?.id;
  if (!uid) redirect("/?login=true");

  const vendor = await prisma.vendor.findFirst({
    where: { userId: uid },
    select: {
      id: true,
      canPostEvents: true,
      canPostCatalog: true,
    },
  });

  if (!vendor) redirect("/vendor/onboarding");

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2">
        <Panel title="Быстрые действия">
          <div className="flex flex-wrap gap-2">
            <Action href="/vendor/listings?create=event">+ Мероприятие (Афиша)</Action>
            <Action href="/vendor/listings?create=service">+ Услуга</Action>
            <Action href="/vendor/listings?create=venue">+ Площадка</Action>
            <Action href="/vendor/leads">Открыть лиды</Action>
          </div>
        </Panel>

        <Panel title="Доступы">
          <ul className="text-sm text-slate-700 list-disc list-inside">
            <li>Афиша: {vendor.canPostEvents ? "доступно" : "нет доступа"}</li>
            <li>Каталог: {vendor.canPostCatalog ? "доступно" : "нет доступа"}</li>
          </ul>
        </Panel>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Panel title="Подсказки ИИ (скоро)">
          <p className="text-sm text-slate-600">
            Рекомендации по повышению конверсии листингов на основе поведенческих данных.
          </p>
        </Panel>

        <Panel title="Продажи / аналитика (скоро)">
          <p className="text-sm text-slate-600">
            Диаграммы продаж билетов, отказов и конверсий по воронке.
          </p>
        </Panel>
      </section>
    </>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="font-medium">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Action({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
    >
      {children}
    </Link>
  );
}
