export type AssetType =
  | "cash"
  | "gold"
  | "silver"
  | "stock"
  | "real_estate"
  | "business"
  | "crypto"
  | "other";

export interface ZakatAsset {
  id: string;
  type: AssetType;
  name: string;
  value: number;
  zakatableAmount: number;
  notes?: string;
  createdAt: string;
}

export interface MetalRates {
  goldPerGram: number;
  silverPerGram: number;
  lastUpdated: string;
}

export interface ZakatCalculationResult {
  totalAssets: number;
  totalLiabilities: number;
  netZakatable: number;
  nisabThreshold: number;
  zakatDue: number;
  rate: number; // typically 0.025 (2.5%)
  isNisabReached: boolean;
  calculationDate: string;
}

export interface StockPurityInfo {
  ticker: string;
  name: string;
  compliant: boolean;
  debtRatio: number; // e.g. Debt/MarketCap (usually < 33%)
  cashRatio: number; // e.g. Cash + Interest Securities / MarketCap (usually < 33%)
  interestIncomeRatio: number; // e.g. Non-operating interest income / Total Revenue (usually < 5%)
  purificationRate: number; // e.g. Dividend purification ratio (percentage to purify)
  lastUpdated: string;
}

export interface PortfolioStock {
  ticker: string;
  sharesCount: number;
  averageCost: number;
  currentPrice: number;
  purityInfo?: StockPurityInfo;
}

export interface GrowthProjectionInput {
  principal: number;
  annualContribution: number;
  expectedReturnRate: number; // e.g. 0.08 for 8%
  durationYears: number;
  zakatDeductionEnabled: boolean;
  purificationDeductionEnabled: boolean;
  purificationRate: number; // e.g. 0.005 for 0.5%
}

export interface GrowthProjectionYear {
  year: number;
  startingBalance: number;
  contributions: number;
  investmentGains: number;
  zakatDeducted: number;
  purifiedDeducted: number;
  endingBalance: number;
}

export interface HeirInput {
  relation:
    | "husband"
    | "wife"
    | "son"
    | "daughter"
    | "father"
    | "mother"
    | "grandfather"
    | "grandmother"
    | "full_brother"
    | "full_sister"
    | "consanguine_brother"
    | "consanguine_sister"
    | "uterine_brother"
    | "uterine_sister";
  count: number;
}

export interface HeirResult {
  relation: string;
  count: number;
  shareFraction: string; // e.g. "1/8", "1/6", "2/3", or "Residuary"
  shareValue: number;
  totalGroupValue: number;
}

export interface InheritanceCalculationResult {
  totalEstateValue: number;
  debtsDeducted: number;
  funeralExpensesDeducted: number;
  willsDeducted: number;
  netEstateValue: number;
  heirs: HeirResult[];
  unallocatedResidue: number;
  calculationDate: string;
}
