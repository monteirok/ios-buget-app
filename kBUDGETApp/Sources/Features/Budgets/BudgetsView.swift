import SwiftUI

struct BudgetsView: View {
    @Query(sort: \Category.sortOrder) private var categories: [Category]

    var body: some View {
        List {
            Section("Monthly Budgets") {
                ForEach(categories) { category in
                    VStack(alignment: .leading) {
                        HStack {
                            Text(category.name)
                                .font(.headline)
                            Spacer()
                            Text(category.monthlyLimitCAD, format: .currency(code: "CAD"))
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                        Toggle("Carry over", isOn: .constant(category.carryOver))
                            .labelsHidden()
                    }
                    .padding(.vertical, 8)
                }
            }
        }
        .navigationTitle("Budgets")
    }
}

#Preview {
    NavigationStack {
        BudgetsView()
            .modelContainer(for: [Category.self])
    }
}
