import OpenAI from "openai";
import { ProspectInfo, BackgroundCheckResult } from "../../../types";

// Initialize OpenAI client with your API key
const client = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

// System prompt instructions for background check
const instructions = `
You are performing a public profile background check on a prospective renter.

The input will be provided in the following format:
Name: <Full Name>
Location 1: <City, Province — e.g., Vancouver, BC>
[Optional] Location 2: <City 2, Province 2 — if applicable>
Optional Details: <Email address, company, etc. — if known>

Please perform a deep web search and summarize any public information you find about the person. Focus on:
- News articles or press mentions
- Court or legal appearances in British Columbia
- Public social media profiles (LinkedIn, Facebook, etc.)
- Company registrations or associations
- Public comments or online activity
- Anything that may reflect positively or negatively on character

Return a JSON object with these properties:
{
  "press_mentions": [
    { "date": "", "topic": "", "description": "" }
  ],
  "legal_appearances": [
    { "date": "", "title": "", "description": "", "location": "", "plaintiff": "" }
  ],
  "social_media_profiles": [
    { "platform": "", "link": "" }
  ],
  "company_registrations": [
    { "name": "", "link": "" }
  ],
  "others": "",
  "public_comments": "",
  "short_summary": ""
}

Make sure you return valid links. 
Only output valid JSON. If no records are found for a property, set its value to an empty array or empty string as appropriate.
`;

export async function POST(request: Request) {
  try {
    const formData: ProspectInfo = await request.json();

    // Construct user input for the model
    const userInput = `
Name: ${formData.firstName} ${formData.lastName}
Location 1: ${formData.city}, ${formData.state}
${formData.city2 ? `Location 2: ${formData.city2}, ${formData.state2}` : ""}

Optional Details: Prospect Type: ${formData.email}
`;

    // Call OpenAI chat completion
    /*   const response = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: instructions },
        { role: "user", content: userInput.trim() },
      ],
      temperature: 0,
    }); */
    const response = await client.chat.completions.create({
      model: "gpt-4o-search-preview",
      messages: [
        {
          role: "system",
          content: instructions,
        },
        {
          role: "user",
          content: userInput.trim(),
        },
      ],
    });

    const content = response.choices?.[0]?.message?.content;
    console.log({ content });
    //formatResult(content)
    //return NextResponse.json(content);

    // Parse the OpenAI response and transform it into our BackgroundCheckResult format
    let openAIResult;
    try {
      openAIResult = JSON.parse(content || "{}");
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Failed to parse model response");
    }

    // Transform the OpenAI response into our BackgroundCheckResult format
    const result: BackgroundCheckResult = {
      id: "BCR-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      timestamp: new Date().toISOString(),
      prospect: formData,
      newsArticles: {
        found: openAIResult.press_mentions.length > 0,
        articles: openAIResult.press_mentions.map((mention: any) => ({
          title: mention.topic,
          date: mention.date,
          source: "Web Search",
          summary: mention.description,
        })),
       // recommendation: openAIResult.short_summary,
      },
      legalAppearances: {
        found: openAIResult.legal_appearances.length > 0,
        cases: openAIResult.legal_appearances.map((appearance: any) => ({
          caseNumber: Math.random().toString(36).substring(2, 10).toUpperCase(),
          date: appearance.date,
          court: appearance.location,
          type: appearance.title,
          status: "Recorded",
        })),
        recommendation:
          openAIResult.legal_appearances.length > 0
            ? "Review any legal proceedings carefully and consider their relevance to the application."
            : "",
      },
      socialMedia: {
        found: openAIResult.social_media_profiles.length > 0,
        profiles: openAIResult.social_media_profiles.map((profile: any) => ({
          platform: profile.platform,
          url: profile.link,
          summary: "Profile found through web search",
        })),
        recommendation:
          "Review social media presence for professional conduct and consistency.",
      },
      businessAssociations: {
        found: openAIResult.company_registrations.length > 0,
        companies: openAIResult.company_registrations.map((company: any) => ({
          name: company.name,
          role: "Associated",
          status: "Found in Records",
          registrationDate: new Date().toISOString().split("T")[0],
        })),
        recommendation:
          "Verify current status of business associations and assess potential impacts.",
      },
      onlineActivity: {
        found: Boolean(openAIResult.public_comments || openAIResult.others),
        details:
          openAIResult.public_comments ||
          openAIResult.others ||
          "No significant online activity found.",
        recommendation:
          "Consider the overall online presence and its relevance to the application.",
      },
      riskLevel: determineRiskLevel(openAIResult),
      overallRecommendation: openAIResult.short_summary,
    };

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("Background check error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

/*

*/
function determineRiskLevel(data: any): "low" | "medium" | "high" {
  let riskScore = 0;

  // Increase risk score based on various factors
  if (data.legal_appearances.length > 0) riskScore += 3;
  if (
    data.press_mentions.some((m: any) =>
      m.description.toLowerCase().includes("negative")
    )
  )
    riskScore += 2;
  if (!data.social_media_profiles.length) riskScore += 1;

  // Determine risk level based on score
  if (riskScore >= 3) return "high";
  if (riskScore >= 1) return "medium";
  return "low";
}
