import { ZakatCalculationResult, ZakatAsset } from "../types";

export interface PDFExportData {
  calculation: ZakatCalculationResult;
  assets: ZakatAsset[];
  liabilities: number;
}

/**
 * Trigger browser print/download of a PDF summary of the Zakat calculations.
 */
export async function exportToPDF(data: PDFExportData): Promise<boolean> {
  console.log("Exporting calculation to PDF...", data);
  
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  if (typeof window !== "undefined") {
    // Native print is a clean, dependency-free way to trigger PDF saving
    // We can also integrate a library like jspdf later if needed
    window.print();
    return true;
  }
  
  return false;
}
