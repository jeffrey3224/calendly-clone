import PrivateNavBar from "@/components/PrivateNavBar";
import PublicNavBar from "@/components/PublicNavBar";
import { currentUser } from "@clerk/nextjs/server"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await currentUser();

  return(
    <main className="relative">
      {user ? <PrivateNavBar /> : <PublicNavBar />}
    <section className="pt-24 md:pt-36 px-5 md:px-7 bg-gradient-to-r from-blue-100 to-blue-200 min-h-screen">
      {children}
    </section>
  </main>
  )
  
}