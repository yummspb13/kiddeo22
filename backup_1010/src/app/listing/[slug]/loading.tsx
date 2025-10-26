export default function ListingLoading() {
    return (
      <div className="p-6 grid gap-6 md:grid-cols-[1fr_360px]">
        <div>
          <div className="h-64 w-full rounded-xl bg-gray-200 animate-pulse" />
          <div className="mt-4 h-6 w-2/3 rounded bg-gray-200 animate-pulse" />
          <div className="mt-2 h-4 w-full rounded bg-gray-200 animate-pulse" />
          <div className="mt-2 h-4 w-5/6 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="rounded-2xl border p-4">
          <div className="h-5 w-1/2 rounded bg-gray-200 animate-pulse" />
          <div className="mt-3 h-10 w-full rounded-lg bg-gray-200 animate-pulse" />
        </div>
      </div>
    )
  }
  