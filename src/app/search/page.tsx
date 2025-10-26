import SearchResults from "./SearchResults"

interface SearchPageProps {
  searchParams: {
    q?: string
    ai?: string
    city?: string
    category?: string
    type?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  // Временная заглушка для демонстрации
  const mockUser = {
    id: 1,
    name: "Демо пользователь",
    email: "demo@example.com",
    image: null
  }

  return <SearchResults searchParams={searchParams} user={mockUser} />
}
