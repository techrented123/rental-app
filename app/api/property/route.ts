// app/api/property/route.ts
import { NextResponse } from "next/server";
import xml2js from "xml2js";

export const dynamic = "force-dynamic"; // ensure this API route is always runtime

export async function GET(request: Request) {
  try {
    // parse slug
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    // fetch Buildium XML
    const res = await fetch(
      "https://rob53.managebuilding.com/Resident/PublicPages/XMLRentals.ashx?listings=all"
    );
    const xmlText = await res.text();

    // parse into JS
    const parsed = await xml2js.parseStringPromise(xmlText, {
      explicitArray: false,
    });
    const feed = parsed.PhysicalProperty.Property;
    const properties = Array.isArray(feed) ? feed : [feed];

    // find matching property
    const property = properties.find((p: any) => {
      const name = p.PropertyID.MarketingName as string;
      const s = name
        .toLowerCase()
        .trim()
        .replace(/[^\w]+/g, "-")
        .replace(/(^-+|-+$)/g, "");
      return s === slug;
    });
    console.log(property.Floorplan.EffectiveRent.$.Min);
    if (!property) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // return the raw property object (or pick fields as you like)
    return NextResponse.json(property);
  } catch (err: any) {
    console.error("API/property error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
