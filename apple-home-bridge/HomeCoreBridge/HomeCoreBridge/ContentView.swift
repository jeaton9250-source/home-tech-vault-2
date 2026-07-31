import SwiftUI
import HomeKit
import Combine

@MainActor
final class AppleHomeBridgeManager: NSObject, ObservableObject {
    @Published var homes: [HMHome] = []
    @Published var isLoading = true
    @Published var errorMessage: String?
    @Published var authorizationRequested = false

    private let homeManager = HMHomeManager()

    override init() {
        super.init()
        homeManager.delegate = self
    }

    func requestAccess() {
        authorizationRequested = true
        isLoading = true
        errorMessage = nil

        /*
         Creating and using HMHomeManager causes Apple
         to display the system Home permission prompt
         when permission has not already been decided.
         */
        refreshHomes()
    }

    private func refreshHomes() {
        homes = homeManager.homes.sorted {
            $0.name.localizedCaseInsensitiveCompare(
                $1.name
            ) == .orderedAscending
        }

        isLoading = false
    }
}

extension AppleHomeBridgeManager: HMHomeManagerDelegate {
    nonisolated func homeManagerDidUpdateHomes(
        _ manager: HMHomeManager
    ) {
        Task { @MainActor in
            refreshHomes()
        }
    }

    nonisolated func homeManager(
        _ manager: HMHomeManager,
        didAdd home: HMHome
    ) {
        Task { @MainActor in
            refreshHomes()
        }
    }

    nonisolated func homeManager(
        _ manager: HMHomeManager,
        didRemove home: HMHome
    ) {
        Task { @MainActor in
            refreshHomes()
        }
    }
}

