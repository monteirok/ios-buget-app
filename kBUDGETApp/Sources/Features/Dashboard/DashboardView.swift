import SwiftUI

struct DashboardView: View {
    @Environment(\.calendar) private var calendar
    @Query(sort: \Category.sortOrder) private var categories: [Category]
    @Query(sort: \Transaction.date, order: .reverse) private var transactions: [Transaction]
    @Query private var tripGoals: [TripGoal]

    private let calculator = BudgetCalculator()

    private var tripProgress: TripProgress? {
        guard let goal = tripGoals.first else { return nil }
        return calculator.tripProgress(goal: goal, transactions: transactions, upTo: Date())
    }

    private var categorySummaries: [CategoryRowModel] {
        guard let monthInterval = calendar.dateInterval(of: .month, for: Date()) else { return [] }
        return categories.map { category in
            let snapshot = calculator.snapshot(for: category, transactions: transactions, period: monthInterval)
            return CategoryRowModel(
                id: category.id,
                name: category.name,
                remaining: snapshot.remaining,
                total: snapshot.allocated + snapshot.carriedOver,
                color: Color(hex: category.colorHex)
            )
        }
    }

    private var todayRemaining: Double {
        guard let monthInterval = calendar.dateInterval(of: .month, for: Date()) else { return 0 }
        let remaining = remainingThisMonth(interval: monthInterval)
        let daysRemaining = calendar.dateComponents([.day], from: Date(), to: monthInterval.end).day ?? 0
        return calculator.dailyAllowance(remainingThisMonth: remaining, daysRemaining: daysRemaining)
    }

    private var weekRemaining: Double {
        guard let monthInterval = calendar.dateInterval(of: .month, for: Date()) else { return 0 }
        let remaining = remainingThisMonth(interval: monthInterval)
        guard let weekInterval = calendar.dateInterval(of: .weekOfYear, for: Date()) else { return remaining }
        let daysRemaining = max(0, calendar.dateComponents([.day], from: Date(), to: weekInterval.end).day ?? 0)
        return calculator.dailyAllowance(remainingThisMonth: remaining, daysRemaining: daysRemaining)
    }

    private func remainingThisMonth(interval: DateInterval) -> Double {
        let totalAllocated = categories.reduce(0) { $0 + $1.monthlyLimitCAD }
        let spent = transactions.filter { interval.contains($0.date) }.reduce(0) { $0 + $1.amountCAD }
        return max(0, totalAllocated - spent)
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                TripProgressCard(progress: tripProgress)
                SpendSummaryList(todayRemaining: todayRemaining, weekRemaining: weekRemaining, categories: categorySummaries)
                Spacer()
            }
            .padding()
            .navigationTitle("kBUDGET")
            .toolbar {
                ToolbarItem(placement: .bottomBar) {
                    AddExpenseButton()
                }
            }
        }
    }
}

private struct TripProgressCard: View {
    let progress: TripProgress?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Trip Progress")
                .font(.headline)

            if let progress {
                let percent = progress.target > 0 ? progress.totalSaved / progress.target : 0
                ProgressView(value: min(percent, 1)) {
                    Text("\(Int(percent * 100))% saved")
                } currentValueLabel: {
                    Text("$\(progress.totalSaved, format: .number.precision(.fractionLength(0))) / $\(progress.target, format: .number.precision(.fractionLength(0)))")
                }

                Text(progress.onTrack ? "You're on track." : "You're behind by $\(abs(progress.delta), format: .number.precision(.fractionLength(0))).")
                    .font(.subheadline)
                    .foregroundStyle(progress.onTrack ? .green : .red)
            } else {
                Text("Set your trip goal to start tracking progress.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

private struct SpendSummaryList: View {
    let todayRemaining: Double
    let weekRemaining: Double
    let categories: [CategoryRowModel]

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                VStack(alignment: .leading) {
                    Text("Today Remaining")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text(todayRemaining, format: .currency(code: "CAD"))
                        .font(.title3)
                        .bold()
                }
                Spacer()
                VStack(alignment: .leading) {
                    Text("Week Remaining")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Text(weekRemaining, format: .currency(code: "CAD"))
                        .font(.title3)
                        .bold()
                }
            }

            VStack(alignment: .leading, spacing: 12) {
                Text("Categories")
                    .font(.headline)
                ForEach(categories) { category in
                    CategoryRemainingRow(category: category)
                }
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

private struct CategoryRemainingRow: View {
    let category: CategoryRowModel

    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Text(category.name)
                    .font(.subheadline)
                Spacer()
                Text("$\(Int(category.remaining)) of $\(Int(category.total))")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            ProgressView(value: category.progress)
                .tint(category.color)
        }
    }
}

private struct CategoryRowModel: Identifiable {
    let id: UUID
    let name: String
    let remaining: Double
    let total: Double
    let color: Color

    var progress: Double {
        guard total > 0 else { return 0 }
        return max(0, min(1, (total - remaining) / total))
    }
}

private extension Color {
    init(hex: String) {
        var hexSanitized = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hexSanitized).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hexSanitized.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

private struct AddExpenseButton: View {
    var body: some View {
        NavigationLink {
            AddExpenseView()
        } label: {
            Label("Add Expense", systemImage: "plus.circle.fill")
                .font(.title3)
        }
    }
}

#Preview {
    DashboardView()
        .modelContainer(for: [Category.self, Transaction.self, TripGoal.self])
}
