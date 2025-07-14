"use client"

import { DAYS_OF_WEEK_IN_ORDER } from "@/constants"
import { scheduleFormSchema } from "@/schema/schedule"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, useForm } from "react-hook-form"
import z from "zod"
import { timeToFloat } from "@/lib/utils"


type Availability = {
  startTime: string
  endTime: string
  dayOfWeek: (typeof DAYS_OF_WEEK_IN_ORDER[number])
}

export function ScheduleForm({
  schedule,
}: {
  schedule?: {
    timezone: string
    availabilties: Availability[]
  }
}) {

  const form = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      timezone: 
        schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        availabilities: schedule?.availabilties.toSorted((a,b) => {
          return timeToFloat(a.startTime) - timeToFloat(b.startTime)
        }),
    },
  })


  return (
    <Form{...form}>
      <form>
        {form.formState.errors.root && (
          <div className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </div>
        )}
      </form>
    </Form>
  )
}