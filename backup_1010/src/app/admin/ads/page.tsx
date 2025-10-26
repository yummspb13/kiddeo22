import prisma from '@/lib/db';

async function upsertAd(formData: FormData) {
  'use server';
  const id = formData.get('id')?.toString();
  const cityId = formData.get('cityId')?.toString() || '';
  const position = formData.get('position')?.toString() || 'HERO_BELOW';
  const title = formData.get('title')?.toString() || '';
  const imageUrl = formData.get('imageUrl')?.toString() || '';
  const hrefUrl = formData.get('hrefUrl')?.toString() || '';
  const startsAt = formData.get('startsAt')?.toString() || '';
  const endsAt = formData.get('endsAt')?.toString() || '';
  const order = Number(formData.get('order')?.toString() || '0');
  const isActive = formData.get('isActive') === 'on';

  const data = {
    page: 'afisha',
    cityId: cityId ? Number(cityId) : null,
    position: position as string,
    title,
    imageUrl: imageUrl || null,
    hrefUrl: hrefUrl || null,
    startsAt: startsAt ? new Date(startsAt) : null,
    endsAt: endsAt ? new Date(endsAt) : null,
    order,
    isActive,
  };

  if (id) {
    await prisma.adPlacement.update({ where: { id: Number(id) }, data });
  } else {
    await prisma.adPlacement.create({ data });
  }
}

async function deleteAd(formData: FormData) {
  'use server';
  const id = Number(formData.get('id')?.toString() || '0');
  if (id) await prisma.adPlacement.delete({ where: { id } });
}

export default async function AdsPage() {
  const cities = await prisma.city.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  const ads = await prisma.adPlacement.findMany({
    where: { page: 'afisha' },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  });

  const positions = ['HERO_BELOW', 'GRID_TOP', 'GRID_MIDDLE', 'SIDEBAR'];

  return (
    <div className="container space-y-6 py-6">
      <h1 className="text-2xl font-bold">Рекламные места (Афиша)</h1>

      <form action={upsertAd} className="space-y-3 rounded-2xl border bg-white p-4">
        <div className="text-lg font-semibold">Добавить баннер</div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Город (опционально)</span>
            <select name="cityId" className="rounded-xl border bg-white px-3 py-2">
              <option value="">Все города</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Позиция</span>
            <select name="position" className="rounded-xl border bg-white px-3 py-2">
              {positions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Заголовок</span>
            <input name="title" required className="rounded-xl border px-3 py-2" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Ссылка (href)</span>
            <input name="hrefUrl" className="rounded-xl border px-3 py-2" />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Картинка (URL)</span>
            <input name="imageUrl" className="rounded-xl border px-3 py-2" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-600">Начало показа</span>
              <input name="startsAt" type="datetime-local" className="rounded-xl border px-3 py-2" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-600">Окончание показа</span>
              <input name="endsAt" type="datetime-local" className="rounded-xl border px-3 py-2" />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Порядок</span>
            <input name="order" type="number" defaultValue={0} className="rounded-xl border px-3 py-2" />
          </label>

          <label className="mt-1 flex items-center gap-2">
            <input name="isActive" type="checkbox" defaultChecked className="size-4" />
            <span className="text-sm">Активен</span>
          </label>
        </div>

        <div className="pt-2">
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-white">Сохранить</button>
        </div>
      </form>

      <div className="rounded-2xl border bg-white p-4">
        <div className="mb-3 text-lg font-semibold">Текущие баннеры</div>
        <div className="divide-y">
          {ads.map((a) => (
            <div key={a.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-slate-500">
                  {a.position} • order {a.order} • active: {String(a.isActive)}
                </div>
                {a.imageUrl && (
                  <div className="text-xs text-slate-500">
                    img: <span className="break-all">{a.imageUrl}</span>
                  </div>
                )}
                {a.hrefUrl && (
                  <div className="text-xs text-slate-500">
                    link: <span className="break-all">{a.hrefUrl}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <form action={deleteAd}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50">Удалить</button>
                </form>
              </div>
            </div>
          ))}
          {ads.length === 0 && <div className="py-4 text-sm text-slate-500">Пока пусто</div>}
        </div>
      </div>
    </div>
  );
}
