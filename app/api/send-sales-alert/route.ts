import { NextRequest, NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { getSalesNotificationEmail } from "@/lib/email-templates";
import { getTrackingData, updateTrackingData } from "@/lib/dynamodb";

const AWS_ACCESS_KEY_ID = process.env.NEXT_PUBLIC_ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.NEXT_PUBLIC_ACCESS_KEY_SECRET!;
const AWS_REGION = process.env.NEXT_PUBLIC_REGION!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://rented123.com";
const SALES_EMAILS = ["tambi@rented123.com"];

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
    if (trackingData.salesAlertSent) {
      return NextResponse.json(
        { message: "Sales alert already sent", skipped: true },
        { status: 200 }
      );
    }

    // Format address to string if it's an object
    const formattedAddress =
      typeof trackingData.address === "string"
        ? trackingData.address
        : trackingData.address && typeof trackingData.address === "object"
        ? `${trackingData.address.Address || ""}, ${
            trackingData.address.City || ""
          }, ${trackingData.address.State || ""} ${
            trackingData.address.PostalCode || ""
          }`.trim()
        : undefined;

    // Generate email HTML
    const htmlContent = getSalesNotificationEmail(
      {
        name: trackingData.name,
        email: trackingData.email,
        step: trackingData.step,
        lastActivity: trackingData.lastActivity,
        address: formattedAddress,
        property: trackingData.property,
        location: trackingData.location,
        ip: trackingData.ip,
        sessionId: trackingData.sessionId,
      },
      BASE_URL
    );

    // Send email to all sales addresses
    const emailCommand = new SendEmailCommand({
      Source: "admin@rented123.com",
      Destination: {
        ToAddresses: SALES_EMAILS,
      },
      Message: {
        Subject: {
          Data: `⚠️ Incomplete Application Alert - ${
            trackingData.name || "Unknown User"
          } - ${Math.floor(
            (Date.now() - new Date(trackingData.lastActivity).getTime()) /
              (1000 * 60 * 60)
          )} hours inactive`,
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
    await updateTrackingData(sessionId, { salesAlertSent: true });

    return NextResponse.json(
      { message: "Sales alert sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending sales alert:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
