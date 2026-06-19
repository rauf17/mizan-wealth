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

    let structuredOutput = {
      position: "",
      optimization: "",
      donations: ""
    };
    let source = "Mizan Heuristic Rule Engine (Local Fallback)";

    if (apiKey) {
      const promptText = `
You are Mizan Wealth Advisor, a Shariah-compliant financial planner.
Analyze the user's wealth position and provide Shariah financial advice.

Tone and Language Guidelines:
- Keep the language calm, factual, and strictly objective.
- Do NOT use exclamation marks, hype words, or emotional language.
- Frame suggestions neutrally as options or general advice for the user's consideration.

Assets Checklist:
${assets.map(a => `- ${a.name} (${a.type}): Market Value = $${a.value}, Zakatable Amount = $${a.zakatableAmount}, Acquired = ${a.acquisitionDate}`).join("\n")}

Zakat Calculation Summary:
- Total Assets: $${calculation.totalAssets}
- Total Liabilities: $${calculation.totalLiabilities}
- Net Zakatable Assets: $${calculation.netZakatable}
- Nisab Threshold (standard): $${calculation.nisabThreshold}
- Zakat Due (2.5%): $${calculation.zakatDue}
- Nisab Reached: ${calculation.isNisabReached ? "YES" : "NO"}

You MUST respond ONLY with a raw JSON object in this format (do not wrap in markdown \`\`\`json blocks):
{
  "position": "A short 1-2 sentence paragraph summarizing their current Zakat status and whether Nisab is met.",
  "optimization": "2 bullet points of custom wealth optimization tips (rebalancing cash, purification on stock dividends, debt planning) in markdown format.",
  "donations": "2 bullet points of donation recommendations (where to distribute Zakat e.g. local charities, relatives, verified Asnaf channels) in markdown format."
}
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
            next: { revalidate: 600 }
          }
        );

        if (geminiRes.ok) {
          const resData = await geminiRes.json();
          let rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          // Clean up markdown block wraps if returned by the LLM
          rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          
          const parsed = JSON.parse(rawText);
          if (parsed.position && parsed.optimization && parsed.donations) {
            structuredOutput = parsed;
            source = "Gemini AI Advisor";
          }
        }
      } catch (geminiError) {
        console.warn("Structured Gemini parse failed, falling back to local:", geminiError);
      }
    }

    // If Gemini key was missing, or the call/parsing failed, populate with the local rule engine
    if (!structuredOutput.position) {
      // 1. Shariah Position Summary
      if (calculation.isNisabReached) {
        structuredOutput.position = `Your net assets ($${calculation.netZakatable.toLocaleString()}) exceed the Nisab threshold ($${calculation.nisabThreshold.toLocaleString()}). Zakat is mandatory at the standard rate of 2.5%, amounting to $${calculation.zakatDue.toLocaleString()}.`;
      } else {
        structuredOutput.position = `Your net assets ($${calculation.netZakatable.toLocaleString()}) are below the Nisab threshold ($${calculation.nisabThreshold.toLocaleString()}). Zakat is not currently mandatory.`;
      }

      // 2. Wealth Optimization Tips
      const optBullets: string[] = [];
      const stockAssets = assets.filter(a => a.type === "stock");
      const cashAssets = assets.filter(a => a.type === "cash");
      const totalCash = cashAssets.reduce((sum, a) => sum + a.value, 0);
      const cashPct = calculation.totalAssets > 0 ? (totalCash / calculation.totalAssets) * 100 : 0;

      if (cashPct > 50) {
        optBullets.push(`**Rebalance Cash Liquidity**: Over ${Math.round(cashPct)}% of your wealth is liquid. Consider rebalancing into halal investments to avoid purchasing power erosion from inflation.`);
      } else {
        optBullets.push(`**Wealth Preservation**: Maintain a cash emergency reserve of 3-6 months of expenses, ensuring it is held in non-interest-bearing checking/savings accounts.`);
      }

      if (stockAssets.length > 0) {
        optBullets.push(`**Dividend Purification**: Apply screens to your stock assets. Purify non-compliant gains by donating dividend portions matching purification ratios to charity.`);
      } else {
        optBullets.push(`**Asset Diversification**: Explore Shariah-compliant equity funds, Sukuk, or physical precious metals to grow your wealth in a halal manner.`);
      }

      if (calculation.totalLiabilities > 0) {
        optBullets.push(`**Settle Active Debts**: Plan to pay down outstanding liabilities ($${calculation.totalLiabilities.toLocaleString()}) to decrease Zakat burdens and secure your financial foundation.`);
      }

      structuredOutput.optimization = optBullets.map(b => `- ${b}`).join("\n");

      // 3. Donation Recommendations
      const donationBullets: string[] = [];
      if (calculation.isNisabReached) {
        donationBullets.push(`**Asnaf Distribution**: Plan the distribution of your due Zakat ($${calculation.zakatDue.toLocaleString()}) to the eight eligible categories defined in the Quran (focusing on the poor, needy, and debt-ridden).`);
        donationBullets.push(`**Immediate Relatives**: Prioritize distributing Zakat to relatives in need (excluding dependents like parents/children), which earns double reward (charity + strengthening family ties).`);
      } else {
        donationBullets.push(`**Voluntary Sadaqah**: Since Zakat is not mandatory, consider setting up a monthly voluntary Sadaqah program to support community causes and bring blessings to your wealth.`);
        donationBullets.push(`**Local Charity focus**: Direct regular donations to local food banks, educational initiatives, or orphans support organizations.`);
      }

      structuredOutput.donations = donationBullets.map(b => `- ${b}`).join("\n");
    }

    return NextResponse.json({
      insights: structuredOutput,
      source
    });
  } catch (error) {
    console.error("Advisory insights parsing exception:", error);
    return NextResponse.json(
      { error: "Server error during structured advisory compilation." },
      { status: 500 }
    );
  }
}
