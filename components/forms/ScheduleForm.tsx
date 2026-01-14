"use client";

import { Fragment } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { DAYS_OF_WEEK_IN_ORDER } from "@/constants";
import { Button } from "../ui/button";
import { X, Plus } from "lucide-react";
import { saveSchedule } from "@/server/actions/schedule";

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
          <h3 className="font-semibold capitalize mb-2">{day}</h3>

          {fields.map((field, index) =>
            field.dayOfWeek === day ? (
              <div
                key={field.id}
                className="flex flex-wrap items-start gap-2 border p-2 rounded mb-2"
              >
                {/* Start Time */}
                <div className="flex flex-col">
                  <input
                    type="time"
                    defaultValue={field.startTime}
                    {...register(`availabilities.${index}.startTime`, {
                      required: "Start time required",
                    })}
                    className={`border rounded p-1 w-30 ${
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

                <span className="font-bold mt-1">–</span>

                {/* End Time grouped with delete button*/}
                <div className="flex flex-row">
                  <div className="flex flex-col pr-2">
                    <input
                      type="time"
                      defaultValue={field.endTime}
                      {...register(`availabilities.${index}.endTime`, {
                        required: "End time required",
                      })}
                      className={`border rounded p-1 w-30 ${
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

                  {/* Remove */}
                  <Button
                    type="button"
                    variant="destructive"
                    className="cursor-pointer hover:scale-110 duration-500 h-full"
                    onClick={() => remove(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            ) : null
          )}

          {/* Add Button for This Day */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-28 cursor-pointer"
            onClick={() =>
              append({
                dayOfWeek: day,
                startTime: "",
                endTime: "",
              })
            }
          >
            <Plus size={16} className="mr-1" />
            Add
          </Button>
        </div>
      ))}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 mt-6"
      >
        Save
      </button>
    </form>
  );
}
