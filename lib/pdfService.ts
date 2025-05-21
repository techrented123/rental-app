import { jsPDF } from "jspdf";
import { BackgroundCheckResult } from "../types";

export const generatePDF = (results: BackgroundCheckResult): void => {
  const doc = new jsPDF();

  // Add logo/header
  doc.setFillColor(30, 58, 138); // Dark blue
  doc.rect(0, 0, 210, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("TrustCheck", 15, 15);

  doc.setFontSize(12);
  doc.text("Real Estate Background Verification", 70, 15);

  doc.setFontSize(10);
  doc.setTextColor(220, 220, 220);
  doc.text("CONFIDENTIAL REPORT", 160, 15);

  // Title section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("BACKGROUND CHECK REPORT", 105, 35, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Report ID: ${results.id}`, 105, 42, { align: "center" });
  doc.text(
    `Generated: ${new Date(results.timestamp).toLocaleDateString()}`,
    105,
    48,
    { align: "center" }
  );

  // Prospect Information
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Prospect Information", 15, 60);

  doc.setDrawColor(200, 200, 200);
  doc.line(15, 62, 195, 62);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Name: ${results.prospect.firstName} ${results.prospect.lastName}`,
    15,
    70
  );
  doc.text(
    `Location: ${results.prospect.city}, ${results.prospect.state}`,
    25,
    84
  );

  // Risk Level
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const riskText = `Risk Level: ${results.riskLevel.toUpperCase()}`;
  doc.text(riskText, 195, 70, { align: "right" });

  // Set risk level color
  if (results.riskLevel === "low") {
    doc.setTextColor(0, 128, 0); // Green
  } else if (results.riskLevel === "medium") {
    doc.setTextColor(255, 153, 0); // Orange
  } else {
    doc.setTextColor(255, 0, 0); // Red
  }

  doc.text(results.riskLevel.toUpperCase(), 195, 70, { align: "right" });
  doc.setTextColor(0, 0, 0); // Reset to black

  // Legal Appearances
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Legal Appearances", 15, 170);

  doc.setDrawColor(200, 200, 200);
  doc.line(15, 172, 195, 172);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  if (results.legalAppearances.found) {
    results.legalAppearances.cases.forEach((case_, index) => {
      const y = 180 + index * 25;
      doc.setFont("helvetica", "bold");
      doc.text(`${case_.type} - ${case_.status}`, 15, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${case_.court} • Case #${case_.caseNumber}`, 15, y + 5);
      doc.text(`Filed: ${case_.date}`, 15, y + 10);
    });
  } else {
    doc.text("No legal appearances found in BC courts.", 15, 180);
  }
  doc.text(results.legalAppearances.recommendation, 15, 220);

  // News Articles
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");


  doc.text("News Articles", 15, 105);

  doc.setDrawColor(200, 200, 200);
  doc.line(15, 107, 195, 107);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  if (results.newsArticles.found) {
    results.newsArticles.articles.forEach((article, index) => {
      const y = 115 + index * 20;
      doc.setFont("helvetica", "bold");
      doc.text(article.title, 15, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${article.source} • ${article.date}`, 15, y + 5);
      doc.text(article.summary, 15, y + 10);
    });
  } else {
    doc.text("No significant news articles found.", 15, 115);
  }

  
  // Add a new page for the remaining sections
  doc.addPage();

  // Social Media
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Social Media Presence", 15, 20);

  doc.setDrawColor(200, 200, 200);
  doc.line(15, 22, 195, 22);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  if (results.socialMedia.found) {
    results.socialMedia.profiles.forEach((profile, index) => {
      const y = 30 + index * 20;
      doc.setFont("helvetica", "bold");
      doc.text(profile.platform, 15, y);
      doc.setFont("helvetica", "normal");
      doc.text(profile.url, 15, y + 5);
      doc.text(profile.summary, 15, y + 10);
    });
  } else {
    doc.text("No significant social media presence found.", 15, 30);
  }
  doc.text(results.socialMedia.recommendation, 15, 90);

  // Business Associations
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Business Associations", 15, 110);

  doc.setDrawColor(200, 200, 200);
  doc.line(15, 112, 195, 112);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  if (results.businessAssociations.found) {
    results.businessAssociations.companies.forEach((company, index) => {
      const y = 120 + index * 25;
      doc.setFont("helvetica", "bold");
      doc.text(company.name, 15, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${company.role} • ${company.status}`, 15, y + 5);
      doc.text(`Registered: ${company.registrationDate}`, 15, y + 10);
    });
  } else {
    doc.text("No business associations found.", 15, 120);
  }
  doc.text(results.businessAssociations.recommendation, 15, 170);

  // Online Activity
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Online Activity", 15, 190);

  doc.setDrawColor(200, 200, 200);
  doc.line(15, 192, 195, 192);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(results.onlineActivity.details, 15, 200);
  doc.text(results.onlineActivity.recommendation, 15, 210);

  // Overall Recommendation
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Overall Recommendation", 15, 230);

  doc.setDrawColor(200, 200, 200);
  doc.line(15, 232, 195, 232);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const overallRecommLines = doc.splitTextToSize(
    results.overallRecommendation,
    170
  );
  doc.text(overallRecommLines, 15, 240);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "This report is confidential and intended only for the use of authorized personnel.",
    105,
    280,
    { align: "center" }
  );
  doc.text("© 2025 TrustCheck Real Estate Background Verification", 105, 285, {
    align: "center",
  });

  // Save the PDF with the prospect's name
  doc.save(
    `background_check_${results.prospect.lastName}_${results.prospect.firstName}.pdf`
  );
};
