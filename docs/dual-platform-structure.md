# Dual Platform Layout

```
Budget App/
├── README.md
├── docs/
│   └── dual-platform-structure.md
├── kBUDGETApp/                 # Native SwiftUI implementation
│   ├── Sources/
│   └── Resources/
└── kBUDGETReactNative/         # React Native implementation (TypeScript + Expo-style structure)
    ├── app/
    ├── src/
    │   ├── components/
    │   ├── features/
    │   │   ├── dashboard/
    │   │   ├── expenses/
    │   │   ├── budgets/
    │   │   ├── history/
    │   │   └── settings/
    │   ├── models/
    │   ├── services/
    │   └── theme/
    ├── assets/
    ├── package.json
    ├── tsconfig.json
    └── app.json
```

The two implementations share the same product requirements and vocabulary. Keep feature names and data models aligned (e.g., `Transaction`, `TripGoal`, `FxRate`) so analytics, documentation, and QA scripts can target both builds interchangeably.
