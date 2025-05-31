// app/api/signwell/createFromTemplate/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://www.signwell.com/api/v1";
const API_KEY = process.env.SIGNWELL_API_KEY!;
const TEST_MODE = process.env.NODE_ENV !== "production";

export async function POST(req: NextRequest) {
  const { rentalInfo, tenant, templateIds, fileName, placeHolders } =
    await req.json();
  const {
    firstName: tenantFirstName,
    lastName: tenantLastName,
    email: tenantEmail,
  } = tenant;

  const {
    address: { Address: street, City: city, State: state, PostalCode: postal },
    rent,
    landlordName,
    landlordEmail,
  } = rentalInfo;
  const [landlordFirstName, landlordLastName] = landlordName.split(" ");
  /* if (
    !landlordLastName ||
    !landlordFirstName ||
    !landlordEmail ||
    !tenantFirstName ||
    !tenantLastName ||
    !tenantEmail
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  } */
  console.log(tenantEmail, landlordFirstName, landlordLastName, street, city);
  console.log(landlordName.split(" "));
  const payload = {
    test_mode: true,
    template_ids: templateIds,
    embedded_signing: true,
    expires_in: 10,
    embedded_signing_notifications: false,
    name: fileName,
    subject: `Your Signatures are Needed for ${fileName}`,
    message: `Dear ${tenantFirstName} please sign the ${fileName} document for your rental application`,
    template_fields: [
      { api_id: "landlord_lastname", value: landlordLastName },
      { api_id: "landlord_other_names", value: landlordFirstName },
      { api_id: "tenant_lastname", value: tenantLastName },
      { api_id: "tenant_other_names", value: tenantFirstName },
      { api_id: "rental_address", value: street + " " + city },
      { api_id: "rent", value: rent },
      { api_id: "landlord_lastname_signature", value: landlordLastName },
      { api_id: "landlord_other_names_signature", value: landlordFirstName },
      { api_id: "tenant_lastname_signature", value: tenantLastName },
      { api_id: "tenant_other_names_signature", value: tenantFirstName },
    ],
    recipients: [
      {
        id: "1",
        placeholder_name: placeHolders[0], // must match your template’s placeholder
        name: landlordFirstName + " " + landlordLastName,
        email: "tambi.asawo@yahoo.com", // landlordEmail,
        send_email: true,
      },
      {
        id: "2",
        placeholder_name: placeHolders[1], // must match your template’s placeholder
        name: tenantFirstName + " " + tenantLastName,
        email: "bob@yah.co", //tenantEmail,
        //send_email: true,
      },
    ],
  };

  const swRes = await fetch(`${API_BASE}/document_templates/documents/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Api-Key": API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!swRes.ok) {
    const err = await swRes.text();
    console.log({ err });

    return NextResponse.json({ error: err }, { status: swRes.status });
  }

  const result = await swRes.json();
  console.log({ fields: result.fields });
  // 3) Extract the tenant’s embedded signing URL
  const tenantRecipient = result.recipients.find(
    (r: any) => r.placeholder_name === "Applicant"
  );
  if (!tenantRecipient?.embedded_signing_url) {
    return NextResponse.json(
      { error: "No embedded signing URL returned" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    signingUrl: tenantRecipient.embedded_signing_url,
    fields: result.fields,
  });
}
