# kBUDGET

## Vision
kBUDGET is a personal finance companion built to maximize savings for a four-month Southeast Asia trip beginning January 2026. The app raises daily awareness of spending, enforces a savings schedule tied to the trip goal, and streamlines multi-currency expense capture so every dollar saved is intentional.

- **Primary metric:** cumulative `$ saved vs plan` measured monthly.
- **Experience guardrails:** daily capture friction ≤ 10 seconds; missed-day backfill ≤ 30 seconds.

## MVP Scope (4–6 weeks)
Focus the first release on the following pillars:

### 1. Trip Goal & Savings Plan
- Collect target amount, deadline (Jan 1, 2026), and current savings during onboarding.
- Auto-compute required monthly and weekly savings; display as a progress ring plus text forecast (`on track` / `behind by $X`).
- Persist savings plan to drive reminders, projections, and dashboard summaries.

### 2. Simple Budgets
- Preload editable categories: Food, Transport, Housing, Fun, Misc, Trip Fund, and a Sinking Fund grouping for one-off costs (vaccines, visas, gear).
- Support monthly limits with optional carry-over per category.
- Allow reordering categories; keep UX lightweight and fast.

### 3. Fast Expense Capture (offline-first)
- Floating action button opens keypad-first sheet: amount → category → optional merchant/note → currency picker.
- Cache last three merchants and categories for single-tap entry; surface haptics on save and 5-second undo snackbar.
- Optional photo attachment using the system photo picker; store `PHAsset` identifiers only.

### 4. Multi-Currency Awareness (CAD-first)
- Accept transactions in any currency; immediately convert to CAD using cached daily FX data.
- Store original amount/currency and converted CAD amount for analytics stability.
- Allow manual rate override for cash exchanges.

### 5. Insights & Analytics
- Provide Today/Week/Month spend, remaining per category, and overall burn-rate against the plan.
- Forecast end-of-month outcome with a simple 7-day average burn rate projection and clear messaging.

### 6. Data & Export
- Persist data locally via SwiftData; enable optional iCloud sync using CloudKit.
- Offer CSV export to the Files app or share sheet for manual backups.

### 7. Reminders & Widgets
- Daily notification to prompt spending log at a user-selected time.
- Home and Lock Screen widgets: small widget for today’s remaining budget, medium widget for trip progress ring plus top categories.

## Explicit MVP Exclusions
Bank integrations, shared budgets, recurring bill imports, OCR-driven data extraction, subscription detection, travel auto-detection, and premium upsells stay out of v1 to protect scope and performance.

## Core User Flows

### Onboarding (2 screens)
1. Capture target savings, deadline, and current savings → compute weekly savings plan and confirm.
2. Present starter categories with suggested limits (editable) and explain trip progress tracking.

### Add Expense
- Entry sheet is keypad-first; currency defaults to last used or device locale.
- Conversion uses today’s FX rate; user can override before saving.
- Provide quick actions (three recent merchants/categories), optional note and photo, confirm with haptic feedback.

### Home Dashboard
- Trip progress ring with status text (`on track` / `behind by $X`).
- Today/Week/Month summaries with remaining amounts by category chips.
- Prominent add-expense button and quick links to history and budgets.

### Budgets Management
- List categories with monthly limits, carry-over toggles, and reorder drag handles.
- Support editing sinking fund allocations separately.

### History & Search
- Reverse chronological list grouped by day with currency badges.
- Filters for category, currency, and amount bands; text search over merchant/note.

### Settings
- Manage base currency (CAD default), FX refresh policy, iCloud sync toggle, data export, notification time, Face ID lock, and developer diagnostics switch (logs, for internal use).

## Data Model
Implement the SwiftData models sketched below. Store both original and CAD amounts for reporting accuracy.

```swift
@Model
final class FxRate {
    @Attribute(.unique) var code: String   // "USD"
    var rateToCAD: Double                  // 1 unit foreign -> CAD
    var date: Date
}

@Model
final class Category {
    @Attribute(.unique) var id: UUID
    var name: String
    var icon: String        // SF Symbol name
    var colorHex: String
    var monthlyLimitCAD: Double
    var carryOver: Bool
    var sortOrder: Int
}

@Model
final class BudgetPeriod {
    @Attribute(.unique) var id: UUID
    var month: Int
    var year: Int
    var category: Category
    var allocatedCAD: Double
    var carriedOverCAD: Double
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
}

@Model
final class TripGoal {
    var targetCAD: Double
    var deadline: Date
    var currentSavedCAD: Double
    var autoSaveWeeklyCAD: Double // derived
}
```

