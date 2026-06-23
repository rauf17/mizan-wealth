# Mizan Wealth

> **Balance your wealth. Know what’s due.**

Mizan Wealth is a privacy-first, local-first financial planning and Zakat calculation tool built for modern Islamic ethical finance. Built around the concept of *Mizan* (the balance scale of justice and measurement), the application provides individuals with structured tools to track assets, screen stock portfolios for compliance, model compound returns, and calculate estate inheritance shares—all with complete privacy as user data never leaves the browser.

---

### Project Badges

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwind-css)
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?style=flat-square&logo=vitest)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?style=flat-square&logo=google-gemini)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## The Problem

Calculating Zakat and managing Shariah-compliant wealth involves multiple technical calculations that lead to user confusion or errors:
* **Fluctuating Nisab Thresholds**: The minimum wealth threshold (Nisab) depends on live spot prices of gold (85g) or silver (595g), requiring manual calculation and conversions.
* **Asset Classification Rules**: Different asset classes (liquid cash, stock portfolios, physical precious metals, rental real estate, business inventory) carry distinct zakatable ratios and treatment.
* **Temporal Rules (Hawl)**: Assets must be held for a full lunar year (354 days) before Zakat is due, requiring tracking of acquisition timelines.
* **Liability Deductions**: Determining which short-term debts, bills, or loans can be legally deducted from gross eligible wealth is complex.
* **Purification Screeners**: Stock assets must be screened against debt, cash, and interest income ratios, and non-compliant dividend portions must be purified through charity.
* **Privacy Concerns**: Personal financial ledger data is sensitive; uploading balance sheets to external databases deters users from utilizing digital planners.

## The Solution

Mizan Wealth addresses these challenges by introducing a unified, local-first web application:
1. **Live Rate Integration**: Retrieves spot commodity market rates automatically to compute exact Nisab limits.
2. **Hawl Rule Automation**: Automatically tracks lunar year holding requirements based on recorded acquisition dates.
3. **Structured Portfolio Ledgers**: Replaces basic spreadsheets with structured card inventories that distinguish gross market value from zakatable amounts.
4. **Integrated Growth Modeler**: Simulates net wealth growth over time by auto-deducting Zakat (2.5%) and stock purification allocations.
5. **Privacy-First Architecture**: Stores all balance records, ledger items, and configuration settings offline using the browser's localStorage.

---

## Philosophy & Core Principles

* **Trust & Privacy**: Personal wealth statistics should remain private. Mizan operates entirely client-side. The application does not require user accounts, tracking cookies, or external backend databases.
* **Juridical Accuracy**: Calculations utilize standard Shariah principles for asset valuation and liability deductions. The Silver Nisab standard is recommended as the default to maximize support for eligible recipients.
* **Clarity over Complexity**: Financial planning interfaces should feel calm, structured, and informative. The design system uses muted teals and golds with clear typography to support analytical focus.

---

## Core Modules

### 1. Zakat Engine
* **Dynamic Nisab Standards**: Supports both Gold (85g) and Silver (595g) standards.
* **Short-Term Debt Deduction**: Formulates net zakatable positions:
  $$\text{Net Zakatable} = \max(0, \text{Eligible Assets} - \text{Liabilities})$$
* **Hawl Verification**: Performs day-difference calculations to verify if a lunar year has passed since asset acquisition.

### 2. Stock Compliance Screener
* **Financial Ratio Testing**: Screens equities based on standard AAOIFI compliance criteria (debt to market value, liquid cash to assets, and interest income).
* **Purification Calculator**: Directs the user on exact purification amounts required for dividend distributions.

### 3. Growth Simulator
* **Deduction-Aware Projections**: Simulates compound return yields over 1 to 30 years while accounting for the erosion effects of annual Zakat (2.5%) and custom purification percentages.

### 4. Inheritance Modeler
* **Estate Distribution**: Calculates legal fractions for immediate heirs (spouses, parents, children, and siblings) in accordance with Islamic estate jurisprudence.

### 5. AI Advisor Insights
* **Gemini Integration**: Uses a server-side API proxy to compile custom portfolio summaries and suggestions.
* **Local Fallback**: Automatically falls back to a local heuristic rules engine if Gemini credentials are not supplied, ensuring full offline functionality.

