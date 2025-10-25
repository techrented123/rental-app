import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import { NextRequest, NextResponse } from "next/server";

const AWS_ACCESS_KEY_ID = process.env.NEXT_PUBLIC_ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.NEXT_PUBLIC_ACCESS_KEY_SECRET!;
const AWS_REGION = process.env.NEXT_PUBLIC_REGION!;

const ses = new SESClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req: NextRequest) {
  try {
    const {
      landlordName,
      landlordEmail,
      applicationFormPDF,
      verificationReportPDF,
    } = await req.json();
    if (!landlordName || !landlordEmail || !applicationFormPDF) {
      return NextResponse.json({
        error: "Missing landlordName, landlordEmail, or applicationFormPDF",
        status: 400,
      });
    }

    // 1) Convert Base64 to Buffer
    /*   const pdfBuffer = Buffer.from(mergedPDF, "base64"); */

    // 2) Build raw MIME
    const boundary = "----=_MergedPdfBoundary123";
    const newline = "\r\n";
    const rawLines: string[] = [];

    // Email headers
    rawLines.push(
      `From: "Rented123 Property Management" <admin@rented123.com>`
    );
    rawLines.push(`To: tambi@rented123.com`);
    rawLines.push(`Subject: Rental Application for Your Property`);
    rawLines.push(`MIME-Version: 1.0`);
    rawLines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    rawLines.push("");

    // Part 1: HTML body with beautiful styling
    rawLines.push(`--${boundary}`);
    rawLines.push(`Content-Type: text/html; charset="UTF-8"`);
    rawLines.push(`Content-Transfer-Encoding: 7bit`);
    rawLines.push("");
    rawLines.push(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rental Application</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #32429B 0%, #4A5CC7 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">New Rental Application</h1>
    <p style="color: #E8EAF6; margin: 10px 0 0 0; font-size: 16px;">Rented123 Property Management</p>
  </div>
  
  <!-- Main Content -->
  <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 18px; margin-bottom: 20px;">Hello <strong>${landlordName}</strong>,</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Great news! A prospective tenant has submitted a complete rental application for your property. 
      The application includes all necessary documentation and verification reports.
    </p>
    
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #32429B; margin: 25px 0;">
      <h3 style="color: #32429B; margin: 0 0 15px 0; font-size: 18px;">📋 Application Package Includes:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;"><strong>Application Form:</strong> Complete tenant information and rental history</li>
        <li style="margin-bottom: 8px;"><strong>Verification Report:</strong> Identity and background verification documents</li>
      </ul>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Please review the attached documents carefully. All information has been verified through our secure platform.
    </p>
    
    <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 25px 0;">
      <p style="margin: 0; color: #065f46; font-weight: 500;">
        💡 <strong>Next Steps:</strong> Contact the applicant directly to schedule a property viewing or discuss any questions you may have.
      </p>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      If you have any questions about this application or need assistance, please don't hesitate to reach out to our support team.
    </p>
    
    <p style="font-size: 16px; margin-bottom: 0;">
      Best regards,<br>
      <strong>The Rented123 Team</strong>
    </p>
  </div>
  
  <!-- Footer -->
  <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin: 0; color: #6b7280; font-size: 14px;">
      This email was sent by Rented123 Property Management System<br>
      <span style="color: #9ca3af;">© ${new Date().getFullYear()} Rented123. All rights reserved.</span>
    </p>
  </div>
  
</body>
</html>`);
    rawLines.push("");

    // Part 2: Application Form PDF Attachment
    rawLines.push(`--${boundary}`);
    rawLines.push(`Content-Type: application/pdf; name="application_form.pdf"`);
    rawLines.push(
      `Content-Disposition: attachment; filename="application_form.pdf"`
    );
    rawLines.push(`Content-Transfer-Encoding: base64`);
    rawLines.push("");

    // Break the Application Form PDF's Base64 into 76-character lines (RFC 2045)
    const appFormChunked = applicationFormPDF.match(/.{1,76}/g) || [];
    rawLines.push(...appFormChunked);
    rawLines.push("");

    // Part 3: Verification Report PDF Attachment (if available)
    if (verificationReportPDF) {
      rawLines.push(`--${boundary}`);
      rawLines.push(
        `Content-Type: application/pdf; name="verification_report.pdf"`
      );
      rawLines.push(
        `Content-Disposition: attachment; filename="verification_report.pdf"`
      );
      rawLines.push(`Content-Transfer-Encoding: base64`);
      rawLines.push("");

      // Break the Verification Report PDF's Base64 into 76-character lines
      const verificationChunked = verificationReportPDF.match(/.{1,76}/g) || [];
      rawLines.push(...verificationChunked);
      rawLines.push("");
    }

    // Closing boundary
    rawLines.push(`--${boundary}--`);
    rawLines.push("");

    const rawMessage = rawLines.join(newline);
    const rawBuffer: any = Buffer.from(rawMessage, "utf-8");

    // 3) Send via SES
    const sendCmd = new SendRawEmailCommand({
      RawMessage: { Data: rawBuffer },
    });
    const result = await ses.send(sendCmd);
    console.log("Email sent successfully:", result);
    return NextResponse.json({ message: "Email sent" }, { status: 200 });
  } catch (error: any) {
    console.error("Send-application error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
