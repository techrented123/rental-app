import { NextRequest, NextResponse } from "next/server";
import { getAllIncompleteApplications } from "@/lib/dynamodb";

const USER_REMINDER_HOURS = 2; // Send reminder after 2 hours
const SALES_ALERT_HOURS = 24; // Send sales alert after 24 hours

/**
 * Check for incomplete applications and send appropriate emails
 * This endpoint should be called by AWS EventBridge every 30 minutes
 */
export async function GET(req: NextRequest) {
  try {
    // Optional: Add authentication/authorization check
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.SCHEDULED_JOB_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = Date.now();
    const userReminderThreshold = now - USER_REMINDER_HOURS * 60 * 60 * 1000;
    const salesAlertThreshold = now - SALES_ALERT_HOURS * 60 * 60 * 1000;

    // Get all incomplete applications
    const applications = await getAllIncompleteApplications();

    const results = {
      checked: applications.length,
      userRemindersSent: 0,
      salesAlertsSent: 0,
      skipped: {
        alreadyNotified: 0,
        noEmail: 0,
        tooRecent: 0,
      },
      errors: [] as string[],
    };

    // Process each application
    for (const app of applications) {
      // Convert ISO string to timestamp for calculations
      const lastActivityTimestamp = new Date(app.lastActivity).getTime();
      const hoursInactive = (now - lastActivityTimestamp) / (1000 * 60 * 60);

      try {
        // Check for sales alert (24+ hours)
        if (
          lastActivityTimestamp <= salesAlertThreshold &&
          !app.salesAlertSent
        ) {
          const response = await fetch(
            `${req.nextUrl.origin}/api/send-sales-alert`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ sessionId: app.sessionId }),
            }
          );

          if (response.ok) {
            results.salesAlertsSent++;
          } else {
            const data = await response.json();
            if (data.skipped) {
              results.skipped.alreadyNotified++;
            } else {
              results.errors.push(
                `Sales alert failed for ${app.sessionId}: ${
                  data.error || "Unknown error"
                }`
              );
            }
          }
        }

        // Check for user reminder (2+ hours, but less than 24 hours to avoid duplicates)
        if (
          lastActivityTimestamp <= userReminderThreshold &&
          lastActivityTimestamp > salesAlertThreshold &&
          !app.userReminderSent &&
          app.email // Only send if we have an email
        ) {
          const response = await fetch(
            `${req.nextUrl.origin}/api/send-reminder`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ sessionId: app.sessionId }),
            }
          );

          if (response.ok) {
            results.userRemindersSent++;
          } else {
            const data = await response.json();
            if (data.skipped) {
              results.skipped.alreadyNotified++;
            } else if (data.error?.includes("email")) {
              results.skipped.noEmail++;
            } else {
              results.errors.push(
                `User reminder failed for ${app.sessionId}: ${
                  data.error || "Unknown error"
                }`
              );
            }
          }
        } else if (lastActivityTimestamp > userReminderThreshold) {
          results.skipped.tooRecent++;
        } else if (!app.email) {
          results.skipped.noEmail++;
        }
      } catch (error: any) {
        results.errors.push(
          `Error processing ${app.sessionId}: ${error.message}`
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        results,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error checking incomplete applications:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Also allow POST for EventBridge webhooks
export async function POST(req: NextRequest) {
  return GET(req);
}
