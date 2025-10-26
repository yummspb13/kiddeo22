export default function RootLoading() {
    return (
      <div className="p-6">
        <div className="h-7 w-56 rounded bg-gray-200 animate-pulse" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border p-4">
              <div className="h-40 w-full rounded-lg bg-gray-200 animate-pulse" />
              <div className="mt-3 h-5 w-3/4 rounded bg-gray-200 animate-pulse" />
              <div className="mt-2 h-4 w-1/2 rounded bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  