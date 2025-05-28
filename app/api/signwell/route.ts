import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://www.signwell.com/api/v1";
const API_KEY = process.env.SIGNWELL_API_KEY!;
const TEST_MODE = process.env.NODE_ENV !== "production";

export async function POST(req: NextRequest) {
  const { signerName, signerEmail } = await req.json();
  if (!signerName || !signerEmail) {
    return NextResponse.json(
      { error: "Missing signerName or signerEmail" },
      { status: 400 }
    );
  }

  // 1) Create a new document from your template, with embedded signing enabled
  const createRes = await fetch(`${API_BASE}/documents/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": API_KEY,
    },
    body: JSON.stringify({
      test_mode: TEST_MODE,
      //template_id: "", // from the dashboard
      embedded_signing: true,
      draft: true,
      recipients: [
        {
          id: "1",
          placeholder_name: "Applicant",
          name: signerName,
          email: signerEmail,
        },
      ],
      files: [
        {
          name: "Rental Agreement.docx",
          file_url:
            "https://rented123-brand-files.s3.us-west-2.amazonaws.com/rental-lease-documents/Alberta+Residential+tenancy+form.pdf",
        },
      ],
    }),
  });
  if (!createRes.ok) {
    const err = await createRes.text();
    return NextResponse.json({ error: err }, { status: createRes.status });
  }
  const { recipients } = await createRes.json();
  const signingUrl = recipients?.[0]?.embedded_signing_url;

  if (!signingUrl) {
    return NextResponse.json(
      { error: "No signing URL returned by SignWell" },
      { status: 500 }
    );
  }

  // 2) Return the URL your frontend will iframe
  return NextResponse.json({ signingUrl });
}
