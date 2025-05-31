import { NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const AWS_ACCESS_KEY_ID = process.env.ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.ACCESS_KEY_SECRET!;
const AWS_REGION = process.env.REGION!;

export async function POST(req: Request) {
  const { userDetails, recipientEmail, pdfUrl } = await req.json();

  // Initialize SES client
  const ses = new SESClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });
  const params = {
    Source: "tech@rented123.com",
    Destination: {
      ToAddresses: recipientEmail
        ? ["tech@rented123.com", recipientEmail]
        : ["tech@rented123.com"],
    },
    Message: {
      Subject: {
        Data: `Rental Application for Your Rented123 Property`,
      },
      Body: {
        Text: {
          Data: `Hello ${userDetails.first_name}, someone is interested in your property and has applied as a tenant. See the attachment below. Also as areminder please do sign the rental agreement if you have not already`,
        },
        Html: {
          Data: `
            <p>Hi ${userDetails.first_name},</p>
            <p>Congratulations! someone is interested in your propery and has applied as a tenant. See the attachment below</p>
            <p>Also as areminder please do sign the rental agreement if you have not already. It was sent via email to you</p>
            <br>
            <p>Happy Renting</p>
            <p>The Rented123 Team</p>
          `,
        },
      },
    },
    ConfigurationSetName: "my-first-configuration-set",
  };

  try {
    // Send email via SES
    const data = await ses.send(new SendEmailCommand(params));
    console.log("Email sent successfully:", data);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Email sending error:", err);
    return NextResponse.json(
      { message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
