import { ZakatAsset } from "../types";

/**
 * Triggers a browser download of a CSV file generated from the user's assets.
 */
export async function exportToExcel(assets: ZakatAsset[]): Promise<boolean> {
  console.log("Exporting assets to CSV...", assets);
  
  if (typeof window === "undefined" || assets.length === 0) {
    return false;
  }

  try {
    // Generate CSV content
    const headers = ["ID", "Asset Type", "Name", "Market Value ($)", "Zakatable Amount ($)", "Created At"];
    const rows = assets.map((asset) => [
      asset.id,
      asset.type,
      asset.name,
      asset.value.toString(),
      asset.zakatableAmount.toString(),
      asset.createdAt,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mizan_wealth_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link); // Required for FF

    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error("Error exporting to Excel/CSV:", error);
    return false;
  }
}
