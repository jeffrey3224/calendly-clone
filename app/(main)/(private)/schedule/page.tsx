import { ScheduleForm } from "@/components/forms/ScheduleForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSchedule } from "@/server/actions/schedule"
import { auth } from "@clerk/nextjs/server"


export default async function SchedulePage() {
    const { userId, redirectToSignIn } = await auth()
    if (!userId) return redirectToSignIn() 
  const schedule = await getSchedule(userId)

    return (
            <Card className="max-w-[800px] mx-auto border-8 border-blue-200 shadow-2xl mb-10">
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
          )


}