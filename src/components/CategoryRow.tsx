import Link from 'next/link'

const cats = [
  { slug:'quests', name:'Квесты' },
  { slug:'animators', name:'Аниматоры' },
  { slug:'cakes', name:'Торты' },
  { slug:'decor', name:'Декораторы' },
  { slug:'photographers', name:'Фотографы' },
  { slug:'musicians', name:'Музыканты' },
  { slug:'catering', name:'Кейтеринг' },
]

export default function CategoryRow({ citySlug }: { citySlug: string }) {
  return (
    <section className="section">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Популярные категории праздников</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
          {cats.map(c=>(
            <Link key={c.slug} href={`/city/${citySlug}/cat/${c.slug}`} className="card py-4 text-center">
              <div className="text-gray-900 font-medium">{c.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
