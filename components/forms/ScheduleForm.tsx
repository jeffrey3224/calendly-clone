"use client";

import { Fragment } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { DAYS_OF_WEEK_IN_ORDER } from "@/constants";
import { Button } from "../ui/button";
import { X, Plus, Trash2 } from "lucide-react";
import { saveSchedule } from "@/server/actions/schedule";
import { toast } from "sonner";

type Availability = {
  dayOfWeek: (typeof DAYS_OF_WEEK_IN_ORDER)[number];
  startTime: string;
  endTime: string;
};

type FormValues = {
  timezone: string;
  availabilities: Availability[];
};

export function ScheduleForm({
  schedule,
}: {
  schedule?: {
    timezone: string;
    availabilities: Availability[];
  };
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    mode: "onTouched",
    shouldUnregister: false,
    defaultValues: {
      timezone:
        schedule?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
      availabilities: schedule?.availabilities ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "availabilities",
  });

  function onSubmit(data: FormValues) {
    console.log("Submit data:", data);
    saveSchedule(data);
    toast("Your availability has been updated!");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Timezone */}
      <div>
        <label htmlFor="timezone" className="block font-semibold mb-1">
          Timezone
        </label>
        <select
          id="timezone"
          {...register("timezone", { required: "Timezone is required" })}
          className={`border rounded p-2 w-full ${
            errors.timezone ? "border-red-600" : "border-gray-300"
          }`}
        >
          {Intl.supportedValuesOf("timeZone").map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
        {errors.timezone && (
          <p className="text-red-600 text-sm mt-1">{errors.timezone.message}</p>
        )}
      </div>

      {/* Grouped Inputs */}
      {DAYS_OF_WEEK_IN_ORDER.map((day) => (
        <div key={day} className="mt-4">
          <div className="flex flex-row w-full justify-start space-x-3 items-center mb-3">
            <h3 className="font-semibold capitalize">{day}</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-10 cursor-pointer"
              onClick={() =>
                append({
                  dayOfWeek: day,
                  startTime: "",
                  endTime: "",
                })
              }
            >
              <Plus size={16} />
            </Button>
          </div>

          {fields.map(
            (field, index) =>
              field.dayOfWeek === day && (
                <div key={field.id} className="border p-3 rounded mb-2 group">
                  <div className="inline-flex flex-wrap items-end gap-2">
                    {/* Start */}
                    <div className="flex flex-col min-w-[150px] max-w-[225px]">
                      <label className="text-[.7rem] text-gray-500 pb-1">
                        Start
                      </label>
                      <input
                        type="time"
                        {...register(`availabilities.${index}.startTime`, {
                          required: "Start time required",
                        })}
                        className={`border rounded p-1 w-full ${
                          errors.availabilities?.[index]?.startTime
                            ? "border-red-600"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.availabilities?.[index]?.startTime && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.availabilities[index].startTime?.message}
                        </p>
                      )}
                    </div>

                    {/* End */}
                    <div className="flex flex-col min-w-[150px] max-w-[225px]">
                      <label className="text-[.7rem] text-gray-500 pb-1">End</label>
                      <input
                        type="time"
                        {...register(`availabilities.${index}.endTime`, {
                          required: "End time required",
                        })}
                        className={`border rounded p-1 w-full ${
                          errors.availabilities?.[index]?.endTime
                            ? "border-red-600"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.availabilities?.[index]?.endTime && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors.availabilities[index].endTime?.message}
                        </p>
                      )}
                    </div>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="flex items-center justify-center bg-red-800 w-28 h-8 text-sm text-white rounded-sm shrink-0 mt-2"
                    >
                      <Trash2 size={15} className="mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              )
          )}
        </div>
      ))}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 mt-6 hover:scale-105 duration-150 cursor-pointer"
      >
        Save
      </button>
    </form>
  );
}
