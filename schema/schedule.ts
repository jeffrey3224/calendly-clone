import { DAYS_OF_WEEK_IN_ORDER } from "@/constants";
import { timeToFloat } from "@/lib/utils";
import * as z from "zod";

export const scheduleFormSchema = z
  .object({
    timezone: z.string().min(1, "Required"),
    availabilities: z.array(
      z.object({
        dayOfWeek: z.enum(DAYS_OF_WEEK_IN_ORDER),
        startTime: z
          .string()
          .regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in the format HH:MM"),
        endTime: z
          .string()
          .regex(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in the format HH:MM"),
      })
    ).default([]),
  })
  .superRefine(({ availabilities }, ctx) => {
    if (!Array.isArray(availabilities)) {
      ctx.addIssue({
        code: "custom",
        message: "Availabilities must be an array",
        path: ["availabilities"],
      });
      return;
    }

    for (let index = 0; index < availabilities.length; index++) {
      const availability = availabilities[index];
      const start = timeToFloat(availability.startTime);
      const end = timeToFloat(availability.endTime);

      if (start >= end) {
        ctx.addIssue({
          code: "custom",
          message: "End time must be after start time",
          path: ["availabilities", index, "endTime"],
        });
      }

      const overlaps = availabilities.some((a, i) => {
        if (i === index || a.dayOfWeek !== availability.dayOfWeek) return false;
        const otherStart = timeToFloat(a.startTime);
        const otherEnd = timeToFloat(a.endTime);
        return otherStart < end && otherEnd > start;
      });

      if (overlaps) {
        ctx.addIssue({
          code: "custom",
          message: "Availability overlaps with another entry",
          path: ["availabilities", index, "startTime"],
        });
      }
    }
  });
