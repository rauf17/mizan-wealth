# Mizan Wealth

Mizan Wealth is a premium, local-first Shariah-compliant financial planning and wealth management web application. Designed around Islamic finance principles, Mizan allows users to manage their assets, calculate Zakat obligations, analyze stock compliance, simulate net halal compound yields, and model inheritance distribution legal shares—all with complete privacy as all calculations and records are processed and stored 100% locally in the browser.

---

## Core Features

### 1. Zakat Calculation Engine
* **Nisab Threshold Calculations**: Automatically determines the Nisab limit using live gold (85g standard) or silver (595g standard) spot prices.
* **Asset Classification**: Computes net eligible wealth across cash, precious metals, stock portfolios, real estate, and business trade inventory.
* **Hawl Rule Verification**: Safely checks the 354-day lunar holding constraint based on asset acquisition dates, with optional user overrides.
* **Deduction of Liabilities**: Subtracts short-term debts and bills before applying the standard Zakat rate:
  $$\text{Zakat Due} = (\text{Total Eligible Assets} - \text{Liabilities}) \times 2.5\%$$

### 2. Stock Compliance & Purification Screener
* **Financial Ratio Screening**: Evaluates stock tickers against strict Shariah thresholds (debt ratio < 33%, liquid cash ratio < 33%, non-compliant interest ratio < 5%).
* **Dividend Purification**: Computes the exact amount of dividend income to donate for purification based on compliance reports.

### 3. Growth Projection Modeler
* **Halal Compound Simulation**: Compounds principal balances and annual additions.
* **Integrated Deductions**: Simulates long-term net growth trends by optionally deducting annual Zakat (2.5%) and dividend purification ratios (e.g., 0.5%) at each compound interval.

### 4. Islamic Inheritance Modeler
* **Estate Distribution Calculations**: Deducts funeral expenses, debts, and bequest wills.
* **Juridical Heirs Allocation**: Computes legal fractions (e.g., $1/8$, $1/6$, $2/3$, or residuary shares) for spouses, parents, siblings, and children based on standard Islamic inheritance law.

### 5. AI Advisor Insights
* **Gemini AI Integration**: Analyzes assets and outputs tailored recommendations for Shariah positioning, wealth rebalancing, and charity/Sadaqah distribution.
* **Local Heuristics Fallback**: Runs a local rule engine that generates identical structured JSON guidelines offline if API keys are not supplied.

### 6. Reports & Export
* Generates formatted PDFs for Zakat compliance certificates.
* Exports detailed Excel spreadsheets summarizing asset classification and ledgers.

---

## 🛠️ Technology Stack
* **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Turbopack enabled)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Database/Backend**: None (Local Storage only)
* **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)

---

## ⚙️ Environment Configuration

Copy the template environment variables:
```bash
cp .env.example .env.local
```

Define the keys in `.env.local`:
* `METAL_PRICE_API_KEY`: API key for fetching dynamic spot rates.
* `GEMINI_API_KEY` or `GOOGLE_API_KEY`: Google Gemini API key to power the AI advisor.

---

## 🚀 Getting Started

### 1. Installation
Install the project dependencies:
```bash
npm install
```

### 2. Development Server
Start the development server with Turbopack:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Testing
Execute the unit testing suites:
```bash
npm run test
```
To run tests in interactive watch mode:
```bash
npm run test:watch
```

### 4. Build for Production
Create an optimized production bundle:
```bash
npm run build
```
Verify the build compiles successfully and starts:
```bash
npm run start
```
