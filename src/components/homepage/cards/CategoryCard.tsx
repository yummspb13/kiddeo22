import Link from 'next/link';

interface CategoryCardProps {
  item: {
    id: string;
    title: string;
    slug: string;
    icon?: string;
    color?: string;
    count: number;
  };
  citySlug: string;
}

export default function CategoryCard({ item, citySlug }: CategoryCardProps) {
  // Check if icon is base64 encoded
  const isBase64 = item.icon && item.icon.startsWith('data:image');
  
  return (
    <Link href={`/city/${citySlug}/cat/venues/${item.slug}`} className="block">
      <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
        {/* Иконка */}
        <div className="flex justify-center mb-4">
          {item.icon ? (
            <div className="w-16 h-16 flex items-center justify-center">
              {isBase64 ? (
                // Render base64 image directly
                <img
                  src={item.icon}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                // Render regular image
                <img
                  src={item.icon.startsWith('http') ? item.icon : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${item.icon}`}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏷️</span>
            </div>
          )}
        </div>

        {/* Название категории */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
        </div>
      </div>
    </Link>
  );
}
