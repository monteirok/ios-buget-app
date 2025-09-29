import SwiftUI

struct HistoryView: View {
    @Environment(\.calendar) private var calendar
    @State private var searchText: String = ""
    @Query(sort: \Transaction.date, order: .reverse) private var transactions: [Transaction]

    private var filteredTransactions: [Transaction] {
        guard !searchText.isEmpty else { return transactions }
        return transactions.filter { transaction in
            if let merchant = transaction.merchant, merchant.localizedCaseInsensitiveContains(searchText) {
                return true
            }
            if let note = transaction.note, note.localizedCaseInsensitiveContains(searchText) {
                return true
            }
            return transaction.category.name.localizedCaseInsensitiveContains(searchText)
        }
    }

    private var sections: [HistorySection] {
        let grouped = Dictionary(grouping: filteredTransactions) { transaction in
            calendar.startOfDay(for: transaction.date)
        }

        return grouped.keys.sorted(by: >).map { date in
            let entries = grouped[date, default: []].map { transaction in
                HistoryEntry(
                    id: transaction.id,
                    merchant: transaction.merchant ?? transaction.category.name,
                    category: transaction.category.name,
                    amountCAD: transaction.amountCAD,
                    originalAmount: transaction.amountOriginal,
                    currency: transaction.currencyCode
                )
            }
            return HistorySection(date: date, entries: entries)
        }
    }

    var body: some View {
        List {
            ForEach(sections, id: \.date) { section in
                Section(sectionTitle(for: section.date)) {
                    ForEach(section.entries) { entry in
                        HStack {
                            VStack(alignment: .leading) {
                                Text(entry.merchant)
                                    .font(.headline)
                                Text(entry.category)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            VStack(alignment: .trailing) {
                                Text(entry.amountCAD, format: .currency(code: "CAD"))
                                    .bold()
                                Text("\(entry.originalAmount, format: .number.precision(.fractionLength(2))) \(entry.currency)")
                                    .font(.footnote)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
        }
        .overlay {
            if sections.isEmpty {
                ContentUnavailableView("No expenses", systemImage: "tray") {
                    Text("Add an expense to see it here.")
                }
            }
        }
        .searchable(text: $searchText)
        .navigationTitle("History")
    }

    private func sectionTitle(for date: Date) -> String {
        if calendar.isDateInToday(date) { return "Today" }
        if calendar.isDateInYesterday(date) { return "Yesterday" }
        return date.formatted(date: .abbreviated, time: .omitted)
    }
}

private struct HistorySection {
    let date: Date
    let entries: [HistoryEntry]
}

private struct HistoryEntry: Identifiable {
    let id: UUID
    let merchant: String
    let category: String
    let amountCAD: Double
    let originalAmount: Double
    let currency: String
}

#Preview {
    NavigationStack {
        HistoryView()
            .modelContainer(for: [Transaction.self, Category.self])
    }
}
