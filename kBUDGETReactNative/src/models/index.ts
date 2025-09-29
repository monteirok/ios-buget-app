export interface FxRate {
  code: string;
  rateToCAD: number;
  date: string; // ISO string
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  colorHex: string;
  monthlyLimitCAD: number;
  carryOver: boolean;
  sortOrder: number;
}

export interface BudgetPeriod {
  id: string;
  month: number;
  year: number;
  categoryId: string;
  allocatedCAD: number;
  carriedOverCAD: number;
}

export interface Transaction {
  id: string;
  date: string;
  amountOriginal: number;
  currencyCode: string;
  amountCAD: number;
  categoryId: string;
  merchant?: string;
  note?: string;
  photoUri?: string;
}

export interface TripGoal {
  targetCAD: number;
  deadline: string;
  currentSavedCAD: number;
  autoSaveWeeklyCAD: number;
}
