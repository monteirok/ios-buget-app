import SwiftUI

struct SettingsView: View {
    @State private var baseCurrency: String = "CAD"
    @State private var reminderTime = Date()
    @State private var isICloudEnabled = false
    @State private var faceIDEnabled = false

    var body: some View {
        Form {
            Section("Currency") {
                Picker("Base Currency", selection: $baseCurrency) {
                    Text("CAD").tag("CAD")
                    Text("USD").tag("USD")
                }
            }

            Section("Reminders") {
                DatePicker("Daily Reminder", selection: $reminderTime, displayedComponents: .hourAndMinute)
                Toggle("Enable iCloud Sync", isOn: $isICloudEnabled)
            }

            Section("Privacy") {
                Toggle("Face ID Lock", isOn: $faceIDEnabled)
            }

            Section("Data") {
                Button("Export CSV") {
                    // Wire up to CSVExportService in later iteration.
                }
            }
        }
        .navigationTitle("Settings")
    }
}

#Preview {
    NavigationStack {
        SettingsView()
    }
}
