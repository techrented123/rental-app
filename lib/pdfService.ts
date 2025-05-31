import { jsPDF } from "jspdf";
import { PDFDocument } from "pdf-lib";
import { BackgroundCheckResult } from "../types";
import type { ApplicationFormInfo } from "../types";

interface SectionEntry {
  header: string;
  title: string;
  summary: string;
  url?: string;
}

export const generateBackgroundCheckPDF = (
  results: BackgroundCheckResult,
  userRequested?: boolean
): Blob | void => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 10;
  const marginY = 10;
  let cursorY = marginY;

  // Title
  doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(33, 37, 41);
  doc.text("Background Check Results", marginX, cursorY);

  // Prospect Card
  const cardY = cursorY + 6;
  const cardH = 30;
  const cardW = pageWidth - marginX * 2;
  doc
    .setFillColor(235, 248, 255)
    .roundedRect(marginX, cardY, cardW, cardH, 2, 2, "F");

  doc.setFontSize(14).setFont("helvetica", "bold").setTextColor(33, 37, 41);
  doc.text(
    `${results.prospect.firstName} ${results.prospect.lastName}`,
    marginX + 4,
    cardY + 9
  );

  doc.setFont("helvetica", "normal").setFontSize(11);
  doc.text(
    `${results.prospect.city}, ${results.prospect.state}`,
    marginX + 4,
    cardY + 15
  );
  doc.text(
    `Report ID: ${results.id} • Generated: ${new Date(
      results.timestamp
    ).toLocaleDateString()}`,
    marginX + 4,
    cardY + 21
  );

  // Risk Badge
  const badgeText = `${results.riskLevel[0].toUpperCase()}${results.riskLevel.slice(
    1
  )} Risk`;
  const badgeW = doc.getTextWidth(badgeText) + 6;
  const badgeH = 7;
  const badgeX = marginX + cardW - badgeW - 4;
  const badgeY = cardY + 6;
  if (results.riskLevel === "low") doc.setFillColor(198, 239, 206);
  else if (results.riskLevel === "medium") doc.setFillColor(255, 242, 204);
  else doc.setFillColor(255, 199, 206);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, "F");
  doc.setFontSize(10).setFont("helvetica", "bold").setTextColor(33, 37, 41);
  doc.text(badgeText, badgeX + badgeW / 2, badgeY + badgeH - 2, {
    align: "center",
  });

  cursorY = cardY + cardH + 8;

  // Section drawer
  const drawSection = (title: string, entries: SectionEntry[]): void => {
    const secX = marginX;
    const secW = pageWidth - marginX * 2;
    const padding = 4;
    const lineHeight = 6;
    const headerH = 8;

    // Estimate height for page-break
    let estLines = 0;
    entries.forEach((e) => {
      estLines +=
        1 + 1 + doc.splitTextToSize(e.summary, secW - padding * 2).length;
      if (e.url) estLines += 1;
    });
    const estH =
      headerH + padding * 2 + estLines * lineHeight + (entries.length - 1) * 1;

    if (cursorY + estH > pageHeight - marginY) {
      doc.addPage();
      cursorY = marginY;
    }

    // Box
    doc
      .setDrawColor(226, 232, 240)
      .roundedRect(secX, cursorY, secW, estH, 2, 2);

    // Section Title
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(33, 37, 41);
    doc.text(title, secX + padding, cursorY + headerH - 2);

    // Entries
    let y = cursorY + headerH + padding;
    entries.forEach((e, idx) => {
      // Header line
      doc
        .setFont("helvetica", "normal")
        .setFontSize(11)
        .setTextColor(33, 37, 41);
      doc.text(e.header, secX + padding, y);
      y += lineHeight;

      // Title bold
      doc.setFont("helvetica", "bold").setFontSize(11);
      doc.text(e.title, secX + padding, y);
      y += lineHeight;

      // Summary wrap
      doc.setFont("helvetica", "normal").setFontSize(11);
      const sumLines = doc.splitTextToSize(e.summary, secW - padding * 2);
      sumLines.forEach((line: string | string[]) => {
        doc.text(line, secX + padding, y);
        y += lineHeight;
      });

      // Read More link
      if (e.url) {
        doc.setTextColor(0, 0, 255);
        doc.textWithLink("Read More", secX + padding, y, { url: e.url });
        doc.setTextColor(33, 37, 41);
        y += lineHeight;
      }

      // Divider
      if (idx < entries.length - 1) {
        const dy = y - lineHeight / 2;
        doc
          .setDrawColor(200, 200, 200)
          .setLineWidth(0.2)
          .line(secX + padding, dy, secX + secW - padding, dy);
      }
      y += padding;
    });

    cursorY += estH + 6;
  };

  // Build and draw each section:
  // Legal Appearances
  const legalEntries: SectionEntry[] = results.legalAppearances.found
    ? results.legalAppearances.cases.map((c) => ({
        header: `${c.date} • ${c.type}`,
        title: `${c.court} • Case #${c.caseNumber}`,
        summary: `Status: ${c.status}`,
      }))
    : [
        {
          header: "",
          title: "No legal appearances found.",
          summary: "Review public records for updates.",
        },
      ];
  drawSection("Legal Appearances", legalEntries);

  // News Articles
  const newsEntries: SectionEntry[] = results.newsArticles.found
    ? results.newsArticles.articles.map((a) => ({
        header: `${a.date} • ${a.source}`,
        title: a.title,
        summary: a.summary,
        url: a.source,
      }))
    : [
        {
          header: "",
          title: "No news articles found.",
          summary: "Review news sources for updates.",
        },
      ];
  drawSection("News Articles", newsEntries);

  // Social Media
  const socialEntries: SectionEntry[] = results.socialMedia.found
    ? results.socialMedia.profiles.map((p) => ({
        header: `${p.platform}`,
        title: p.platform,
        summary: p.summary,
        url: p.url,
      }))
    : [
        {
          header: "",
          title: "No social media presence found.",
          summary: "Review social media activity.",
        },
      ];
  drawSection("Online/Social Media Presence", socialEntries);

  // Business Associations
  const bizEntries: SectionEntry[] = results.businessAssociations.found
    ? results.businessAssociations.companies.map((b) => ({
        header: "",
        title: `${b.name} (${b.role})`,
        summary: `Status: ${b.status} • Registered: ${b.registrationDate}`,
      }))
    : [{ header: "", title: "No business associations found.", summary: "" }];
  drawSection("Business Associations", bizEntries);

  // Online Activity
  const onlineEntries: SectionEntry[] = results.onlineActivity.found
    ? [
        {
          header: "",
          title: "Online Activity",
          summary: results.onlineActivity.details,
        },
      ]
    : [{ header: "", title: "No online activity found.", summary: "" }];
  drawSection("Online Activity", onlineEntries);

  // Overall Recommendation
  drawSection("Overall Recommendation", [
    { header: "", title: "", summary: results.overallRecommendation },
  ]);

  if (userRequested) {
    doc.save(
      `background_check_${results.prospect.lastName}_${results.prospect.firstName}.pdf`
    );
  } else {
    return doc.output("blob");
  }
};

