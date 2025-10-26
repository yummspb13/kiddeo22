// src/components/AfishaSkeleton.tsx
export default function AfishaSkeleton() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-gray-200">
            <div className="aspect-[16/9] animate-pulse bg-gray-100" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    )
  }