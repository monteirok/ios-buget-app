import SwiftUI

@main
struct KBudgetApp: App {
    @StateObject private var dataController = DataController()
    @AppStorage("hasCompletedOnboarding") private var hasCompletedOnboarding: Bool = false

    var body: some Scene {
        WindowGroup {
            RootView()
                .modelContainer(dataController.container)
                .environmentObject(dataController)
                .sheet(isPresented: .constant(!hasCompletedOnboarding && dataController.isSeeded)) {
                    NavigationStack {
                        OnboardingView()
                            .modelContainer(dataController.container)
                            .toolbar {
                                ToolbarItem(placement: .cancellationAction) {
                                    Button("Close") {
                                        hasCompletedOnboarding = true
                                    }
                                }
                            }
                    }
                    .interactiveDismissDisabled()
                }
                .onReceive(NotificationCenter.default.publisher(for: .onboardingCompleted)) { _ in
                    hasCompletedOnboarding = true
                }
        }
    }
}

extension Notification.Name {
    static let onboardingCompleted = Notification.Name("kbudget.onboarding.completed")
}
