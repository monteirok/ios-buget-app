import SwiftUI

struct RootView: View {
    @State private var selectedTab: Tab = .dashboard

    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem { Label("Home", systemImage: "house.fill") }
                .tag(Tab.dashboard)

            BudgetsView()
                .tabItem { Label("Budgets", systemImage: "chart.pie.fill") }
                .tag(Tab.budgets)

            HistoryView()
                .tabItem { Label("History", systemImage: "clock.fill") }
                .tag(Tab.history)

            SettingsView()
                .tabItem { Label("Settings", systemImage: "gearshape.fill") }
                .tag(Tab.settings)
        }
    }
}

extension RootView {
    enum Tab {
        case dashboard, budgets, history, settings
    }
}

#Preview {
    RootView()
}
