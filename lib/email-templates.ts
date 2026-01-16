export function getUserReminderEmail(
  name: string | undefined,
  sessionId: string,
  stepNumber: number,
  propertySlug: string | undefined,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || "https://rented123.com"
): string {
  const stepNames = [
    "Membership Plans",
    "Verification Report",
    "Application Form",
    "Signatures",
    "Confirmation",
  ];
  // Slug is the first parameter, then resume and sessionId
  const resumeUrl = propertySlug
    ? `${baseUrl}/apply?slug=${encodeURIComponent(
        propertySlug
      )}&resume=true&sessionId=${sessionId}`
    : `${baseUrl}/apply?resume=true&sessionId=${sessionId}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Complete Your Rental Application</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #32429B 0%, #4A5CC7 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Continue Your Application</h1>
    <p style="color: #E8EAF6; margin: 10px 0 0 0; font-size: 16px;">Rented123 Property Management</p>
  </div>
  
  <!-- Main Content -->
  <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 18px; margin-bottom: 20px;">Hello${
      name ? ` ${name}` : ""
    },</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      We noticed you started a rental application but haven't completed it yet. 
      Don't worry – your progress has been saved!
    </p>
    
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #32429B; margin: 25px 0;">
      <h3 style="color: #32429B; margin: 0 0 15px 0; font-size: 18px;">📋 Your Progress:</h3>
      <p style="margin: 0; color: #4b5563;">
        <strong>Last Step:</strong> ${
          stepNames[stepNumber] || "Step " + ((stepNumber || 0) + 1)
        }<br>
        <strong>Your progress has been saved</strong> and you can continue right where you left off.
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resumeUrl}" 
         style="display: inline-block; background: linear-gradient(135deg, #32429B 0%, #4A5CC7 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Continue Your Application
      </a>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      The application process typically takes just a few minutes to complete. 
      By finishing your application, you'll be one step closer to securing your rental property.
    </p>
    
    <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 25px 0;">
      <p style="margin: 0; color: #065f46; font-weight: 500;">
        💡 <strong>Need Help?</strong> If you have any questions or need assistance, feel free to reach out to our support team.
      </p>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 0;">
      Best regards,<br>
      <strong>The Rented123 Team</strong>
    </p>
  </div>
  
  <!-- Footer -->
  <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin: 0; color: #6b7280; font-size: 14px;">
      This email was sent because you started a rental application on Rented123.<br>
      <span style="color: #9ca3af;">© ${new Date().getFullYear()} Rented123. All rights reserved.</span>
    </p>
  </div>
  
</body>
</html>
  `.trim();
}

export function getSalesNotificationEmail(
  trackingData: {
    name?: string;
    email?: string;
    step: number;
    lastActivity: string;
    address?: string;
    property?: string;
    location?: {
      city?: string;
      region?: string;
      country?: string;
    };
    ip?: string;
    sessionId: string;
  },
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || "https://rented123.com"
): string {
  const stepNames = [
    "Membership Plans",
    "Verification Report",
    "Application Form",
    "Signatures",
    "Confirmation",
  ];

  const hoursInactive = Math.floor(
    (Date.now() - new Date(trackingData.lastActivity).getTime()) /
      (1000 * 60 * 60)
  );
  const locationText = trackingData.location
    ? `${trackingData.location.city || ""}${
        trackingData.location.city && trackingData.location.region ? ", " : ""
      }${trackingData.location.region || ""}${
        (trackingData.location.city || trackingData.location.region) &&
        trackingData.location.country
          ? ", "
          : ""
      }${trackingData.location.country || ""}`
    : "Unknown";

  const lastActivityDate = new Date(trackingData.lastActivity).toLocaleString();
  // Slug is the first parameter, then resume and sessionId
  const resumeUrl = trackingData.property
    ? `${baseUrl}/apply?slug=${encodeURIComponent(
        trackingData.property
      )}&resume=true&sessionId=${trackingData.sessionId}`
    : `${baseUrl}/apply?resume=true&sessionId=${trackingData.sessionId}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Incomplete Application Alert</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">⚠️ Incomplete Application Alert</h1>
    <p style="color: #fee2e2; margin: 10px 0 0 0; font-size: 16px;">Rented123 Property Management</p>
  </div>
  
  <!-- Main Content -->
  <div style="background: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="font-size: 18px; margin-bottom: 20px;">Sales Team,</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      An applicant has not completed their rental application for more than 24 hours. 
      This may be an opportunity for follow-up.
    </p>
    
    <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 25px 0;">
      <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 18px;">📋 Application Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #4b5563; font-weight: 600;">Name:</td>
          <td style="padding: 8px 0; color: #1f2937;">${
            trackingData.name || "Not provided"
          }</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #4b5563; font-weight: 600;">Email:</td>
          <td style="padding: 8px 0; color: #1f2937;">${
            trackingData.email || "Not provided"
          }</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #4b5563; font-weight: 600;">Property Address:</td>
          <td style="padding: 8px 0; color: #1f2937;">${
            trackingData.address || "Not provided"
          }</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #4b5563; font-weight: 600;">Stopped at Step:</td>
          <td style="padding: 8px 0; color: #1f2937;">${
            stepNames[trackingData.step] || "Step " + (trackingData.step + 1)
          }</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #4b5563; font-weight: 600;">Last Activity:</td>
          <td style="padding: 8px 0; color: #1f2937;">${lastActivityDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #4b5563; font-weight: 600;">Time Inactive:</td>
          <td style="padding: 8px 0; color: #dc2626; font-weight: 600;">${hoursInactive} hours</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #4b5563; font-weight: 600;">Location:</td>
          <td style="padding: 8px 0; color: #1f2937;">${locationText}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #4b5563; font-weight: 600;">Session ID:</td>
          <td style="padding: 8px 0; color: #6b7280; font-size: 12px; font-family: monospace;">${
            trackingData.sessionId
          }</td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resumeUrl}" 
         style="display: inline-block; background: linear-gradient(135deg, #32429B 0%, #4A5CC7 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        View Application
      </a>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Consider reaching out to this applicant to assist them in completing the application process.
    </p>
    
    <p style="font-size: 16px; margin-bottom: 0;">
      Best regards,<br>
      <strong>Rented123 Application System</strong>
    </p>
  </div>
  
  <!-- Footer -->
  <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin: 0; color: #6b7280; font-size: 14px;">
      This is an automated notification from the Rented123 Property Management System.<br>
      <span style="color: #9ca3af;">© ${new Date().getFullYear()} Rented123. All rights reserved.</span>
    </p>
  </div>
  
</body>
</html>
  `.trim();
}