/**
 * Generate a PDF for the given application data and return it as a Blob.
 * Does NOT trigger a download.
 */
export function generateApplicationFormPDF(data: ApplicationFormInfo): Blob {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 15;
  const marginTop = 20;
  const lineHeight = 7;
  let cursorY = marginTop;

  // Title
  doc
    .setFont("helvetica", "bold")
    .setFontSize(16)
    .text("Rental Application", pageWidth / 2, cursorY, { align: "center" });
  cursorY += lineHeight * 1.5;

  // Applicant Info Header
  doc
    .setFont("helvetica", "bold")
    .setFontSize(12)
    .text("Applicant Information", marginX, cursorY);
  cursorY += lineHeight;

  // Applicant Info Body
  doc.setFont("helvetica", "normal").setFontSize(11);
  const applicant = data.applicant;
  const infoLines = [
    `Name: ${applicant.firstName} ${applicant.lastName}`,
    `Email: ${applicant.email}`,
    `Phone: ${applicant.phone}`,
    `Address: ${applicant.address}, ${applicant.city}, ${applicant.state} ${applicant.postalCode}, ${applicant.country}`,
    `Emergency Contact: ${applicant.emergencyContactFirstName} ${applicant.emergencyContactLastName} (${applicant.emergencyContactRelationship}) – ${applicant.emergencyContactPhone}`,
  ];
  infoLines.forEach((line) => {
    if (cursorY + lineHeight > pageHeight - marginTop) {
      doc.addPage();
      cursorY = marginTop;
    }
    doc.text(line, marginX, cursorY);
    cursorY += lineHeight;
  });

  cursorY += lineHeight; // extra space

  // Rental History Header
  doc
    .setFont("helvetica", "bold")
    .setFontSize(12)
    .text("Rental History", marginX, cursorY);
  cursorY += lineHeight;

  // Rental History Entries
  doc.setFont("helvetica", "normal").setFontSize(11);
  data.rentalHistory.forEach((entry, idx) => {
    const entryLines = [
      `Address: ${entry.address}, ${entry.city}, ${entry.state} ${entry.postalCode}, ${entry.country}`,
      `Landlord: ${entry.landlordFirstName} ${entry.landlordLastName} – ${entry.landlordPhone}`,
      `From: ${entry.fromDate}  To: ${entry.toDate}`,
      `Reason for Leaving: ${entry.reasonForLeaving}`,
    ];
    entryLines.forEach((line) => {
      if (cursorY + lineHeight > pageHeight - marginTop) {
        doc.addPage();
        cursorY = marginTop;
      }
      doc.text(line, marginX, cursorY);
      cursorY += lineHeight;
    });
    // divider between entries
    if (idx < data.rentalHistory.length - 1) {
      if (cursorY + lineHeight > pageHeight - marginTop) {
        doc.addPage();
        cursorY = marginTop;
      }
      doc.setDrawColor(200);
      doc.setLineWidth(0.2);
      doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
      cursorY += lineHeight;
    }
  });

  // Return the PDF as a Blob
  return doc.output("blob");
}

/**
 * Merge exactly two File objects and two Blob objects into a single PDF buffer,
 * dropping the first page of any PDF with more than one page.
 * @param pdfs Tuple of [File, File, Blob, Blob]
 * @returns Buffer of the merged PDF
 */
export async function mergePdfs(
  pdfs: [File, File, Blob, Blob]
): Promise<Buffer> {
  const mergedPdf = await PDFDocument.create();

  for (const input of pdfs) {
    // Normalize File or Blob to ArrayBuffer
    const arrayBuffer = await input.arrayBuffer();

    // Load and copy pages (dropping first if >1 page)
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPageCount();
    const pageIndices =
      totalPages > 1
        ? Array.from({ length: totalPages - 1 }, (_, i) => i + 1)
        : pdfDoc.getPageIndices();

    const pages = await mergedPdf.copyPages(pdfDoc, pageIndices);
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();
  return Buffer.from(mergedBytes);
}
