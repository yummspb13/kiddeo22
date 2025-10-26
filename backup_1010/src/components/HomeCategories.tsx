import Link from 'next/link';
import Image from 'next/image';

type Props = {
  citySlug: string;
};

export default function HomeCategories({ citySlug }: Props) {
  const categories = [
    {
      id: 'events',
      title: 'Афиша',
      description: 'Мероприятия и события',
      icon: '🎭',
      href: `/city/${citySlug}/cat/events`,
      color: 'from-blue-500 to-purple-600',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 'venues',
      title: 'Места',
      description: 'Кафе, парки, музеи',
      icon: '🏰',
      href: `/city/${citySlug}/cat/venues`,
      color: 'from-green-500 to-teal-600',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 'parties',
      title: 'Праздники',
      description: 'Организация детских праздников',
      icon: '🎉',
      href: `/city/${citySlug}/cat/parties`,
      color: 'from-pink-500 to-rose-600',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: 'services',
      title: 'Услуги',
      description: 'Кружки, секции, репетиторы',
      icon: '🎨',
      href: `/city/${citySlug}/cat/services`,
      color: 'from-yellow-500 to-orange-600',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 font-unbounded">Выберите категорию</h2>
          <p className="text-gray-600 text-lg">Найдите то, что нужно именно вам</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div
                className="relative h-64 bg-cover bg-center"
                style={{
                  backgroundImage: `url("${category.image}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                      {category.icon.startsWith('http') ? (
                        <img
                          src={category.icon}
                          alt={category.title}
                          width={64}
                          height={64}
                          className="object-contain category-icon"
                          style={{ 
                            backgroundColor: 'transparent',
                            background: 'transparent',
                            mixBlendMode: 'normal'
                          }}
                        />
                      ) : (
                        category.icon
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2 font-unbounded">{category.title}</h3>
                    <p className="text-white/90 text-sm">{category.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
