import { Category, TripGoal, Transaction } from '@/models';

const defaultCategories: Category[] = [
  { id: 'food', name: 'Food', icon: 'fork-knife', colorHex: '#f97316', monthlyLimitCAD: 350, carryOver: false, sortOrder: 0 },
  { id: 'transport', name: 'Transport', icon: 'car', colorHex: '#38bdf8', monthlyLimitCAD: 150, carryOver: true, sortOrder: 1 },
  { id: 'housing', name: 'Housing', icon: 'home', colorHex: '#a855f7', monthlyLimitCAD: 400, carryOver: false, sortOrder: 2 },
  { id: 'fun', name: 'Fun', icon: 'party-popper', colorHex: '#f43f5e', monthlyLimitCAD: 200, carryOver: false, sortOrder: 3 },
  { id: 'misc', name: 'Misc', icon: 'tray', colorHex: '#94a3b8', monthlyLimitCAD: 150, carryOver: false, sortOrder: 4 },
  { id: 'trip-fund', name: 'Trip Fund', icon: 'airplane', colorHex: '#22c55e', monthlyLimitCAD: 500, carryOver: true, sortOrder: 5 },
  { id: 'sinking-fund', name: 'Sinking Fund', icon: 'wallet', colorHex: '#facc15', monthlyLimitCAD: 250, carryOver: true, sortOrder: 6 }
];

const defaultTripGoal = (): TripGoal => {
  const deadline = new Date('2026-01-01T00:00:00Z');
  const now = new Date();
  const weeksRemaining = Math.max(1, Math.round((deadline.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  const target = 10000;
  const current = 0;
  const autoWeekly = Math.max(0, (target - current) / weeksRemaining);
  return {
    targetCAD: target,
    deadline: deadline.toISOString(),
    currentSavedCAD: current,
    autoSaveWeeklyCAD: autoWeekly
  };
};

interface StoreState {
  categories: Category[];
  transactions: Transaction[];
  tripGoal?: TripGoal;
}

export class DataStore {
  private state: StoreState = { categories: [], transactions: [] };
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    this.state.categories = [...defaultCategories];
    this.state.tripGoal = defaultTripGoal();
    this.initialized = true;
  }

  getCategories(): Category[] {
    return [...this.state.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  getTripGoal(): TripGoal | undefined {
    return this.state.tripGoal ? { ...this.state.tripGoal } : undefined;
  }

  getTransactions(): Transaction[] {
    return [...this.state.transactions];
  }

  addTransaction(transaction: Transaction): void {
    this.state.transactions = [transaction, ...this.state.transactions];
  }
}
