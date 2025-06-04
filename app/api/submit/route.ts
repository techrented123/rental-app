import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";
import { NextRequest, NextResponse } from "next/server";

const AWS_ACCESS_KEY_ID = process.env.ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.ACCESS_KEY_SECRET!;
const AWS_REGION = process.env.REGION!;

const ses = new SESClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method Not Allowed" });
  }

  try {
    const { landlordName, landlordEmail, mergedPDF } = await req.json();
    if (!landlordName || !landlordEmail || !mergedPDF) {
      return NextResponse.json({
        error: "Missing landlordName, landlordEmail, or mergedPDF",
        status: 400,
      });
    }

    // 1) Convert Base64 to Buffer
    const pdfBuffer = Buffer.from(mergedPDF, "base64");

    // 2) Build raw MIME
    const boundary = "----=_MergedPdfBoundary123";
    const newline = "\r\n";
    const rawLines: string[] = [];

    // Email headers
    rawLines.push(`From: "Rented123 Property Management" <reports@rented123.com>`);
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

    // Part 3: Attachment (base64‐encoded PDF)
    rawLines.push(`--${boundary}`);
    rawLines.push(`Content-Type: application/pdf; name="application.pdf"`);
    rawLines.push(
      `Content-Disposition: attachment; filename="application.pdf"`
    );
    rawLines.push(`Content-Transfer-Encoding: base64`);
    rawLines.push("");

    // Break the PDF’s Base64 into 76-character lines (RFC 2045)
    for (let i = 0; i < pdfBuffer.length; i += 57) {
      // 57 bytes → 76 base64 chars
      const chunk = pdfBuffer.slice(i, i + 57).toString("base64");
      rawLines.push(chunk);
    }
    rawLines.push("");

    // Closing boundary
    rawLines.push(`--${boundary}--`);
    rawLines.push("");

    const rawMessage = rawLines.join(newline);
    const rawBuffer:any = Buffer.from(rawMessage, "utf-8");

    // 3) Send via SES
    const sendCmd = new SendRawEmailCommand({
      RawMessage: { Data: rawBuffer},
    });
    const result = await ses.send(sendCmd);

    return NextResponse.json({ message: "Email sent", status: 200 });
  } catch (error: any) {
    console.error("Send-application error:", error);
    return NextResponse.error();
  }
}
