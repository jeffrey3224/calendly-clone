'use server'

import { db } from "@/drizzle/db";
import { EventTable } from "@/drizzle/schema";
import { eventFormSchema } from "@/schema/events";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import z from "zod";



export async function createEvent(
    unsafeData: z.infer<typeof eventFormSchema>
  ): Promise<void> {
    try {

      const { userId } = await auth()
      const { success, data } = eventFormSchema.safeParse(unsafeData)
  
      if (!success || !userId) {
        throw new Error("Invalid event data or user not authenticated.")
      }

      await db.insert(EventTable).values({ ...data, clerkUserId: userId })
     
      
    } catch (error: any) {
      throw new Error(`Failed to create event: ${error.message || error}`)
    } 

    revalidatePath('/events')
  }


export async function updateEvent(
  id: string,
  unsafeData: z.infer<typeof eventFormSchema>
): Promise<void> {
  try {

    const { userId } = await auth()

    const { success, data } = eventFormSchema.safeParse(unsafeData)

    if (!success || !userId) {
      throw new Error("invalid event data or user not authenticated.")
    }

    const { rowCount } = await db
    .update(EventTable)
    .set({...data})
    .where(and(eq(EventTable.id, id), eq(EventTable.clerkUserId, userId)))

    if (rowCount === 0) {
      throw new Error("Event not found or user not authorized to update this event.")
    }
  }

  catch (error: any) {
    throw new Error(`Failed to create event: ${error.message || error}`)
  }
    revalidatePath('/events')

}

export async function deleteEvent(
  id: string
): Promise<void> {
  try {
    const { userId } = await auth()

    if (!userId) {
      throw new Error("user not authenticated.")
    }

    const { rowCount } = await db
    .delete(EventTable)
    .where(and(eq(EventTable.id, id), eq(EventTable.clerkUserId, userId)))

    if (rowCount === 0) {
      throw new Error("Event not found or user not authorized to update this event.")
    }
  }

  catch (error: any) {
    throw new Error(`Failed to delete event: ${error.message || error}`)
  }
    revalidatePath('/events')

}

type EventRow = typeof EventTable.$inferSelect

export async function getEvents(clerkUserId: string): Promise<EventRow[]> {
  const events = await db.query.EventTable.findMany({

    where: ({ clerkUserId: userIdCol }, { eq }) => eq(userIdCol, clerkUserId),

    orderBy: ({ name }, { asc, sql }) => asc(sql`lower(${name})`),
  })

    return events

}
