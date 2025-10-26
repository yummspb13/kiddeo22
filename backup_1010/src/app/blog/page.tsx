import { Unbounded } from 'next/font/google';
import Link from 'next/link';

const unbounded = Unbounded({ subsets: ['latin', 'cyrillic'] });

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: 'Как выбрать идеальный детский праздник',
      excerpt: 'Полное руководство по организации незабываемого дня рождения для вашего ребенка',
      author: 'Анна Петрова',
      date: '15 января 2025',
      readTime: '5 мин',
      category: 'Праздники',
      image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      featured: true
    },
    {
      id: 2,
      title: 'Топ-10 мест для семейного отдыха в Москве',
      excerpt: 'Лучшие парки, музеи и развлекательные центры для детей всех возрастов',
      author: 'Михаил Соколов',
      date: '12 января 2025',
      readTime: '7 мин',
      category: 'Места',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      featured: false
    },
    {
      id: 3,
      title: 'Развивающие кружки: что выбрать для ребенка',
      excerpt: 'Как подобрать кружок или секцию, которые понравятся вашему ребенку',
      author: 'Елена Волкова',
      date: '10 января 2025',
      readTime: '6 мин',
      category: 'Образование',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      featured: false
    },
    {
      id: 4,
      title: 'Безопасность детей в общественных местах',
      excerpt: 'Практические советы для родителей о том, как обеспечить безопасность ребенка',
      author: 'Дмитрий Козлов',
      date: '8 января 2025',
      readTime: '4 мин',
      category: 'Безопасность',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      featured: false
    },
    {
      id: 5,
      title: 'Сезонные активности для детей зимой',
      excerpt: 'Идеи для активного отдыха с детьми в холодное время года',
      author: 'Ольга Морозова',
      date: '5 января 2025',
      readTime: '5 мин',
      category: 'Активности',
      image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      featured: false
    },
    {
      id: 6,
      title: 'Как привить ребенку любовь к чтению',
      excerpt: 'Практические советы для развития читательского интереса у детей',
      author: 'Татьяна Иванова',
      date: '3 января 2025',
      readTime: '6 мин',
      category: 'Развитие',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      featured: false
    }
  ];

  const categories = ['Все', 'Праздники', 'Места', 'Образование', 'Безопасность', 'Активности', 'Развитие'];

  return (
    <div className={`${unbounded.className} min-h-screen bg-white`}>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">Блог KidsReview</h1>
          <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
            Полезные статьи, советы и рекомендации для родителей
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Categories Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  category === 'Все'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Рекомендуем к прочтению</h2>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <div
                  className="h-64 md:h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url("${blogPosts[0].image}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                ></div>
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    {blogPosts[0].category}
                  </span>
                  <span className="text-gray-500 text-sm">{blogPosts[0].readTime}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">{blogPosts[0].title}</h3>
                <p className="text-gray-600 mb-6">{blogPosts[0].excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">АП</span>
                    </div>
                    <div>
                      <div className="font-medium">{blogPosts[0].author}</div>
                      <div className="text-sm text-gray-500">{blogPosts[0].date}</div>
                    </div>
                  </div>
                  <Link
                    href={`/blog/${blogPosts[0].id}`}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Читать
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post) => (
            <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div
                className="h-48 bg-cover bg-center"
                style={{
                  backgroundImage: `url("${post.image}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                    {post.category}
                  </span>
                  <span className="text-gray-500 text-xs">{post.readTime}</span>
                </div>
                <h3 className="text-lg font-bold mb-3 line-clamp-2">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{post.author}</div>
                      <div className="text-xs text-gray-500">{post.date}</div>
                    </div>
                  </div>
                  <Link
                    href={`/blog/${post.id}`}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Читать →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full hover:bg-gray-200 transition-colors font-medium">
            Загрузить еще
          </button>
        </div>
      </main>
    </div>
  );
}
