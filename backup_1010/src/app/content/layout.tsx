import ContentNavigation from "./ContentNavigation"

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ContentNavigation />
      <main>{children}</main>
    </div>
  )
}
