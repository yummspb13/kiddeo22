"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

export type QuickItem = {
  label: string;
};

export default function QuickFilters({ items }: { items: QuickItem[] }) {
  const sp = useSearchParams();
  const pathname = usePathname();
  const active = sp.get("qf") || "";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const isActive = active === it.label;
        const url = new URLSearchParams(sp.toString());
        url.set("qf", it.label);
        return (
          <Link
            key={it.label}
            href={`${pathname}?${url.toString()}`}
            className={[
              "px-3 py-1.5 rounded-full text-sm font-medium border backdrop-blur",
              isActive
                ? "bg-white text-slate-900 border-white shadow-sm"
                : "bg-white/15 text-white border-white/30 hover:bg-white/25",
            ].join(" ")}
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}
