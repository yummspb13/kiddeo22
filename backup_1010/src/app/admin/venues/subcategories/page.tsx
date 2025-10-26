import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { VenueSubcategoriesClient } from "./VenueSubcategoriesClient";

export const dynamic = "force-dynamic";

export default async function SubcategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const key = sp.key;

  // Проверяем ключ админа
  if (key !== "kidsreview2025") {
    redirect("/?login=true");
  }

  // Получаем все подкатегории с категориями
  const subcategories = await prisma.venueSubcategory.findMany({
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { category: { name: "asc" } },
      { name: "asc" },
    ],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Подкатегории мест</h1>
          <p className="text-sm text-gray-600">
            Управление подкатегориями с фоновыми изображениями
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href={`/admin/venues/categories?key=kidsreview2025`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к Категориям
          </Link>
        </div>
      </div>

      <VenueSubcategoriesClient />
    </div>
  );
}