import z from "zod";
import { DAYS_OF_WEEK_IN_ORDER } from "@/constants";
import { timeToFloat } from "@/lib/utils";

const availabilitySchema = z.object({
  dayOfWeek: z.enum(DAYS_OF_WEEK_IN_ORDER),
  startTime: z
    .string()
    .regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Invalid time format",
    }),
  endTime: z
    .string()
    .regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Invalid time format",
    }),
});


export const scheduleFormSchema = z.object({
  timezone: z.string().min(1, "Required"),
  availabilities: z.array(availabilitySchema),
}).refine((data) => {
  let valid = true;

  data.availabilities.forEach((availability, index, arr) => {
    const start = timeToFloat(availability.startTime);
    const end = timeToFloat(availability.endTime);

    if (start >= end) {
      valid = false;
    }

    const overlaps = arr.some((other, i) => {
      if (i === index) return false;
      return (
        other.dayOfWeek === availability.dayOfWeek &&
        timeToFloat(other.startTime) < end &&
        timeToFloat(other.endTime) > start
      );
    });

    if (overlaps) {
      valid = false;
    }
  });

  return valid;
}, {
  message: "One or more availabilities are invalid or overlapping.",
  path: ["availabilities"], 
});
