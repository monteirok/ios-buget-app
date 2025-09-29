import Foundation
import UserNotifications

protocol ReminderScheduling {
    func requestAuthorizationIfNeeded() async throws
    func scheduleDailyReminder(at components: DateComponents)
    func cancelReminder(identifier: String)
}

final class NotificationScheduler: ReminderScheduling {
    private let center: UNUserNotificationCenter
    private let reminderIdentifier = "kbudget.daily.reminder"

    init(center: UNUserNotificationCenter = .current()) {
        self.center = center
    }

    func requestAuthorizationIfNeeded() async throws {
        let settings = await center.notificationSettings()
        guard settings.authorizationStatus != .authorized else { return }
        let granted = try await center.requestAuthorization(options: [.alert, .sound])
        if !granted {
            throw NSError(domain: "NotificationScheduler", code: 1, userInfo: [NSLocalizedDescriptionKey: "Notifications not authorized"])
        }
    }

    func scheduleDailyReminder(at components: DateComponents) {
        let content = UNMutableNotificationContent()
        content.title = "Log today's spending"
        content.body = "Capture your expenses to stay on track for Southeast Asia."

        let trigger = UNCalendarNotificationTrigger(dateMatching: components, repeats: true)
        let request = UNNotificationRequest(identifier: reminderIdentifier, content: content, trigger: trigger)

        center.add(request) { error in
            if let error {
                print("Failed to schedule reminder: \(error.localizedDescription)")
            }
        }
    }

    func cancelReminder(identifier: String = "kbudget.daily.reminder") {
        center.removePendingNotificationRequests(withIdentifiers: [identifier])
    }
}
