import Foundation
import SwiftData

@Model
final class FxRate {
    @Attribute(.unique) var code: String
    var rateToCAD: Double
    var date: Date

    init(code: String, rateToCAD: Double, date: Date) {
        self.code = code
        self.rateToCAD = rateToCAD
        self.date = date
    }
}

@Model
final class Category {
    @Attribute(.unique) var id: UUID
    var name: String
    var icon: String
    var colorHex: String
    var monthlyLimitCAD: Double
    var carryOver: Bool
    var sortOrder: Int

    init(id: UUID = UUID(), name: String, icon: String, colorHex: String, monthlyLimitCAD: Double, carryOver: Bool, sortOrder: Int) {
        self.id = id
        self.name = name
        self.icon = icon
        self.colorHex = colorHex
        self.monthlyLimitCAD = monthlyLimitCAD
        self.carryOver = carryOver
        self.sortOrder = sortOrder
    }
}

@Model
final class BudgetPeriod {
    @Attribute(.unique) var id: UUID
    var month: Int
    var year: Int
    var category: Category
    var allocatedCAD: Double
    var carriedOverCAD: Double

    init(id: UUID = UUID(), month: Int, year: Int, category: Category, allocatedCAD: Double, carriedOverCAD: Double) {
        self.id = id
        self.month = month
        self.year = year
        self.category = category
        self.allocatedCAD = allocatedCAD
        self.carriedOverCAD = carriedOverCAD
    }
}

@Model
final class Transaction {
    @Attribute(.unique) var id: UUID
    var date: Date
    var amountOriginal: Double
    var currencyCode: String
    var amountCAD: Double
    var category: Category
    var merchant: String?
    var note: String?
    var photoAssetId: String?

    init(id: UUID = UUID(), date: Date, amountOriginal: Double, currencyCode: String, amountCAD: Double, category: Category, merchant: String? = nil, note: String? = nil, photoAssetId: String? = nil) {
        self.id = id
        self.date = date
        self.amountOriginal = amountOriginal
        self.currencyCode = currencyCode
        self.amountCAD = amountCAD
        self.category = category
        self.merchant = merchant
        self.note = note
        self.photoAssetId = photoAssetId
    }
}

@Model
final class TripGoal {
    var targetCAD: Double
    var deadline: Date
    var currentSavedCAD: Double
    var autoSaveWeeklyCAD: Double

    init(targetCAD: Double, deadline: Date, currentSavedCAD: Double, autoSaveWeeklyCAD: Double) {
        self.targetCAD = targetCAD
        self.deadline = deadline
        self.currentSavedCAD = currentSavedCAD
        self.autoSaveWeeklyCAD = autoSaveWeeklyCAD
    }
}
