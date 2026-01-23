'use client'

import { getPublicEvents, PublicEvent } from "@/server/actions/events"
import { useEffect, useState } from "react"
import Loading from "./Loading"
import { Copy, Eye } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { Button } from "./ui/button"
import { toast } from "sonner"
import PublicEventCard from "./PublicEventCard"

// Define types for the props that PublicProfile component will receive
type PublicProfileProps = {
    userId: string // The user ID for the profile
    fullName: string | null // User's full name
  }


  export default function PublicProfile({ userId, fullName }: PublicProfileProps) {

    // State to store events and loading state
    const [events, setEvents] = useState<PublicEvent[] | null>(null)
    const {user} = useUser()


  const copyProfileUrl = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/book/${userId}`)
      toast("Profile URL copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy URL:", error)
    }
  }
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await getPublicEvents(userId) 
        setEvents(fetchedEvents)
      } catch (error) {
        console.error("Error fetching events:", error)
        setEvents([]) 
      }
    }

    fetchEvents() 
  }, [userId]) 

    if (events === null) {
        return (
          <div className="max-w-5xl mx-auto text-center">
            <Loading />
          </div>
        )
      }

    return (
        <div className="mx-auto pb-10">
                {user?.id === userId && (
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-4 font-bold">
                    <Eye className="w-4 h-4" />
                    <p className="text-[.7rem] md:text-sm">This is how people will see your public profile</p>
                </div>
                )}
            <div className="text-4xl md:text-5xl md:text-5xl font-black mb-4 text-center">
                {fullName}
            </div>

            {user?.id === userId && (
                <div className="flex justify-center mb-6">
                <Button
                    className="cursor-pointer"
                    variant={"outline"}
                    onClick={copyProfileUrl}
                >
                    <Copy className="size-4" />
                    Copy Public Profile URL
                </Button>
                </div>
            )}

            <div className="text-gray-700 mb-6 max-w-md mx-auto text-center">
                <p className="font-black text-2xl">
                Time to meet!
                </p>
                <p className="w-full font-bold">Pick an event and let’s make it official by booking a time.</p>
            </div>

            {events.length === 0 ? (
                <div className="text-center text-muted-foreground">
                No events available at the moment.
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-7 mx-auto 2xl:grid-cols-6">
                {events.map((event) => (
                    <PublicEventCard key={event.id} {...event} />
                ))}
                </div>
            )}


        </div>
    )
    

  }