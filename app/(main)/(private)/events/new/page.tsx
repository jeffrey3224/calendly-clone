import Eventform from "@/components/forms/EventForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


export default function NewEventPage() {
return (
  <main className="pb-10">
    <Card className="max-w-md mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle>New Event</CardTitle>
      </CardHeader>

      <CardContent>
        <Eventform />
      </CardContent>
    </Card>
  </main>
)

}