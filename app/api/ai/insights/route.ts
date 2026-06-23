import { NextResponse } from "next/server";
import { ZakatAsset, ZakatCalculationResult } from "../../../../types";

interface InsightRequestPayload {
  assets: ZakatAsset[];
  calculation: ZakatCalculationResult;
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    
    const rateData = rateLimitMap.get(ip);
    if (rateData) {
      if (now > rateData.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      } else {
        if (rateData.count >= RATE_LIMIT_MAX) {
          return NextResponse.json(
            { error: "Rate limit exceeded" },
            { status: 429 }
          );
        }
        rateData.count += 1;
      }
    } else {
      rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    }

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
You are Mizan Wealth Advisor, a Shariah-compliant financial planning assistant.
Analyze the user's wealth position and provide conservative, Shariah-compliant financial observations.

Tone and Language Guidelines:
- Keep the language calm, factual, and strictly objective. Do not use exclamation marks, emotional appeal, or startup hype words.
- Do NOT provide formal, binding religious rulings (Fatwa) or speculative financial advice.
- Frame all insights and suggestions as options for the user's consideration, referencing that they should consult local scholars or certified planners.

Strict Information Bounds:
- Base all observations ONLY on the provided assets and liabilities checklist. Do not assume or hallucinate outside assets.
- If no stock assets are present, do not provide detailed equity screening or purification advice; tailor advice to cash or metals.
- If assets are below Nisab, emphasize that Zakat is not mandatory, and suggest voluntary charity (Sadaqah) as an option.

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
  "position": "A short, factual 1-2 sentence paragraph summarizing current Zakat liability and Nisab standard compliance based strictly on the summary.",
  "optimization": "2 bullet points in markdown format highlighting potential risks (e.g., inflation cash erosion, dividend purification requirements, or debt liability burden) and conservative wealth suggestions based on their assets.",
  "donations": "2 bullet points in markdown format detailing conservative donation channels (distributing to the eight Quranic Asnaf categories or voluntary Sadaqah channels) based on their Zakat status."
}
`;

      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
