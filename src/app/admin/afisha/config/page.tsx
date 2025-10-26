import prisma from '@/lib/db';

async function upsertFilter(formData: FormData) {
  'use server';
  const id = formData.get('id')?.toString();
  const cityId = formData.get('cityId')?.toString() || '';
  const label = formData.get('label')?.toString() || '';
  const queryJsonStr = formData.get('queryJson')?.toString() || '{}';
  const order = Number(formData.get('order')?.toString() || '0');
  const isActive = formData.get('isActive') === 'on';

  let queryJson: unknown = {};
  try {
    queryJson = JSON.parse(queryJsonStr || '{}');
  } catch {
    throw new Error('queryJson должен быть валидным JSON');
  }

  if (id) {
    await prisma.quickFilter.update({
      where: { id: Number(id) },
      data: {
        cityId: cityId ? Number(cityId) : null,
        label,
        queryJson: queryJson as any,
        order,
        isActive,
      },
    });
  } else {
    await prisma.quickFilter.create({
      data: {
        page: 'afisha',
        cityId: cityId ? Number(cityId) : null,
        label,
        queryJson: queryJson as any,
        order,
        isActive,
      },
    });
  }
}

async function deleteFilter(formData: FormData) {
  'use server';
  const id = Number(formData.get('id')?.toString() || '0');
  if (id) await prisma.quickFilter.delete({ where: { id } });
}

export default async function AfishaConfigPage() {
  const cities = await prisma.city.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  const filters = await prisma.quickFilter.findMany({
    where: { page: 'afisha' },
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
  });

  return (
    <div className="container space-y-6 py-6">
      <h1 className="text-2xl font-bold">Афиша → быстрые фильтры</h1>

      {/* форма создания */}
      <form action={upsertFilter} className="space-y-3 rounded-2xl border bg-white p-4">
        <div className="text-lg font-semibold">Добавить фильтр</div>

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
            <span className="text-sm text-slate-600">Метка</span>
            <input name="label" required className="rounded-xl border px-3 py-2" />
          </label>

          <label className="sm:col-span-2 flex flex-col gap-1">
            <span className="text-sm text-slate-600">
              JSON запроса (например: {"{ \"date\": \"weekend\" }"})
            </span>
            <textarea
              name="queryJson"
              required
              rows={4}
              defaultValue={'{ "date": "weekend" }'}
              className="rounded-xl border px-3 py-2 font-mono text-sm"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Порядок</span>
            <input name="order" type="number" defaultValue={0} className="rounded-xl border px-3 py-2" />
          </label>

          <label className="flex items-center gap-2">
            <input name="isActive" type="checkbox" defaultChecked className="size-4" />
            <span className="text-sm">Активен</span>
          </label>
        </div>

        <div className="pt-2">
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-white">Сохранить</button>
        </div>
      </form>

      {/* список */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="mb-3 text-lg font-semibold">Текущие фильтры</div>
        <div className="divide-y">
          {filters.map((f) => (
            <div key={f.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="font-medium">{f.label}</div>
                <div className="text-xs text-slate-500">order: {f.order} • active: {String(f.isActive)}</div>
                <pre className="overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-700">
                  {JSON.stringify(f.queryJson, null, 2)}
                </pre>
              </div>

              <div className="flex items-center gap-2">
                <form action={deleteFilter}>
                  <input type="hidden" name="id" value={f.id} />
                  <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50">Удалить</button>
                </form>
              </div>
            </div>
          ))}

          {filters.length === 0 && <div className="py-4 text-sm text-slate-500">Пока пусто</div>}
        </div>
      </div>
    </div>
  );
}
