import { NextRequest, NextResponse } from "next/server";
import { saveApplicationStep, getApplicationTracking } from "@/lib/rental-tracking";

export const dynamic = "force-dynamic";

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

        const trackingData = await getApplicationTracking(sessionId);

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
                email: trackingData.email,
                property: trackingData.property,
                signature: trackingData.signature,
                verification_report_url: trackingData.verification_report_url,
                data: trackingData.data,
                rentalInfo: trackingData.rentalInfo,
                createdAt: trackingData.createdAt,
                updatedAt: trackingData.updatedAt,
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
        const body = await req.json();
        const { email, step, property, sessionId, data, signature, verification_report_url, rentalInfo } = body;


        if (!email && !sessionId) {
            return NextResponse.json(
                { error: "Email is required for new sessions" },
                { status: 400 }
            );
        }

        await saveApplicationStep({
            sessionId,
            email,
            step: step || 0,
            property,
            data,
            signature,
            verification_report_url,
            rentalInfo,
        });

        console.log("Tracking API success for:", email);

        return NextResponse.json(
            { success: true, message: "Application tracking started" },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error tracking application:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
