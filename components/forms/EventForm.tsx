'use client'

import { eventFormSchema, EventFormValues } from "@/schema/events"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useTransition } from "react";
import Link from "next/link";
import { createEvent, deleteEvent, updateEvent } from "@/server/actions/events";
import { useRouter } from "next/navigation";


export default function EventForm({event}: {
  event?: {
    id: string
    name: string
    description?: string
    durationInMinutes: number
    isActive: boolean
  }
}) {

  const [isDeletePending, startDeleteTransition] = useTransition();
  const router = useRouter()

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema), // Validate with Zod schema
    defaultValues: event
    ? {
        // If `event` is provided (edit mode), spread its existing properties as default values
        ...event,
        description: event.description ?? '',
      }
      : {
        // If `event` is not provided (create mode), use these fallback defaults
        isActive: true,             // New events are active by default
        durationInMinutes: 30,      // Default duration is 30 minutes
        description: '',            // Ensure controlled input: default to empty string
        name: '',                   // Ensure controlled input: default to empty string
      },

})

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    const action = event == null ? createEvent : updateEvent.bind(null, event.id)

    try {
      await action(values)
      router.push('/events')
    }

    catch (error: any) {
      form.setError("root", {
        message: `There was an error saving your event ${error.message}`
      })
    }
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-6 flex-col"
      >
        {form.formState.errors.root && (
          <div className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </div>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                  <Input {...field} />
              </FormControl>
              <FormDescription>The name users will see when booking</FormDescription>
              <FormMessage />
            </FormItem>
          )}
       />

        <FormField
                control={form.control}
                name="durationInMinutes"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>In minutes</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
          />

          <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                        <Textarea className="resize-none h-32" {...field} />
                    </FormControl>
                    <FormDescription>
                        Optional description of the event
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
          />

          <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                    <FormItem>
                    <div className="flex items-center gap-2">
                        <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                        </FormControl>
                        <FormLabel>Active</FormLabel>
                    </div>
                    <FormDescription>
                        Inactive events will not be visible for users to book
                    </FormDescription>
                    </FormItem>
                )}
            />

            <div className="flex gap-2 justify-end">
              {event && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="cursor-pointer hover:scale-105 hover:bg-red-700"
                      variant="destructive"
                      disabled={isDeletePending || form.formState.isSubmitting}
                    >
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this event.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                      className="bg-red-500 hover:bg-red-700 cursor-pointer"
                      onClick={()=>{
                        startDeleteTransition(async () => {
                          try {
                            await deleteEvent(event.id)
                            router.push('/events')
                          }
                          catch (error: any) {
                            form.setError("root", {
                              message: `there was an error deleting your event ${error.message}`,
                            })
                          }
                        })
                      }}>Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <Button
                disabled={isDeletePending || form.formState.isSubmitting}
                type="button"
                asChild
                variant="outline"
              >
                <Link href="/events">Cancel</Link>
              </Button>

              <Button 
                className="cursor-pointer hover:scale-105 bg-blue-400 hover:bg-blue-600"
                disabled={isDeletePending || form.formState.isSubmitting}
                type="submit"
              >
                Save
              </Button>
            </div>


        </form>
    </Form>
  )
}