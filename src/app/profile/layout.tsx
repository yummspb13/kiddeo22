import ProfileLayoutClient from "./ProfileLayoutClient"
import ProtectedProfile from "@/components/ProtectedProfile"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedProfile>
      <ProfileLayoutClient>{children}</ProfileLayoutClient>
    </ProtectedProfile>
  )
}
