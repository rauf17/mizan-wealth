<div align="center">
  <img src="https://raw.githubusercontent.com/rauf17/mizan-wealth/master/app/icon.svg" width="100" height="100" alt="Mizan Wealth Logo"/>

  # Mizan Wealth
  **Balance your wealth. Know what’s due.**

  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Privacy First](https://img.shields.io/badge/Privacy-Local_First-4CAF50?style=for-the-badge&logo=shield)](https://github.com/rauf17/mizan-wealth)
  [![Vercel Deploy](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://mizan-wealth.vercel.app/)

  <p align="center">
    A privacy-first, beautiful, and completely offline-capable Islamic finance dashboard built by Muslims, for Muslims.
  </p>
</div>

---

> *"And establish prayer and give Zakat, and whatever good you put forward for yourselves – you will find it with Allah."* 
> — (Surah Al-Baqarah 2:110)

## 🌙 Assalamu Alaikum, Brother!

Welcome to **Mizan Wealth**. Calculating Zakat, screening stocks for Shariah compliance, and managing your halal wealth shouldn't require complex spreadsheets or compromising your privacy by uploading your net worth to a random server.

Mizan Wealth is a unified, strictly local-first dashboard that respects your privacy and adheres to authentic Islamic jurisprudence (Fiqh). We built this so you can confidently calculate what you owe, purify your investments, and plan your financial future—all in one gorgeous interface.

### 🌟 Why Choose Mizan Wealth?

* **100% Private (Local-First):** Your financial data is sensitive. We use the browser's `localStorage` to save your assets and liabilities. Your net worth **never** leaves your device.
* **Exact Shariah Standards:** Automatically calculates Nisab using precise South Asian *Tola* conversions: **87.48g** for Gold and **612.36g** for Silver.
* **Hawl Automation:** Input when you acquired an asset, and Mizan will calculate if a full lunar year (354 days) has passed.
* **Multi-Lingual:** Full support for both English and **Urdu (اردو)**, with stunning Noto Nastaliq typography and full Right-To-Left (RTL) layout.
* **Dynamic Dark Mode:** A premium dark mode designed with muted gold and deep teal (Mizan colors) for night-time finance tracking.

---

## 🚀 Features

### 1. 📊 Advanced Zakat Engine
Enter your cash, business inventory, gold, silver, and deductable short-term liabilities. The engine connects to live metal spot prices to determine your exact Nisab threshold and calculates your 2.5% Zakat obligation down to the penny.

### 2. 📈 Stock Purity Screener
Not all stocks are Halal to invest in. Our built-in screener checks companies against standard AAOIFI compliance criteria:
- **Debt Ratio:** Must be < 33%
- **Interest Income Ratio:** Must be < 5%
- **Liquid Assets Ratio:** Must be < 33%
*Automatically estimates the **Dividend Purification Rate** so you know exactly how much charity to give to cleanse your returns.*

### 3. 🌱 Halal Growth Simulator
Project your financial future with a compound interest simulator that mathematically subtracts the annual 2.5% wealth tax (Zakat) and purification rates, giving you realistic Shariah-compliant growth models.

### 4. 📜 Mawarith (Inheritance) Modeler
A simple calculator to divide your estate according to explicit Quranic shares for spouses, parents, and children.

### 5. 🤖 AI Advisory Insights (Optional)
Connect your own Google Gemini API key to get personalized, actionable financial advice based purely on Islamic principles.

---

## 🛠️ Technology Stack

Mizan Wealth is built with the most modern web technologies to ensure lightning-fast performance and a premium user experience:

- **Framework:** [Next.js 14](https://nextjs.org/) (React App Router)
- **Styling:** [Tailwind CSS v3](https://tailwindcss.com/) with native CSS variable color mapping
- **Testing:** [Vitest](https://vitest.dev/)
- **AI Integration:** Google Gemini Flash Models
- **Icons:** Lucide React

---

## ⚙️ Getting Started (Run it Locally)

Want to run this yourself or contribute? It's easy!

### Prerequisites
Make sure you have Node.js 18+ installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rauf17/mizan-wealth.git
   cd mizan-wealth
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   ```bash
   cp .env.example .env.local
   ```
   *Optional:* Open `.env.local` and add your `METAL_PRICE_API_KEY` for live gold/silver prices, and `GEMINI_API_KEY` for AI features. If you skip this, the app gracefully falls back to reliable mock data.

4. **Run the local server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy Your Own

You can deploy your own private instance of Mizan Wealth to Vercel in 1 click for free:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rauf17/mizan-wealth)

1. Click the button above to clone and deploy.
2. In the Vercel setup, paste your `.env.local` keys into the Environment Variables section.
3. Deploy!

---

## ⚖️ Disclaimer
*Mizan Wealth is a financial planning and calculation tool. The calculated outputs, stock purity results, and simulated projections are provided for educational and organizational purposes. They do not constitute formal religious rulings (Fatwa) or certified financial advice. We always advise cross-referencing complex Zakat cases with local certified Islamic scholars.*

<div align="center">
  <br>
  <b>Built with Barakah. May Allah bless your wealth.</b>
</div>