### Derived Calculations
- **Remaining per category:** `(limit + carriedOver) - Σ(category spend in CAD for month)`.
- **Daily allowance:** `totalRemainingThisMonth / daysLeftInMonth`.
- **Projection:** use last 7 days average burn rate to forecast month-end total.
- **Trip goal delta:** `currentSavedCAD + projectedSavings - targetCAD` with monthly checkpoints.

## Technical Architecture

### App Layers
- **Presentation:** SwiftUI views with composable feature modules (Dashboard, Expense Entry, Budgets, History, Settings).
- **State Management:** Observable models or The Composable Architecture (optional) to isolate business logic and facilitate testing.
- **Persistence:** SwiftData container with CloudKit-backed syncing; background context for writes from widgets/background tasks.
- **Services:**
  - `FxService` for fetching/storing daily FX rates; supports manual overrides.
  - `NotificationScheduler` to manage reminders.
  - `ExportService` for CSV generation and share sheet handoff.
  - `WidgetDataProvider` to expose snapshot data for widgets/App Intents.
- **Background Tasks:** `BGAppRefreshTask` to update FX rates when on Wi-Fi and charging; gracefully degrade to cached rates offline.

### Offline & Sync Strategy
- App operates fully offline using cached FX rates; queue FX fetch task for later if network unavailable.
- Each transaction references the FX rate used on creation to avoid historical drift.
- CloudKit sync remains optional; default to device-only storage, prompt user to opt in explicitly.

### FX Handling
- Store one `FxRate` per currency per day. Use ECB/open source rates in future; for MVP, seed with static table and add manual refresh endpoint when backend is ready.
- Track the date associated with each rate; do not retroactively update existing transactions when rates change.

### Notifications & Widgets
- Use `UNUserNotificationCenter` for daily reminders; request permission during onboarding completion.
- Widgets built with WidgetKit and App Intents; reuse domain models through shared Swift packages or modules.

### Privacy & Security
- No third-party analytics; implement lightweight on-device counters for engagement.
- Provide Face ID / Touch ID app lock toggle stored in Keychain.
- Gate any network activity (FX fetch) behind explicit consent; document in privacy copy.

## Development Plan (Compressed)

| Week | Focus | Key Deliverables |
|------|-------|------------------|
| 1 | Foundation | SwiftData models, persistence layer, FX cache, seed categories, Settings skeleton |
| 2 | Capture & Dashboard | Expense entry flow, dashboard summaries, reminders scaffolding |
| 3 | Budgeting & History | Budgets management UI, history list with filters, CSV export flow |
| 4 | Sync & Surface Area | iCloud sync polish, widgets, lock screen support, QA pass |
| 5–6 | Buffer | Bug fixing, performance tuning, TestFlight prep, App Store assets |

## Testing Strategy
- Enter 50 transactions across multiple currencies; verify CAD totals and category rollups.
- Adjust FX rates daily; confirm historical transactions retain original conversions.
- Toggle iCloud sync mid-session; ensure last-write-wins conflict resolution and no duplicate records.
- Run full expense flow in airplane mode; confirm caching paths and queued FX refresh.
- Validate CSV export/import round-trip manually to confirm data fidelity.

## Post-MVP Backlog
Prioritize enhancements once the MVP stabilizes:
- Bank import via Plaid/Flinks/Teller with review inbox for categorization.
- Receipt OCR using VisionKit to prefill totals and merchants.
- Rules engine for auto-categorization based on merchant strings.
- Travel mode that auto-selects local currency via locale/geofence.
- Siri/App Shortcuts commands ("Log $12 coffee to Food").
- Premium tier: multi-user sharing, advanced analytics, additional trip goals.

## Next Steps
- Validate feasibility of SwiftData + CloudKit stack for required sync behavior.
- Begin wireframes focusing on add-expense speed and dashboard clarity.
- Set up project scaffolding (`kBUDGET.xcodeproj`) with modular targets for app, widgets, and shared data.

## Cross-Platform Coordination
- Maintain feature parity by mirroring module names and responsibilities between `kBUDGETApp` (SwiftUI) and `kBUDGETReactNative` (React Native) directories.
- Track shared product requirements in `/docs` and update both codebases when a flow or metric changes; each change requires a checklist item for SwiftUI and React Native.
- Share UX assets (wireframes, copy, color tokens) through a common source of truth to avoid divergence.
- Keep data models aligned with the canonical definitions in `kBUDGETApp/Sources/Shared/Models/BudgetModels.swift` and `kBUDGETReactNative/src/models/index.ts`; update both when fields evolve.
- Synchronize release milestones: branch naming `<feature>/<platform>` and merge only after both implementations pass smoke tests.