struct ContentView: View {
    @StateObject private var manager =
        AppleHomeBridgeManager()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(
                    alignment: .leading,
                    spacing: 24
                ) {
                    header

                    if !manager.authorizationRequested {
                        permissionCard
                    } else if manager.isLoading {
                        loadingCard
                    } else if let errorMessage =
                        manager.errorMessage {
                        errorCard(errorMessage)
                    } else if manager.homes.isEmpty {
                        emptyCard
                    } else {
                        homesCard
                    }
                }
                .frame(maxWidth: 680)
                .padding(32)
            }
            .background(
                Color(
                    red: 0.96,
                    green: 0.97,
                    blue: 0.98
                )
            )
            .navigationTitle(
                "HomeCore Apple Home Bridge"
            )
        }
        .frame(
            minWidth: 720,
            minHeight: 560
        )
    }

    private var header: some View {
        VStack(
            alignment: .leading,
            spacing: 10
        ) {
            Text("APPLE HOME INTEGRATION")
                .font(.caption)
                .fontWeight(.bold)
                .tracking(1.8)
                .foregroundStyle(.secondary)

            Text(
                "Connect Apple Home to HomeCore"
            )
            .font(.largeTitle)
            .fontWeight(.semibold)

            Text(
                "Grant HomeCore permission to read the homes, rooms, and smart-home accessories already configured in the Apple Home app."
            )
            .font(.body)
            .foregroundStyle(.secondary)
            .fixedSize(
                horizontal: false,
                vertical: true
            )
        }
    }

    private var permissionCard: some View {
        VStack(
            alignment: .leading,
            spacing: 18
        ) {
            Image(systemName: "homekit")
                .font(.system(size: 32))
                .frame(
                    width: 58,
                    height: 58
                )
                .background(
                    Color.accentColor.opacity(0.12)
                )
                .clipShape(
                    RoundedRectangle(
                        cornerRadius: 16
                    )
                )

            Text("Apple Home Access")
                .font(.title2)
                .fontWeight(.semibold)

            Text(
                "macOS will show Apple’s system permission prompt. HomeCore cannot access your Home data unless you approve that prompt."
            )
            .foregroundStyle(.secondary)
            .fixedSize(
                horizontal: false,
                vertical: true
            )

            Button {
                manager.requestAccess()
            } label: {
                Label(
                    "Allow Apple Home Access",
                    systemImage: "lock.open.fill"
                )
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
        }
        .padding(24)
        .background(Color.white)
        .clipShape(
            RoundedRectangle(
                cornerRadius: 22
            )
        )
        .shadow(
            color: .black.opacity(0.06),
            radius: 18,
            y: 8
        )
    }

    private var loadingCard: some View {
        HStack(spacing: 14) {
            ProgressView()

            VStack(
                alignment: .leading,
                spacing: 4
            ) {
                Text("Loading Apple Home")
                    .fontWeight(.semibold)

                Text(
                    "Waiting for Apple Home authorization and home data."
                )
                .foregroundStyle(.secondary)
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .background(Color.white)
        .clipShape(
            RoundedRectangle(
                cornerRadius: 22
            )
        )
    }

    private func errorCard(
        _ message: String
    ) -> some View {
        VStack(
            alignment: .leading,
            spacing: 12
        ) {
            Label(
                "Unable to Access Apple Home",
                systemImage:
                    "exclamationmark.triangle.fill"
            )
            .font(.headline)

            Text(message)
                .foregroundStyle(.secondary)

            Button("Try Again") {
                manager.requestAccess()
            }
            .buttonStyle(.borderedProminent)
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .background(Color.white)
        .clipShape(
            RoundedRectangle(
                cornerRadius: 22
            )
        )
    }

    private var emptyCard: some View {
        VStack(
            alignment: .leading,
            spacing: 14
        ) {
            Label(
                "No Apple Homes Found",
                systemImage: "house"
            )
            .font(.title3)
            .fontWeight(.semibold)

            Text(
                "Make sure this Mac is signed into the Apple Account that owns or belongs to your Apple Home, then confirm that a home exists in the Home app."
            )
            .foregroundStyle(.secondary)
            .fixedSize(
                horizontal: false,
                vertical: true
            )

            Button("Refresh") {
                manager.requestAccess()
            }
            .buttonStyle(.bordered)
        }
        .padding(24)
        .frame(maxWidth: .infinity)
        .background(Color.white)
        .clipShape(
            RoundedRectangle(
                cornerRadius: 22
            )
        )
    }

    private var homesCard: some View {
        VStack(
            alignment: .leading,
            spacing: 16
        ) {
            HStack {
                VStack(
                    alignment: .leading,
                    spacing: 4
                ) {
                    Text("Apple Home Connected")
                        .font(.title2)
                        .fontWeight(.semibold)

                    Text(
                        "\(manager.homes.count) home\(manager.homes.count == 1 ? "" : "s") available"
                    )
                    .foregroundStyle(.secondary)
                }

                Spacer()

                Image(
                    systemName:
                        "checkmark.circle.fill"
                )
                .font(.system(size: 28))
                .foregroundStyle(.green)
            }

            Divider()

            ForEach(
                manager.homes,
                id: \.uniqueIdentifier
            ) { home in
                HStack(spacing: 14) {
                    Image(
                        systemName:
                            "house.fill"
                    )
                    .frame(
                        width: 42,
                        height: 42
                    )
                    .background(
                        Color.accentColor
                            .opacity(0.12)
                    )
                    .clipShape(
                        RoundedRectangle(
                            cornerRadius: 12
                        )
                    )

                    VStack(
                        alignment: .leading,
                        spacing: 4
                    ) {
                        Text(home.name)
                            .fontWeight(
                                .semibold
                            )

                        Text(
                            "\(home.rooms.count) rooms · \(home.accessories.count) accessories"
                        )
                        .font(.caption)
                        .foregroundStyle(
                            .secondary
                        )
                    }

                    Spacer()
                }
                .padding(.vertical, 4)
            }
        }
        .padding(24)
        .background(Color.white)
        .clipShape(
            RoundedRectangle(
                cornerRadius: 22
            )
        )
        .shadow(
            color: .black.opacity(0.06),
            radius: 18,
            y: 8
        )
    }
}

#Preview {
    ContentView()
}
