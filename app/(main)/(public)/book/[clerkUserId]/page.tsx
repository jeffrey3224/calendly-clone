import PublicProfile from "@/components/PublicProfile"
import { clerkClient } from "@clerk/nextjs/server"


export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ clerkUserId: string }>
}) {
  const { clerkUserId } = await params
  const client = await clerkClient()
  const user = await client.users.getUser(clerkUserId)
  const { fullName } = user // 
  
  return <PublicProfile userId={clerkUserId} fullName={fullName} />
}