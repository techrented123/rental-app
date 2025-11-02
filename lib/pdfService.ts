import { jsPDF } from "jspdf";
import { PDFDocument } from "pdf-lib";
import type { ApplicationFormInfo } from "../types";

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
    `Name: ${applicant.fullName}`,
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
 * Merge PDFs into a single PDF
 */
export async function mergePdfs(
  pdfs: Array<File | Blob>,
  rentalInfo: any
): Promise<Blob> {
  const coverArrayBuffer = creatCoverPageForMergedPDF(rentalInfo);

  const mergedPdf = await PDFDocument.create();

  const coverDoc = await PDFDocument.load(coverArrayBuffer);
  const coverPages = await mergedPdf.copyPages(
    coverDoc,
    coverDoc.getPageIndices()
  );
  coverPages.forEach((page) => mergedPdf.addPage(page));

  for (const input of pdfs) {
    const arrayBuffer = await input.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPageCount();
    const pageIndices =
      totalPages > 1
        ? Array.from({ length: totalPages - 1 }, (_, i) => i + 1)
        : pdfDoc.getPageIndices();

    const pages = await mergedPdf.copyPages(pdfDoc, pageIndices);
    pages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = (await mergedPdf.save()) as any;
  return new Blob([mergedBytes], { type: "application/pdf" });
}

function creatCoverPageForMergedPDF(rentalInfo: any): ArrayBuffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Logo - skip for now (can be added later if needed)
  // doc.addImage(logo.src, "PNG", (pageWidth - 40) / 2, 20, 40, 56);

  // Title
  doc.setFont("helvetica", "bold").setFontSize(24).setTextColor(50, 66, 155);
  const titleText = `Rental Application for 102 ${rentalInfo.street}`;
  const titleW = doc.getTextWidth(titleText);
  doc.text(titleText, (pageWidth - titleW) / 2, 95);

  // Prospect Name
  doc.setFont("helvetica", "normal").setFontSize(14).setTextColor(31, 41, 55);
  const nameText = `Name: ${rentalInfo.prospectName}`;
  const nameW = doc.getTextWidth(nameText);
  doc.text(nameText, (pageWidth - nameW) / 2, 105);

  // Date Generated
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.setFontSize(10);
  const dateText = `Generated on ${today}`;
  const dateW = doc.getTextWidth(dateText);
  doc.text(dateText, (pageWidth - dateW) / 2, 112);

  // Table of Contents
  doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(33, 37, 41);
  doc.text("Table of Contents", 10, 130);

  doc.setFont("helvetica", "normal").setFontSize(11).setTextColor(31, 41, 55);
  const tocX = 10 + 4;
  let tocY = 158;
  doc.text(
    "1. ID Verification .................................. 2",
    tocX,
    tocY
  );
  tocY += 8;
  doc.text("2. Credit Report .................................. 3", tocX, tocY);
  tocY += 8;
  doc.text("3. AI Background Check ...................... 4", tocX, tocY);
  tocY += 8;
  doc.text("3. Tenant Information ...................... 5", tocX, tocY);

  return doc.output("arraybuffer");
}