---

## Technical Architecture

```mermaid
graph TD
    A[Browser Client] -->|Reads/Writes| B[(Local Storage)]
    A -->|API Request| C[Next.js Edge Proxy API]
    C -->|Fetch Metal Rates| D[Metalprice API / Gold Price Feed]
    C -->|Fetch Insights| E[Google Gemini AI Models]
    
    subgraph Privacy Boundary (Local Device)
        A
        B
    end
```

The application is structured to decouple sensitive data from network requests:
* **Local Processing**: All ledger records, calculations, calculations history logs, and overrides reside solely in the user's browser memory via the Web Storage API.
* **Serverless Proxies**: Server routes (`/api/prices` and `/api/ai/insights`) act as transient, stateless proxies to retrieve external rates or generate AI recommendations. No financial figures or user inputs are logged on the server.

---

## Screenshots

*Below are visual layouts of the primary user interfaces in Mizan Wealth.*

### 1. Position Overview Dashboard
```
┌────────────────────────────────────────────────────────────────────────┐
│  Mizan Position Overview                                               │
├────────────────────────────────────────────────────────────────────────┤
│  ZAKAT DUE (2.5%)                                       [ ABOVE NISAB ]│
│  $1,245.50                                                             │
├──────────────────────────────────────┬─────────────────────────────────┤
│  Gross Assets: $55,000.00            │  Precious Metal Rates           │
│  Liabilities: -$5,180.00             │  Gold: $75.50/g                 │
│  Net Zakatable: $49,820.00           │  Silver: $0.95/g                │
└──────────────────────────────────────┴─────────────────────────────────┘
```
*(Placeholder for: `/public/screenshots/dashboard_overview.png`)*

### 2. Asset & Liability Inventory Ledger
```
┌────────────────────────────────────────────────────────────────────────┐
│  Asset & Liability Ledger                                              │
├──────────────────────────────────────┬─────────────────────────────────┤
│  [ Add Asset ]                       │  Asset Inventory Ledger         │
│  Type: Cash / Bank savings           │  Chase Savings Account (Cash)   │
│  Description: Chase Savings          │  Value: $10,000.00              │
│  Value ($): 10000.00                 │  Zakatable: $10,000.00          │
│  Zakatable %: 100                    │                                 │
└──────────────────────────────────────┴─────────────────────────────────┘
```
*(Placeholder for: `/public/screenshots/assets_ledger.png`)*

---

## Technology Stack

* **Framework**: Next.js 14 (React Server Components, App Router)
* **Language**: TypeScript (Strict typing configuration)
* **Styling**: Tailwind CSS (CSS variables design tokens system)
* **Charts**: SVG-based custom mathematical visualization graphs (no heavy third-party graphing libraries)
* **Testing**: Vitest & React Testing Library
* **Build Tool**: Next.js Compiler (SWC)

---

## Getting Started

### 1. Prerequisites
Ensure you have Node.js 18.x or later installed on your system.

### 2. Environment Configuration
Create a `.env.local` configuration file in the project root:
```bash
cp .env.example .env.local
```

Define the optional keys:
```env
# Optional: API key to retrieve live spot metal rates (metalpriceapi.com)
METAL_PRICE_API_KEY=your_api_key_here

# Optional: Google Gemini API key to activate AI Advisory recommendations
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Installation
Install the required packages:
```bash
npm install
```

### 4. Run Development Server
Launch the development environment:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Test Suite
Validate calculations, state changes, and edge-case behaviors:
```bash
npm run test
```

---

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/mizan-wealth)
<!-- Note: Please replace YOUR_USERNAME in the URL above with your actual GitHub username -->

1. Push to GitHub
2. Connect repo on vercel.com
3. Add GEMINI_API_KEY and METAL_PRICE_API_KEY in Vercel project Settings → Environment Variables (both are optional)
4. Deploy

---

## Disclaimer

Mizan Wealth is a financial planning calculation tool. The calculated outputs, simulated growth projections, and advisory responses generated by the Gemini model or fallback heuristic engine are provided for educational and illustrative purposes. They do not constitute formal religious rulings (Fatwa) or certified financial planning declarations. Users are advised to cross-reference calculations with local scholars or financial advisors.
