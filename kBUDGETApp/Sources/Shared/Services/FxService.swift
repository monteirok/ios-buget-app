import Foundation
import SwiftData

protocol FxRateProviding {
    func cachedRate(for currency: String, on date: Date) -> FxRate?
    func convert(amount: Double, from currency: String, toCADOn date: Date) -> Double?
    func updateRates(_ rates: [FxRate]) async throws
    func refreshRatesIfNeeded() async
}

actor FxService: FxRateProviding {
    private let modelContextProvider: () -> ModelContext
    private let calendar: Calendar

    init(modelContextProvider: @escaping () -> ModelContext, calendar: Calendar = .current) {
        self.modelContextProvider = modelContextProvider
        self.calendar = calendar
    }

    func cachedRate(for currency: String, on date: Date) -> FxRate? {
        let context = modelContextProvider()
        let descriptor = FetchDescriptor<FxRate>(predicate: #Predicate { $0.code == currency && calendar.isDate($0.date, inSameDayAs: date) })
        return try? context.fetch(descriptor).first
    }

    func convert(amount: Double, from currency: String, toCADOn date: Date) -> Double? {
        guard currency != "CAD" else { return amount }
        guard let rate = cachedRate(for: currency, on: date) else { return nil }
        return amount * rate.rateToCAD
    }

    func updateRates(_ rates: [FxRate]) async throws {
        let context = modelContextProvider()
        for rate in rates {
            context.insert(rate)
        }
        try context.save()
    }

    func refreshRatesIfNeeded() async {
        // Stub for future network-backed refresh; keep offline-first for MVP.
    }
}
