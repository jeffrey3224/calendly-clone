"use server"

import { db } from "@/drizzle/db"
import { ScheduleAvailabilityTable, ScheduleTable } from "@/drizzle/schema"

type ScheduleRow = typeof ScheduleTable.$inferSelect
type AvailabilityRow = typeof ScheduleAvailabilityTable.$inferSelect

export type FullSchedule = ScheduleRow & {
  availabilities: AvailabilityRow[]
}

export async function getSchedule(userId: string): Promise<FullSchedule | null> {

  const schedule = await db.query.ScheduleTable.findFirst({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),

    with: {
      availabilities: true,
    },
  })

  return schedule as FullSchedule | null
}