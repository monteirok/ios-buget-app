import { Category, Transaction, TripGoal } from '@/models';

export interface BudgetSnapshot {
  categoryId: string;
  allocated: number;
  carriedOver: number;
  spent: number;
  remaining: number;
}

export interface TripProgress {
  totalSaved: number;
  target: number;
  delta: number;
  onTrack: boolean;
}

export const snapshotForCategory = (
  category: Category,
  transactions: Transaction[],
  monthStart: Date,
  monthEnd: Date
): BudgetSnapshot => {
  const spent = transactions
    .filter((t) => t.categoryId === category.id)
    .filter((t) => {
      const date = new Date(t.date);
      return date >= monthStart && date <= monthEnd;
    })
    .reduce((sum, t) => sum + t.amountCAD, 0);

  const remaining = Math.max(0, category.monthlyLimitCAD + 0 - spent);

  return {
    categoryId: category.id,
    allocated: category.monthlyLimitCAD,
    carriedOver: 0,
    spent,
    remaining
  };
};

export const tripProgress = (goal: TripGoal, transactions: Transaction[], upTo: Date): TripProgress => {
  const saved = transactions
    .filter((t) => t.categoryId === 'trip-fund')
    .filter((t) => new Date(t.date) <= upTo)
    .reduce((sum, t) => sum + t.amountCAD, 0);

  const totalSaved = goal.currentSavedCAD + saved;
  const delta = totalSaved - goal.targetCAD;
  return {
    totalSaved,
    target: goal.targetCAD,
    delta,
    onTrack: delta >= 0
  };
};

export const dailyAllowance = (remaining: number, daysRemaining: number): number => {
  if (daysRemaining <= 0) {
    return 0;
  }
  return remaining / daysRemaining;
};

export const projectedMonthEnd = (
  spendLast7Days: number,
  daysObserved: number,
  daysRemaining: number
): number => {
  if (daysObserved <= 0) {
    return 0;
  }
  const average = spendLast7Days / daysObserved;
  return average * daysRemaining;
};
