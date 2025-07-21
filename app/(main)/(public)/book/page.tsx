"use client"

import Loading from "@/components/Loading";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function PublicPage() {
  const {user, isLoaded } = useUser()

  if (!isLoaded) {
    return <Loading />
  }

  if (!user) {
    return redirect('/login')
  }

  return redirect(`/book/${user.id}`)
}