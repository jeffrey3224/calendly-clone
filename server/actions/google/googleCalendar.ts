"use server"

import { clerkClient } from "@clerk/nextjs/server"
import { addMinutes, endOfDay, startOfDay } from "date-fns"
import { calendar_v3, google } from "googleapis"

async function getOAuthClient(clerkUserId: string) {
  try {
    const client = await clerkClient()

    const { data } = await client.users.getUserOauthAccessToken(clerkUserId, 'google')

    if (data.length === 0 || !data[0].token) {
      throw new Error("No Oauth data or toekn found for the user.")
    }

    const oAuthClient = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URL
    )

    oAuthClient.setCredentials({ access_token: data[0].token })

    return oAuthClient
  } catch(err: any) {
    
    throw new Error(`Failed to get OAuth client: ${err.message}`)
  }
}

export async function getCalendarEventTimes(
  clerkUserId: string,
  { start, end }: { start: Date; end: Date }
): Promise<{ start: Date; end: Date }[]> {

  try {
      const oAuthClient = await getOAuthClient(clerkUserId)

      if (!oAuthClient) {
      throw new Error("OAuth client could not be obtained.")
      }

      const events = await google.calendar("v3").events.list({
          calendarId: "primary", 
          eventTypes: ["default"], 
          singleEvents: true, 
          timeMin: start.toISOString(),
          timeMax: end.toISOString(), 
          maxResults: 2500, 
          auth: oAuthClient, 
      })

      return (
          events.data.items
          ?.map(event => {
              if (event.start?.date && event.end?.date) {
              return {
                  start: startOfDay(new Date(event.start.date)), 
                  end: endOfDay(new Date(event.end.date)),       
              }
              }

              if (event.start?.dateTime && event.end?.dateTime) {
              return {
                  start: new Date(event.start.dateTime), 
                  end: new Date(event.end.dateTime), 
              }
              }
      
              return undefined
          })
          .filter((date): date is { start: Date; end: Date } => date !== undefined) || []
      )  

  } catch (err: any) {
      throw new Error(`Failed to fetch calendar events: ${err.message || err}`)

  }

}

export async function createCalendarEvent({
  clerkUserId,
  guestName,
  guestEmail,
  startTime,
  guestNotes,
  durationInMinutes,
  eventName,
}: {
  clerkUserId: string 
  guestName: string 
  guestEmail: string 
  startTime: Date 
  guestNotes?: string | null 
  durationInMinutes: number 
  eventName: string 
}): Promise<calendar_v3.Schema$Event> {  
  
  try {
    const oAuthClient = await getOAuthClient(clerkUserId)
    if (!oAuthClient) {
      throw new Error("OAuth client could not be obtained.") 
    }

    const client = await clerkClient() 
    const calendarUser = await client.users.getUser(clerkUserId) 
    const primaryEmail = calendarUser.emailAddresses.find(
      ({ id }) => id === calendarUser.primaryEmailAddressId 
    )

    if (!primaryEmail) {
      throw new Error("Clerk user has no email") 
    }

    const calendarEvent = await google.calendar("v3").events.insert({
      calendarId: "primary", 
      auth: oAuthClient,
      sendUpdates: "all",
      requestBody: {
        attendees: [
          { email: guestEmail, displayName: guestName }, 
          {
            email: primaryEmail.emailAddress, 
            displayName: `${calendarUser.firstName} ${calendarUser.lastName}`, 
            responseStatus: "accepted",
          },
        ],
        description: guestNotes ? `Additional Details: ${guestNotes}` : "No additional details.", 
        start: {
          dateTime: startTime.toISOString(), 
        },
        end: {
          dateTime: addMinutes(startTime, durationInMinutes).toISOString(), 
        },
        summary: `${guestName} + ${calendarUser.firstName} ${calendarUser.lastName}: ${eventName}`,
      },
    })

    return calendarEvent.data  
  } catch (error: any) {
    
    console.error("Error creating calendar event:", error.message || error) 
    throw new Error(`Failed to create calendar event: ${error.message || error}`) 
  }
}