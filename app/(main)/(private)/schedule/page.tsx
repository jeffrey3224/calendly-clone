import { ScheduleForm } from "@/components/forms/ScheduleForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSchedule } from "@/server/actions/schedule"
import { auth } from "@clerk/nextjs/server"

export default async function SchedulePage() {
  const { userId, redirectToSignIn } = await auth()
  if (!userId) return redirectToSignIn() 
  const schedule = await getSchedule(userId)

  return (
    <main className="min-h-screen flex flex-col md:flex-col justify-start md:justify-center items-center pt-3">
      <Card className="w-full sm:w-11/12 md:w-full max-w-[700px] shadow-2xl mb-10">
        <CardHeader>
          <CardTitle className="text-xl">My Availabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleForm
            schedule={
              schedule
                ? { timezone: schedule.timezone, availabilities: schedule.availabilities }
                : undefined
            }
          />
        </CardContent>
      </Card>
    </main>
  )
}
