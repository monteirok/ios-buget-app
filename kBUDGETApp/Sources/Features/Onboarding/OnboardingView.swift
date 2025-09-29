import SwiftUI
import SwiftData

struct OnboardingView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @Query private var tripGoals: [TripGoal]
    @Query(sort: \Category.sortOrder) private var categories: [Category]

    @State private var targetAmount: Double = 10000
    @State private var currentSaved: Double = 0
    @State private var deadline: Date = Calendar.current.date(from: DateComponents(year: 2026, month: 1, day: 1)) ?? Date()
    @State private var weeklyAutoSave: Double = 0
    @State private var editedCategories: [CategoryDraft] = []
    @State private var showingConfirmation = false

    private let calendar: Calendar = .current

    var body: some View {
        TabView {
            GoalSetupStep(targetAmount: $targetAmount, currentSaved: $currentSaved, deadline: $deadline, weeklyAutoSave: computedWeekly)
                .tag(0)
            CategoriesStep(categories: $editedCategories)
                .tag(1)
        }
        .tabViewStyle(.page(indexDisplayMode: .always))
        .onAppear(perform: loadData)
        .toolbar {
            ToolbarItem(placement: .bottomBar) {
                Button("Finish", action: completeOnboarding)
                    .disabled(!canFinish)
            }
        }
        .sheet(isPresented: $showingConfirmation) {
            CompletionView { dismiss() }
        }
    }

    private var computedWeekly: Double {
        let now = Date()
        let weeksRemaining = calendar.dateComponents([.weekOfYear], from: now, to: deadline).weekOfYear ?? 0
        guard weeksRemaining > 0 else { return targetAmount - currentSaved }
        return max(0, (targetAmount - currentSaved) / Double(weeksRemaining))
    }

    private var canFinish: Bool {
        targetAmount > 0 && !editedCategories.isEmpty
    }

    private func loadData() {
        if let goal = tripGoals.first {
            targetAmount = goal.targetCAD
            currentSaved = goal.currentSavedCAD
            deadline = goal.deadline
        }
        weeklyAutoSave = computedWeekly

        if editedCategories.isEmpty {
            editedCategories = categories.map { CategoryDraft(category: $0) }
        }
    }

    private func completeOnboarding() {
        guard canFinish else { return }

        do {
            let goal: TripGoal
            if let existing = tripGoals.first {
                existing.targetCAD = targetAmount
                existing.currentSavedCAD = currentSaved
                existing.deadline = deadline
                existing.autoSaveWeeklyCAD = computedWeekly
                goal = existing
            } else {
                goal = TripGoal(targetCAD: targetAmount, deadline: deadline, currentSavedCAD: currentSaved, autoSaveWeeklyCAD: computedWeekly)
                modelContext.insert(goal)
            }

            for draft in editedCategories {
                if let category = categories.first(where: { $0.id == draft.id }) {
                    category.name = draft.name
                    category.monthlyLimitCAD = draft.limit
                    category.carryOver = draft.carryOver
                }
            }

            try modelContext.save()
            showingConfirmation = true
        } catch {
            print("Onboarding save failed: \(error)")
        }
    }
}

private struct GoalSetupStep: View {
    @Binding var targetAmount: Double
    @Binding var currentSaved: Double
    @Binding var deadline: Date
    let weeklyAutoSave: Double

    var body: some View {
        VStack(spacing: 24) {
            Text("Plan your trip goal")
                .font(.title2)
                .bold()

            VStack(alignment: .leading, spacing: 16) {
                Stepper(value: $targetAmount, in: 1000...50000, step: 500) {
                    Text("Target Amount: $\(targetAmount, format: .number.precision(.fractionLength(0)))")
                }

                Stepper(value: $currentSaved, in: 0...targetAmount, step: 100) {
                    Text("Current Savings: $\(currentSaved, format: .number.precision(.fractionLength(0)))")
                }

                DatePicker("Deadline", selection: $deadline, displayedComponents: .date)

                Text("Weekly auto-save needed: $\(weeklyAutoSave, format: .number.precision(.fractionLength(0)))")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding()
    }
}

private struct CategoriesStep: View {
    @Binding var categories: [CategoryDraft]

    var body: some View {
        VStack(spacing: 16) {
            Text("Tune your categories")
                .font(.title2)
                .bold()

            List {
                ForEach($categories) { $category in
                    VStack(alignment: .leading, spacing: 8) {
                        TextField("Name", text: $category.name)
                        Stepper(value: $category.limit, in: 0...2000, step: 50) {
                            Text("Monthly Limit: $\(category.limit, format: .number.precision(.fractionLength(0)))")
                        }
                        Toggle("Carry Over", isOn: $category.carryOver)
                    }
                    .padding(.vertical, 4)
                }
            }
        }
        .padding()
    }
}

private struct CompletionView: View {
    let action: () -> Void

    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 64))
                .foregroundStyle(.green)
            Text("You're ready to save!")
                .font(.title2)
                .bold()
            Button("Get Started", action: action)
                .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}

struct CategoryDraft: Identifiable {
    let id: UUID
    var name: String
    var limit: Double
    var carryOver: Bool

    init(category: Category) {
        self.id = category.id
        self.name = category.name
        self.limit = category.monthlyLimitCAD
        self.carryOver = category.carryOver
    }
}

#Preview {
    OnboardingView()
        .modelContainer(for: [TripGoal.self, Category.self])
}
