import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import { saveTrackingData, getTrackingData } from "@/lib/dynamodb";
import type { TrackingData } from "@/lib/tracking";

// Force dynamic rendering - this route must run at request time
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Get client IP address from request headers
 */
function getClientIP(request: NextRequest): string {
  // Check various headers for IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip"); // Cloudflare

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  if (realIP) {
    return realIP;
  }

  // Fallback to localhost for development
  return "127.0.0.1";
}

/**
 * Get location from IP address
 * Uses dynamic import to avoid build issues with geoip-lite data files
 * Returns empty object if lookup fails (location is optional)
 * This function is designed to never fail during build time
 */
async function getLocationFromIP(ip: string): Promise<{
  city?: string;
  region?: string;
  country?: string;
}> {
  // Always return empty during build/static generation
  // Location lookup will work at runtime in API routes
  if (
    typeof process !== "undefined" &&
    (process.env.NEXT_PHASE === "phase-production-build" ||
      process.env.NEXT_RUNTIME === undefined)
  ) {
    return {};
  }

  try {
    // geoip-lite doesn't work with localhost/IPs
    if (
      ip === "127.0.0.1" ||
      ip === "::1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.")
    ) {
      return {};
    }

    // Dynamic import wrapped in try-catch to prevent any build-time errors
    try {
      // Use Function constructor to ensure this is truly lazy-loaded
      const geoipModule = await import("geoip-lite");
      const geoip = geoipModule.default || geoipModule;

      if (!geoip || typeof geoip.lookup !== "function") {
        return {};
      }

      const geo = geoip.lookup(ip);
      if (!geo) return {};

      return {
        city: geo.city || undefined,
        region: geo.region || undefined,
        country: geo.country || undefined,
      };
    } catch (importError) {
      // If import fails (e.g., during build), return empty
      // This is expected during build time
      return {};
    }
  } catch (error) {
    // Silently fail - location is optional
    return {};
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const trackingData = await getTrackingData(sessionId);

    if (!trackingData) {
      return NextResponse.json(
        { error: "Tracking data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      trackingData: {
        step: trackingData.step,
        lastActivity: trackingData.lastActivity,
        email: trackingData.email,
        name: trackingData.name,
        address: trackingData.address,
      },
    });
  } catch (error: any) {
    console.error("Error fetching tracking data:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const body = await req.json();

    const { step, email, name, address, property } = body;

    // Get or create session ID
    let sessionId = cookieStore.get("application_session_id")?.value;

    if (!sessionId) {
      sessionId = uuidv4();
      // Set cookie via response
      cookieStore.set("application_session_id", sessionId, {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    // Get IP and location (optional - fail silently during build/runtime)
    const ip = getClientIP(req);
    let location: { city?: string; region?: string; country?: string } = {};
    try {
      location = await getLocationFromIP(ip);
    } catch (error) {
      // Silently fail - location is optional
      console.error("Location lookup failed:", error);
    }

    // Format address - handle both object and string
    let formattedAddress: string | undefined = undefined;
    if (address) {
      if (typeof address === "string") {
        formattedAddress = address;
      } else if (typeof address === "object" && address !== null) {
        // Format as full address string
        const parts = [];
        if (address.Address) parts.push(address.Address);
        if (address.City) parts.push(address.City);
        if (address.State) parts.push(address.State);
        if (address.PostalCode) parts.push(address.PostalCode);
        formattedAddress = parts.length > 0 ? parts.join(", ") : undefined;
      }
    }

    // Prepare tracking data
    const now = Date.now();
    const trackingData: TrackingData = {
      sessionId,
      step: step ?? 0,
      lastActivity: now,
      email: email || undefined,
      source: "rental-application",
      property: property || "",
      name: name || undefined,
      address: formattedAddress,
      location: Object.keys(location).length > 0 ? location : undefined,
      ip: ip !== "127.0.0.1" ? ip : undefined,
      createdAt: now,
      userReminderSent: false,
      salesAlertSent: false,
    };

    // Save to DynamoDB
    await saveTrackingData(trackingData);

    // Return session ID and tracking data (for client-side cookie)
    return NextResponse.json(
      {
        success: true,
        sessionId,
        trackingData: {
          step: trackingData.step,
          lastActivity: trackingData.lastActivity,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error tracking activity:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
