
import https from "https";
import http from "http";
import { URL } from "url";

export const handler = async (event) => {
  console.log("Event:", JSON.stringify(event, null, 2));

  const apiUrl = process.env.NEXTJS_API_URL;
  const authToken = process.env.SCHEDULED_JOB_TOKEN;

  if (!apiUrl) {
    throw new Error(
      "NEXTJS_API_URL environment variable is not set. Please set it to your Amplify app URL (e.g., https://main.d123abcxyz.amplifyapp.com)"
    );
  }

  // Construct full API URL
  const fullUrl = apiUrl.endsWith("/")
    ? `${apiUrl}api/check-incomplete-applications`
    : `${apiUrl}/api/check-incomplete-applications`;

  const url = new URL(fullUrl);

  return new Promise((resolve, reject) => {
    const requestModule = url.protocol === "https:" ? https : http;

    const headers = {
      "Content-Type": "application/json",
    };

    // Add authorization header if token is provided
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const options = {
      method: "GET",
      hostname: url.hostname,
      path: url.pathname + url.search,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      headers,
      timeout: 30000, // 30 second timeout
    };

    console.log("Calling API:", fullUrl);

    const req = requestModule.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log("Response status:", res.statusCode);
        console.log("Response body:", data);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsedData = JSON.parse(data);
            resolve({
              statusCode: 200,
              body: JSON.stringify(parsedData),
            });
          } catch (parseError) {
            // Return raw data if JSON parsing fails
            resolve({
              statusCode: 200,
              body: data,
            });
          }
        } else {
          const error = new Error(
            `API returned status ${res.statusCode}: ${data}`
          );
          error.statusCode = res.statusCode;
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      console.error("Request error:", error);
      reject(error);
    });

    req.on("timeout", () => {
      console.error("Request timeout");
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
};
