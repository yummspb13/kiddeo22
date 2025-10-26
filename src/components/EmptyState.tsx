export default function EmptyState({
    title = 'Пока пусто',
    hint,
  }: { title?: string; hint?: string }) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center text-slate-600">
        <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-slate-100" />
        <div className="text-lg font-semibold text-slate-800">{title}</div>
        {hint && <div className="mt-1 text-sm text-slate-500">{hint}</div>}
      </div>
    );
  }
  