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

    // Part 1: Plain text body
    rawLines.push(`--${boundary}`);
    rawLines.push(`Content-Type: text/plain; charset="UTF-8"`);
    rawLines.push(`Content-Transfer-Encoding: 7bit`);
    rawLines.push("");
    rawLines.push(`Hello ${landlordName},`);
    rawLines.push(``);
    rawLines.push(
      `A tenant has applied for your property. Please see the attached merged application PDF.`
    );
    rawLines.push(``);
    rawLines.push(`Please reach out if you have any questions.`);
    rawLines.push(``);
    rawLines.push(`Thank you,`);
    rawLines.push(`The Rented123 Team`);
    rawLines.push("");

    // Part 2: HTML body (optional)
    rawLines.push(`--${boundary}`);
    rawLines.push(`Content-Type: text/html; charset="UTF-8"`);
    rawLines.push(`Content-Transfer-Encoding: 7bit`);
    rawLines.push("");
    rawLines.push(`<p>Hello ${landlordName},</p>`);
    rawLines.push(
      `<p>A tenant has applied for your property. Please see the attached merged application PDF.</p>`
    );
    rawLines.push(`<p>Please reach out if you have any questions.</p>`);
    rawLines.push(`<br>`);
    rawLines.push(`<p>Thank you,<br>The Rented123 Team</p>`);
    rawLines.push("");

    // Part 3: Application Form PDF Attachment
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

    // Part 4: Verification Report PDF Attachment (if available)
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
