import Link from 'next/link';

type Props = {
  citySlug: string;
};

export default function HomeServices({ citySlug }: Props) {
  const services = [
    {
      id: 'popular',
      title: 'Популярные услуги',
      description: 'Самые востребованные предложения',
      icon: '⭐',
      href: `/city/${citySlug}/cat/services?filter=popular`,
      color: 'from-yellow-400 to-orange-500',
      count: '25+'
    },
    {
      id: 'new',
      title: 'Новинки',
      description: 'Свежие предложения от партнеров',
      icon: '✨',
      href: `/city/${citySlug}/cat/services?filter=new`,
      color: 'from-purple-400 to-pink-500',
      count: '12+'
    },
    {
      id: 'discounts',
      title: 'Скидки',
      description: 'Выгодные предложения',
      icon: '💰',
      href: `/city/${citySlug}/cat/services?filter=discounts`,
      color: 'from-green-400 to-emerald-500',
      count: '18+'
    },
    {
      id: 'nearby',
      title: 'Рядом с вами',
      description: 'Услуги в вашем районе',
      icon: '📍',
      href: `/city/${citySlug}/cat/services?filter=nearby`,
      color: 'from-blue-400 to-cyan-500',
      count: '30+'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 font-unbounded">Популярные услуги</h2>
          <p className="text-gray-600 text-lg">Выберите из проверенных предложений</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Link
              key={service.id}
              href={service.href}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`h-48 bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                <div className="text-center text-white">
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 font-unbounded">{service.title}</h3>
                  <p className="text-white/90 text-sm mb-3">{service.description}</p>
                  <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {service.count}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href={`/city/${citySlug}/cat/services`}
            className="inline-flex items-center justify-center px-8 py-4 rounded-full text-white font-semibold shadow-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 transition-all transform hover:scale-105"
          >
            Посмотреть все услуги
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
