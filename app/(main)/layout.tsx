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
    <section className="pt-36 px-5 md:px-7">
      {children}
    </section>
    
  </main>
  )
  
}