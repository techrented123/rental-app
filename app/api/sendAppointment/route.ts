import { NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const AWS_ACCESS_KEY_ID = process.env.NEXT_PUBLIC_ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = process.env.NEXT_PUBLIC_ACCESS_KEY_SECRET!;
const AWS_REGION = process.env.NEXT_PUBLIC_REGION!;


export async function POST(req: Request) {
  const { name, email, message, landlordName, landlordEmail, street } =
    await req.json();

  if (!street || !landlordEmail)
    return NextResponse.json({ error: "Missing parameters", status: "413" });
  // Initialize SES client
  const ses = new SESClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });
  const params = {
    Source: "reports@rented123.com",
    Destination: {
      ToAddresses: ["tambi@rented123.com"] /*  landlordEmail
        ? ["reports@rented123.com", landlordEmail]
        : ["reports@rented123.com"],
    }, */,
    },
    Message: {
      Subject: {
        Data: `Appointment for Rental Unit Showing ${street}`,
      },
      Body: {
        Text: {
          Data: `A prospective tenant is interested in viewing your rental unit. Name: ${name}, Email: ${email}, Message: ${message}. You can respond by reaching out via email`,
        },
        Html: {
          Data: `
            <p>Hi ${landlordName},</p>
            <p>A prospective tenant is interested in viewing your rental unit. 
            <p>Name: <strong>${name} </strong></p>
            <p>Email: ${email}</p>
            <p>Message: ${message} </p>
            <p>You can respond by reaching out to them via email</p>
           
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
