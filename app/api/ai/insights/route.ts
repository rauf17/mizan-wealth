import { NextResponse } from "next/server";
import { ZakatAsset, ZakatCalculationResult } from "../../../../types";

interface InsightRequestPayload {
  assets: ZakatAsset[];
  calculation: ZakatCalculationResult;
}

export async function POST(req: Request) {
  try {
    const body: InsightRequestPayload = await req.json();
    const { assets, calculation } = body;

    if (!assets || !calculation) {
      return NextResponse.json(
        { error: "Invalid payload: 'assets' and 'calculation' are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (apiKey) {
      // Setup the prompt for Gemini
      const promptText = `
You are Mizan Wealth Advisor, a Shariah-compliant financial planner.
Analyze the user's wealth position and provide 3-4 bullet points of concise, highly actionable Shariah financial advice in Markdown format.

Assets Checklist:
${assets.map(a => `- ${a.name} (${a.type}): Market Value = $${a.value}, Zakatable Amount = $${a.zakatableAmount}, Acquired = ${a.acquisitionDate}`).join("\n")}

Zakat Calculation Summary:
- Total Assets: $${calculation.totalAssets}
- Total Liabilities: $${calculation.totalLiabilities}
- Net Zakatable Assets: $${calculation.netZakatable}
- Nisab Threshold (standard): $${calculation.nisabThreshold}
- Zakat Due (2.5%): $${calculation.zakatDue}
- Nisab Reached: ${calculation.isNisabReached ? "YES" : "NO"}

Guidance requirements:
- Keep recommendations specific to the asset composition.
- Highlight Zakat obligations or Nisab warnings.
- Mention dividend purification if they hold stock assets.
- Frame points under Islamic wealth management goals (e.g. growth, purification, preservation, social charity).
- Keep sentences concise. Avoid introductory boilerplate.
`;

      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }]
            }),
            next: { revalidate: 600 } // cache for 10 minutes
          }
        );

        if (geminiRes.ok) {
          const resData = await geminiRes.json();
          const insightText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (insightText) {
            return NextResponse.json({
              insights: insightText,
              source: "Gemini AI Advisor"
            });
          }
        }
        console.warn("Gemini API call returned non-OK status, falling back to local engine.");
      } catch (geminiError) {
        console.error("Gemini API call exception:", geminiError);
      }
    }

    // Local heuristic insights advisor (fallback)
    const localRecommendations: string[] = [];

    // Rule 1: Nisab status check
    if (calculation.isNisabReached) {
      localRecommendations.push(
        `**Zakat Obligation**: Your net assets ($${calculation.netZakatable.toLocaleString()}) exceed the Nisab threshold ($${calculation.nisabThreshold.toLocaleString()}). A Zakat amount of **$${calculation.zakatDue.toLocaleString()}** (2.5%) is mandatory. Plan its distribution to eligible recipients (Asnaf).`
      );
    } else {
      localRecommendations.push(
        `**Nisab Status**: Your net assets ($${calculation.netZakatable.toLocaleString()}) are currently below the Nisab threshold ($${calculation.nisabThreshold.toLocaleString()}). Zakat is not due. However, giving voluntary charity (*Sadaqah*) is highly recommended to purify your wealth.`
      );
    }

    // Rule 2: Asset liquidity check
    const cashAssets = assets.filter(a => a.type === "cash");
    const totalCashVal = cashAssets.reduce((sum, a) => sum + a.value, 0);
    const cashPercent = calculation.totalAssets > 0 ? (totalCashVal / calculation.totalAssets) * 100 : 0;
    if (cashPercent > 50) {
      localRecommendations.push(
        `**Cash Liquidity**: Over ${Math.round(cashPercent)}% of your wealth is held in cash savings. To protect your wealth against inflation and support the community economy, consider reallocating cash into productive, Shariah-compliant equities or investment funds.`
      );
    }

    // Rule 3: Stock asset check (purification)
    const stockAssets = assets.filter(a => a.type === "stock");
    if (stockAssets.length > 0) {
      const stockVal = stockAssets.reduce((sum, a) => sum + a.value, 0);
      localRecommendations.push(
        `**Dividend Purification**: You hold stock investments totaling $${stockVal.toLocaleString()}. Ensure you screen your portfolio tickers (like Apple, Microsoft) for debt/cash purity ratios and purify any non-operating interest dividend gains.`
      );
    }

    // Rule 4: Liabilities check
    if (calculation.totalLiabilities > 0) {
      localRecommendations.push(
        `**Liabilities Check**: Your current outstanding deductions stand at $${calculation.totalLiabilities.toLocaleString()}. While short-term liabilities reduce your net zakatable wealth, it is recommended to pay off interest-bearing debts first to secure peace of mind and barakah.`
      );
    }

    // Format output as Markdown bullets
    const insightsMarkdown = localRecommendations.map(rec => `- ${rec}`).join("\n\n");

    return NextResponse.json({
      insights: insightsMarkdown,
      source: "Mizan Heuristic Rule Engine (Local Fallback)"
    });
  } catch (error) {
    console.error("Advisory insights generation failed:", error);
    return NextResponse.json(
      { error: "Server error during advisory compiling." },
      { status: 500 }
    );
  }
}
