import Foundation
import SwiftData

@MainActor
final class DataController: ObservableObject {
    let container: ModelContainer
    private let calendar: Calendar
    @Published var isSeeded: Bool = false

    init(inMemory: Bool = false, calendar: Calendar = .current) {
        self.calendar = calendar

        let schema = Schema([
            FxRate.self,
            Category.self,
            BudgetPeriod.self,
            Transaction.self,
            TripGoal.self
        ])

        let configuration = ModelConfiguration(isStoredInMemoryOnly: inMemory)

        do {
            container = try ModelContainer(for: schema, configurations: [configuration])
        } catch {
            fatalError("Could not configure SwiftData container: \(error)")
        }

        seedIfNeeded()
    }

    private func seedIfNeeded() {
        let context = container.mainContext

        do {
            let categories = try context.fetch(FetchDescriptor<Category>())
            if categories.isEmpty {
                seedCategories(context: context)
            }

            let goals = try context.fetch(FetchDescriptor<TripGoal>())
            if goals.isEmpty {
                seedTripGoal(context: context)
            }

            try context.save()
            isSeeded = true
        } catch {
            print("Seed failed: \(error)")
        }
    }

    private func seedCategories(context: ModelContext) {
        let defaults: [(name: String, icon: String, colorHex: String, limit: Double, carryOver: Bool, sortOrder: Int)] = [
            ("Food", "fork.knife", "#f97316", 350, false, 0),
            ("Transport", "car.fill", "#38bdf8", 150, true, 1),
            ("Housing", "house.fill", "#a855f7", 400, false, 2),
            ("Fun", "party.popper.fill", "#f43f5e", 200, false, 3),
            ("Misc", "tray.fill", "#94a3b8", 150, false, 4),
            ("Trip Fund", "airplane.departure", "#22c55e", 500, true, 5),
            ("Sinking Fund", "wallet.pass.fill", "#facc15", 250, true, 6)
        ]

        for item in defaults {
            let category = Category(
                name: item.name,
                icon: item.icon,
                colorHex: item.colorHex,
                monthlyLimitCAD: item.limit,
                carryOver: item.carryOver,
                sortOrder: item.sortOrder
            )
            context.insert(category)
        }
    }

    private func seedTripGoal(context: ModelContext) {
        let target: Double = 10000
        let current: Double = 0
        let goalDeadlineComponents = DateComponents(year: 2026, month: 1, day: 1)
        let deadline = calendar.date(from: goalDeadlineComponents) ?? Date()
        let now = Date()
        let weeksRemaining = calendar.dateComponents([.weekOfYear], from: now, to: deadline).weekOfYear ?? 0
        let autoWeekly: Double
        if weeksRemaining > 0 {
            autoWeekly = max(0, (target - current) / Double(weeksRemaining))
        } else {
            autoWeekly = target - current
        }

        let goal = TripGoal(targetCAD: target, deadline: deadline, currentSavedCAD: current, autoSaveWeeklyCAD: autoWeekly)
        context.insert(goal)
    }
}
