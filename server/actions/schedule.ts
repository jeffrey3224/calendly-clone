"use server"

import { db } from "@/drizzle/db"
import { ScheduleAvailabilityTable, ScheduleTable } from "@/drizzle/schema"
import { scheduleFormSchema } from "@/schema/schedule"
import { z } from "zod"
import { auth } from "@clerk/nextjs/server"
import { BatchItem } from "drizzle-orm/batch"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { addMinutes, areIntervalsOverlapping, interval, isFriday, isMonday, isSaturday, isSunday, isThursday, isTuesday, isWednesday, isWithinInterval, setHours, setMinutes } from "date-fns"
import { DAYS_OF_WEEK_IN_ORDER } from "@/constants"
import { fromZonedTime } from "date-fns-tz"
import { getCalendarEventTimes } from "./google/googleCalendar"

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

export type ScheduleInput = {
  timezone: string;
  availabilities: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
};

export async function saveSchedule(
  unsafeData: z.infer<typeof scheduleFormSchema>
) {
  console.log("saveSchedule called with:", unsafeData);
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    // Validate input
    const parsed = scheduleFormSchema.safeParse(unsafeData);
    if (!parsed.success) {
      throw new Error("Invalid schedule data");
    }
    const { timezone, availabilities } = parsed.data;

    // Insert or update schedule row
    const [{ id: scheduleId }] = await db
      .insert(ScheduleTable)
      .values({
        clerkUserId: userId,
        timezone, // <-- pass validated timezone string here
      })
      .onConflictDoUpdate({
        target: ScheduleTable.clerkUserId,
        set: {
          timezone, // update timezone on conflict
        },
      })
      .returning({ id: ScheduleTable.id });

    // Delete old availabilities for this schedule
    await db
      .delete(ScheduleAvailabilityTable)
      .where(eq(ScheduleAvailabilityTable.scheduleId, scheduleId));

    // Insert new availabilities if any
    if (availabilities.length > 0) {
      await db.insert(ScheduleAvailabilityTable).values(
        availabilities.map((a) => ({
          scheduleId,
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
        }))
      );
    }

  } catch (error: any) {
    throw new Error(`Failed to save schedule: ${error.message}`);
  } finally {
    revalidatePath("/schedule");
  }
}

export async function getValidTimesFromSchedule(
  timesInOrder: Date[],
  event: { clerkUserId: string; durationInMinutes: number}
) : Promise<Date[]> {

    const { clerkUserId: userId, durationInMinutes } = event

    const start = timesInOrder[0]
    const end = timesInOrder.at(-1)

    if (!start || !end) return []

    const schedule = await getSchedule(userId)

    if (schedule == null) return []

    const groupedAvailabilities = Object.groupBy(
      schedule.availabilities,
      a => a.dayOfWeek
    )

    const eventTimes = await getCalendarEventTimes(userId, {
      start,
      end,
    })
    return timesInOrder.filter(intervalDate => {
      const availabilities = getAvailabilities(
        groupedAvailabilities,
        intervalDate,
        schedule.timezone
      )

      const eventInterval = {
        start: intervalDate, 
        end: addMinutes(intervalDate, durationInMinutes),
      }

      return (
        eventTimes.every(eventTime => {
          return !areIntervalsOverlapping(eventTime, eventInterval)
        }) && 
        availabilities.some(availability => {
          return (
            isWithinInterval(eventInterval.start, availability) &&
            isWithinInterval(eventInterval.end, availability)
          )
        })
      )
    })
}

function getAvailabilities(
  groupedAvailabilities: Partial<
    Record<
      (typeof DAYS_OF_WEEK_IN_ORDER)[number],
      (typeof ScheduleAvailabilityTable.$inferSelect)[]
    >
  >,
  date: Date,
  timezone: string
): { start: Date; end: Date }[] {

  const dayOfWeek = (() => {
    if (isMonday(date)) return "monday"
    if (isTuesday(date)) return "tuesday"
    if (isWednesday(date)) return "wednesday"
    if (isThursday(date)) return "thursday"
    if (isFriday(date)) return "friday"
    if (isSaturday(date)) return "saturday"
    if (isSunday(date)) return "sunday"
    return null 
  })()

  if (!dayOfWeek) return []

  const dayAvailabilities = groupedAvailabilities[dayOfWeek]

  if (!dayAvailabilities) return []

  return dayAvailabilities.map(({ startTime, endTime }) => {
    const [startHour, startMinute] = startTime.split(":").map(Number)

    const [endHour, endMinute] = endTime.split(":").map(Number)

    const start = fromZonedTime(
      setMinutes(setHours(date, startHour), startMinute),
      timezone
    )

    const end = fromZonedTime(
      setMinutes(setHours(date, endHour), endMinute),
      timezone
    )
    return { start, end } 
  })
}