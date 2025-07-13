import { z } from "zod";

export const eventFormSchema = z.object({

    name: z.string().min(1, "Required"),
  
    description: z.string().optional(),
  
    isActive: z.boolean(),
  
    durationInMinutes: z.preprocess(
      (val) => {
        if (typeof val === "string" || typeof val === "number") {
          return Number(val);
        }
        return val;
      },
      z.number()
        .int()
        .positive("Duration must be greater than 0")
        .max(720, "Duration must be less than 12 hours")
    ),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
