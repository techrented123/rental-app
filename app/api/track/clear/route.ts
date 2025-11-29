import { NextRequest, NextResponse } from "next/server";
import { deleteApplicationTracking } from "@/lib/rental-tracking";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Delete tracking data from RentalApplicationTracking table
    await deleteApplicationTracking(sessionId);

    return NextResponse.json(
      { message: "Tracking data cleared successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error clearing tracking data:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
