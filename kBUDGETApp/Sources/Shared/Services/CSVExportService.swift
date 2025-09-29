import Foundation

protocol DataExporting {
    func generateCSV(for transactions: [Transaction]) throws -> URL
}

final class CSVExportService: DataExporting {
    private let fileManager: FileManager

    init(fileManager: FileManager = .default) {
        self.fileManager = fileManager
    }

    func generateCSV(for transactions: [Transaction]) throws -> URL {
        var rows: [String] = ["Date,Category,Original Amount,Original Currency,Amount CAD,Merchant,Note"]
        let formatter = ISO8601DateFormatter()

        for transaction in transactions {
            let dateString = formatter.string(from: transaction.date)
            let merchant = transaction.merchant?.replacingOccurrences(of: ",", with: " ") ?? ""
            let note = transaction.note?.replacingOccurrences(of: ",", with: " ") ?? ""
            let row = "\(dateString),\(transaction.category.name),\(transaction.amountOriginal),\(transaction.currencyCode),\(transaction.amountCAD),\(merchant),\(note)"
            rows.append(row)
        }

        let csvString = rows.joined(separator: "\n")
        let data = Data(csvString.utf8)
        let tempURL = fileManager.temporaryDirectory.appending(path: "kbudget-export-\(UUID().uuidString).csv")
        try data.write(to: tempURL)
        return tempURL
    }
}
