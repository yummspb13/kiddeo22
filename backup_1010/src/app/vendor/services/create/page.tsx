import { redirect } from 'next/navigation'

export default function CreateServicePage() {
  // Пока что перенаправляем на создание мест
  // В будущем здесь будет отдельная форма для услуг
  redirect('/vendor/venues/create')
}
