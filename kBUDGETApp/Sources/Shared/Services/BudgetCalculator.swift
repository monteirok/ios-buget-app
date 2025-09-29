import Foundation

struct BudgetSnapshot {
    let categoryId: UUID
    let allocated: Double
    let carriedOver: Double
    let spent: Double

    var remaining: Double {
        max(0, (allocated + carriedOver) - spent)
    }
}

struct TripProgress {
    let totalSaved: Double
    let target: Double
    let delta: Double
    let onTrack: Bool
}

protocol BudgetCalculating {
    func snapshot(for category: Category, transactions: [Transaction], period: DateInterval) -> BudgetSnapshot
    func tripProgress(goal: TripGoal, transactions: [Transaction], upTo date: Date) -> TripProgress
    func dailyAllowance(remainingThisMonth: Double, daysRemaining: Int) -> Double
    func projectedMonthEnd(spendLast7Days: Double, daysObserved: Int, daysRemaining: Int) -> Double
}

struct BudgetCalculator: BudgetCalculating {
    private let calendar: Calendar

    init(calendar: Calendar = .current) {
        self.calendar = calendar
    }

    func snapshot(for category: Category, transactions: [Transaction], period: DateInterval) -> BudgetSnapshot {
        let spent = transactions
            .filter { $0.category.id == category.id && period.contains($0.date) }
            .reduce(0) { $0 + $1.amountCAD }

        let allocated = category.monthlyLimitCAD
        return BudgetSnapshot(categoryId: category.id, allocated: allocated, carriedOver: 0, spent: spent)
    }

    func tripProgress(goal: TripGoal, transactions: [Transaction], upTo date: Date) -> TripProgress {
        let savingsTransactions = transactions
            .filter { $0.category.name == "Trip Fund" && $0.date <= date }
            .reduce(0) { $0 + $1.amountCAD }

        let totalSaved = goal.currentSavedCAD + savingsTransactions
        let delta = totalSaved - goal.targetCAD
        return TripProgress(totalSaved: totalSaved, target: goal.targetCAD, delta: delta, onTrack: delta >= 0)
    }

    func dailyAllowance(remainingThisMonth: Double, daysRemaining: Int) -> Double {
        guard daysRemaining > 0 else { return 0 }
        return remainingThisMonth / Double(daysRemaining)
    }

    func projectedMonthEnd(spendLast7Days: Double, daysObserved: Int, daysRemaining: Int) -> Double {
        guard daysObserved > 0 else { return 0 }
        let average = spendLast7Days / Double(daysObserved)
        return average * Double(daysRemaining)
    }
}
