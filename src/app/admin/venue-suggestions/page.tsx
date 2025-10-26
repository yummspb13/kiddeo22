import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import VenueSuggestionsClient from './VenueSuggestionsClient';

export default async function VenueSuggestionsPage() {
  // Получаем все предложения мест
  const suggestions = await prisma.venueSuggestion.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      city: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Предложения мест
          </h1>
          <p className="text-gray-600">
            Управление предложениями новых мест от пользователей
          </p>
        </div>

        <VenueSuggestionsClient initialSuggestions={suggestions} />
      </div>
    </div>
  );
}
