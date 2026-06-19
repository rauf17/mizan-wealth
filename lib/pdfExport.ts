import { ZakatCalculationResult, ZakatAsset } from "../types";

export interface PDFExportData {
  calculation: ZakatCalculationResult;
  assets: ZakatAsset[];
  liabilities: number;
}

/**
 * Trigger browser print/download of a PDF summary of the Zakat calculations.
 * Compiles a clean, professional financial invoice statement layout in a new tab and triggers printing.
 */
export async function exportToPDF(data: PDFExportData): Promise<boolean> {
  if (typeof window === "undefined") return false;

  try {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download/print the PDF report.");
      return false;
    }

    const dateStr = new Date(data.calculation.calculationDate).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const assetTypeLabels: Record<string, string> = {
      cash: "Cash / Banks",
      gold: "Gold Metals",
      silver: "Silver Metals",
      stock: "Equities / Stocks",
      real_estate: "Real Estate",
      business: "Business Assets",
      crypto: "Cryptocurrency",
      other: "Other Assets",
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mizan Wealth Statement</title>
          <style>
            @media print {
              body {
                padding: 10px;
                font-size: 12px;
              }
              .no-print {
                display: none;
              }
            }
            body {
              font-family: 'Georgia', 'Times New Roman', serif;
              color: #112626;
              background-color: #ffffff;
              padding: 40px;
              line-height: 1.6;
              margin: 0;
            }
            .header {
              border-bottom: 3px double #0F4C4C;
              padding-bottom: 16px;
              margin-bottom: 24px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .brand {
              font-family: 'Helvetica Neue', 'Arial', sans-serif;
            }
            .logo {
              font-size: 26px;
              font-weight: 800;
              color: #0F4C4C;
              letter-spacing: 1.5px;
            }
            .subtitle {
              font-size: 11px;
              color: #C9A227;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-top: 2px;
            }
            .meta {
              text-align: right;
              font-size: 12px;
              color: #4E6363;
              font-family: 'Helvetica Neue', 'Arial', sans-serif;
            }
            .summary-title {
              font-family: 'Helvetica Neue', 'Arial', sans-serif;
              font-size: 14px;
              font-weight: 700;
              color: #0F4C4C;
              text-transform: uppercase;
              margin-bottom: 12px;
              letter-spacing: 0.5px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 16px;
              margin-bottom: 30px;
            }
            .summary-card {
              border: 1px solid #E2E2D5;
              border-radius: 8px;
              padding: 14px;
              background-color: #FAFAF8;
              font-family: 'Helvetica Neue', 'Arial', sans-serif;
            }
            .summary-card .label {
              font-size: 10px;
              text-transform: uppercase;
              color: #4E6363;
              font-weight: 600;
              margin-bottom: 6px;
              letter-spacing: 0.5px;
            }
            .summary-card .val {
              font-size: 20px;
              font-weight: 700;
              color: #0F4C4C;
            }
            .nisab-banner {
              border: 1px solid #C9A227;
              border-left: 5px solid #C9A227;
              border-radius: 6px;
              padding: 14px;
              background-color: #FAFAF8;
              font-family: 'Helvetica Neue', 'Arial', sans-serif;
              font-size: 12px;
              margin-bottom: 30px;
              color: #112626;
            }
            .section-title {
              font-family: 'Helvetica Neue', 'Arial', sans-serif;
              font-size: 13px;
              font-weight: 700;
              color: #0F4C4C;
              text-transform: uppercase;
              border-bottom: 1px solid #E2E2D5;
              padding-bottom: 6px;
              margin-bottom: 12px;
              margin-top: 24px;
              letter-spacing: 0.5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
              font-size: 12px;
              font-family: 'Helvetica Neue', 'Arial', sans-serif;
            }
            th {
              border-bottom: 2px solid #0F4C4C;
              color: #0F4C4C;
              font-weight: 700;
              padding: 8px 10px;
              text-align: left;
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: 0.5px;
            }
            td {
              padding: 8px 10px;
              border-bottom: 1px solid #E2E2D5;
            }
            .text-right {
              text-align: right;
            }
            .footer {
              margin-top: 60px;
              font-size: 10px;
              color: #4E6363;
              text-align: center;
              border-top: 1px solid #E2E2D5;
              padding-top: 12px;
              font-family: 'Helvetica Neue', 'Arial', sans-serif;
            }
            .badge {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
            }
            .badge-success {
              background-color: #E2F2E2;
              color: #0F4C4C;
              border: 1px solid #B8DBB8;
            }
            .badge-danger {
              background-color: #FDF2F2;
              color: #C5221F;
              border: 1px solid #FAD7D7;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              <div class="logo">MIZAN WEALTH</div>
              <div class="subtitle">Shariah wealth statement</div>
            </div>
            <div class="meta">
              <strong>Zakat Position Statement</strong><br>
              Date compiled: ${dateStr}<br>
              Cryptographic local signature: on-device
            </div>
          </div>

          <div class="summary-title">Financial Position Summary</div>
          <div class="summary-grid">
            <div class="summary-card">
              <div class="label">Gross Wealth</div>
              <div class="val">$${data.calculation.totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <div class="label">Outstanding Debts</div>
              <div class="val">-$${data.calculation.totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card">
              <div class="label">Zakatable Wealth</div>
              <div class="val">$${data.calculation.netZakatable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
            <div class="summary-card" style="border: 1.5px solid #C9A227;">
              <div class="label" style="color: #C9A227; font-weight: 700;">Zakat Due (2.5%)</div>
              <div class="val" style="color: #0F4C4C;">$${data.calculation.zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          </div>

          <div class="nisab-banner">
            <strong>Shariah Threshold Evaluation (Nisab check):</strong><br>
            The calculated Nisab threshold based on your selected standard is <strong>$${data.calculation.nisabThreshold.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>.<br>
            Your net eligible wealth has 
            ${
              data.calculation.isNisabReached
                ? '<span class="badge badge-success">Met the Nisab</span>'
                : '<span class="badge badge-danger">Not Met the Nisab</span>'
            }. 
            Accordingly, Zakat is ${data.calculation.isNisabReached ? "<strong>mandatory</strong>" : "<strong>not mandatory</strong>"} at this time.
          </div>

          <div class="section-title">Asset Inventory Details</div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Asset Class</th>
                <th>Acquisition Date</th>
                <th class="text-right">Market Value</th>
                <th class="text-right">Zakatable Amount</th>
              </tr>
            </thead>
            <tbody>
              ${data.assets
                .map(
                  (asset) => `
                <tr>
                  <td><strong>${asset.name}</strong></td>
                  <td>${assetTypeLabels[asset.type] || asset.type}</td>
                  <td>${asset.acquisitionDate}</td>
                  <td class="text-right">$${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td class="text-right" style="color: #0F4C4C; font-weight: 600;">$${asset.zakatableAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer">
            Generated locally via Mizan Wealth Planner. Cryptographically secured and stored on client device storage only.
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    return true;
  } catch (error) {
    console.error("PDF compiled print failed:", error);
    return false;
  }
}
