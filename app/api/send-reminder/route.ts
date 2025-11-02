import { NextRequest, NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { getUserReminderEmail } from "@/lib/email-templates";
import { getTrackingData, updateTrackingData } from "@/lib/dynamodb";

const AWS_ACCESS_KEY_ID = process.env.NEXT_PUBLIC_ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.NEXT_PUBLIC_ACCESS_KEY_SECRET!;
const AWS_REGION = process.env.NEXT_PUBLIC_REGION!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://rented123.com";

const ses = new SESClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get tracking data
    const trackingData = await getTrackingData(sessionId);

    if (!trackingData) {
      return NextResponse.json(
        { error: "Tracking data not found" },
        { status: 404 }
      );
    }

    // Check if already sent
    if (trackingData.userReminderSent) {
      return NextResponse.json(
        { message: "Reminder already sent", skipped: true },
        { status: 200 }
      );
    }

    // Check if email is available
    if (!trackingData.email) {
      return NextResponse.json(
        { error: "No email address available for this session" },
        { status: 400 }
      );
    }

    // Generate email HTML
    const htmlContent = getUserReminderEmail(
      trackingData.name,
      sessionId,
      trackingData.step,
      BASE_URL
    );

    // Send email via SES
    const emailCommand = new SendEmailCommand({
      Source: "admin@rented123.com",
      Destination: {
        ToAddresses: [trackingData.email],
      },
      Message: {
        Subject: {
          Data: "Complete Your Rental Application - Your Progress Has Been Saved",
        },
        Body: {
          Html: {
            Data: htmlContent,
          },
        },
      },
    });

    await ses.send(emailCommand);

    // Mark as sent
    await updateTrackingData(sessionId, { userReminderSent: true });

    return NextResponse.json(
      { message: "Reminder email sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending reminder email:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
