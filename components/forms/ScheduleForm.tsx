"use client";

import { Fragment } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { DAYS_OF_WEEK_IN_ORDER } from "@/constants";
import { Button } from "../ui/button";
import { X, Plus, Trash2 } from "lucide-react";
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
        <div key={day} className="mt-4 max-w-[450px]">
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
              <Plus size={16} className="" />
            </Button>
          </div>
          

          {fields.map((field, index) =>
            field.dayOfWeek === day ? (
              <div
                key={field.id}
                className="flex flex-wrap items-start justify-between gap-2 border p-2 rounded mb-2 group hover:cursor-pointer"
              >
                <div id="time-block" className="flex flex-col items-start space-x-5">
                  {/* Start Time */}
                  <div className="flex flex-col w-50 pb-3">
                    <label htmlFor={`availabilities.${index}.startTime`} className="text-[.7rem] text-gray-500 pb-1">Start</label>
                    <input
                      type="time"
                      {...register(`availabilities.${index}.startTime`, {
                        required: "Start time required",
                      })}
                      className={`border rounded p-1 w-full hover:cursor-pointer ${
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

                  {/* End Time */}
                  <div className="flex flex-row w-50 pb-5">
                    <div className="flex flex-col w-full">
                      <label htmlFor={`availabilities.${index}.endTime`} className="text-[.7rem] text-gray-500 pb-1">End</label>
                      <input
                        type="time"
                        {...register(`availabilities.${index}.endTime`, {
                          required: "End time required",
                        })}
                        className={`border rounded p-1 w-full hover:cursor-pointer ${
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
                  </div>
                

                  {/* Remove */}
                  <button type="button" className="flex justify-center items-center bg-red-800 w-28 rounded-sm h-8 duration-200 cursor-pointer text-sm text-white " aria-label={`Delete availability for ${day}`} onClick={() => remove(index)}>
                    <Trash2 size={15} color="white" className="mr-2"/>
                    Delete 
                  </button>
                </div>

                {/*
                <Button
                  type="button"
                  variant="destructive"
                  className="cursor-pointer hover:scale-110 duration-500 h-full"
                  onClick={() => remove(index)}
                >
                </Button>
                */}
              
              </div>
            ) : null
          )}

          {/* Add Button for This Day */}
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
