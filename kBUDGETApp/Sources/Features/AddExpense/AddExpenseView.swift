import SwiftUI
import SwiftData

struct AddExpenseView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Category.sortOrder) private var categories: [Category]

    @State private var amountText: String = ""
    @State private var selectedCategoryId: UUID?
    @State private var selectedCurrency: String = "CAD"
    @State private var note: String = ""

    private let currencies = ["CAD", "USD", "THB", "IDR"]

    var body: some View {
        Form {
            Section("Amount") {
                TextField("0.00", text: $amountText)
                    .keyboardType(.decimalPad)
            }

            Section("Category") {
                Picker("Category", selection: $selectedCategoryId) {
                    ForEach(categories) { category in
                        Text(category.name).tag(category.id as UUID?)
                    }
                }
            }

            Section("Currency") {
                Picker("Currency", selection: $selectedCurrency) {
                    ForEach(currencies, id: \.self) { currency in
                        Text(currency)
                    }
                }
            }

            Section("Note") {
                TextField("Optional note", text: $note)
            }

            Button(action: saveExpense) {
                Label("Save", systemImage: "checkmark.circle.fill")
            }
            .disabled(!canSave)
        }
        .onAppear {
            if selectedCategoryId == nil {
                selectedCategoryId = categories.first?.id
            }
        }
        .navigationTitle("Add Expense")
    }

    private var canSave: Bool {
        guard let _ = selectedCategoryId else { return false }
        return Double(amountText) ?? 0 > 0
    }

    private func saveExpense() {
        guard let category = categories.first(where: { $0.id == selectedCategoryId }) else { return }
        guard let amount = Double(amountText) else { return }
        let amountCAD = selectedCurrency == "CAD" ? amount : amount

        let transaction = Transaction(
            date: Date(),
            amountOriginal: amount,
            currencyCode: selectedCurrency,
            amountCAD: amountCAD,
            category: category,
            merchant: nil,
            note: note.isEmpty ? nil : note,
            photoAssetId: nil
        )

        modelContext.insert(transaction)
        do {
            try modelContext.save()
            dismiss()
        } catch {
            print("Failed to save transaction: \(error)")
        }
    }
}

#Preview {
    NavigationStack {
        AddExpenseView()
            .modelContainer(for: [Transaction.self, Category.self])
    }
}
