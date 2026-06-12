export function getAppEntryTemplate(projectName: string): string {
  return `import SwiftUI

@main
struct ${projectName}App: App {
    @State private var selectedTab = 0

    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(nil)
        }
    }
}

#Preview {
    ${projectName}App()
}
`;
}

export function getContentViewTemplate(projectName: string): string {
  return `import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    headerSection
                    featuresSection
                    actionSection
                }
                .padding(.horizontal)
                .padding(.vertical, 20)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("${projectName}")
        }
    }

    private var headerSection: some View {
        VStack(spacing: 12) {
            Image(systemName: "sparkles.rectangle.stack")
                .font(.system(size: 48))
                .foregroundStyle(.tint)
                .symbolEffect(.bounce, options: .repeating)

            Text("Welcome to ${projectName}")
                .font(.largeTitle)
                .fontWeight(.bold)

            Text("Your app is ready to build")
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.vertical, 32)
        .frame(maxWidth: .infinity)
    }

    private var featuresSection: some View {
        VStack(spacing: 12) {
            FeatureRow(icon: "square.stack.3d.up.fill", title: "Screens", description: "Add your views in the Views folder")
            FeatureRow(icon: "cylinder.split.1x2", title: "Models", description: "Define data models in the Models folder")
            FeatureRow(icon: "rectangle.3.group.fill", title: "Components", description: "Reusable UI in the Components folder")
        }
    }

    private var actionSection: some View {
        Button {
        } label: {
            Label("Get Started", systemImage: "arrow.right")
                .fontWeight(.semibold)
                .frame(maxWidth: .infinity)
                .padding()
                .background(.tint.gradient)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 14))
        }
        .padding(.top, 8)
    }
}

struct FeatureRow: View {
    let icon: String
    let title: String
    let description: String

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(.tint)
                .frame(width: 36, height: 36)
                .background(.tint.opacity(0.12))
                .clipShape(RoundedRectangle(cornerRadius: 10))

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.headline)
                Text(description)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()
        }
        .padding(14)
        .background(.regularMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

#Preview {
    ContentView()
}
`;
}

export function getViewModelTemplate(name: string): string {
  return `import Foundation
import Observation

@Observable
final class ${name}ViewModel {
    enum State: Equatable {
        case loading
        case loaded
        case empty(String)
        case error(String)
    }

    private(set) var state: State = .loading

    func load() async {
        state = .loading
        do {
            try await Task.sleep(for: .seconds(0.5))
            state = .loaded
        } catch {
            state = .error(error.localizedDescription)
        }
    }

    func refresh() async {
        await load()
    }
}
`;
}

export function getModelTemplate(name: string): string {
  return `import Foundation

struct ${name}: Identifiable, Codable, Hashable {
    let id: UUID
    var createdAt: Date
    var updatedAt: Date

    init(
        id: UUID = UUID(),
        createdAt: Date = Date(),
        updatedAt: Date = Date()
    ) {
        self.id = id
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }

    enum CodingKeys: String, CodingKey {
        case id
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
`;
}

export function getColorExtensionTemplate(primary: string, accent: string, background: string, surface: string, error: string): string {
  return `import SwiftUI

extension Color {
    static let appPrimary = Color(hex: "${primary}")
    static let appAccent = Color(hex: "${accent}")
    static let appBackground = Color(hex: "${background}")
    static let appSurface = Color(hex: "${surface}")
    static let appError = Color(hex: "${error}")

    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = ((int >> 24) & 0xFF, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
`;
}

export function getCardComponentTemplate(): string {
  return `import SwiftUI

struct Card<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding(16)
            .background(.regularMaterial)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .shadow(color: .black.opacity(0.06), radius: 8, x: 0, y: 2)
    }
}

#Preview {
    Card {
        VStack(alignment: .leading, spacing: 8) {
            Text("Title")
                .font(.headline)
            Text("Description")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }
    .padding()
}
`;
}

export function getProjectStructure(): string[] {
  return [
    'App.swift',
    'ContentView.swift',
    'Color+App.swift',
    'Views/',
    'Components/',
    'Models/',
    'ViewModels/',
    'Services/',
    'Assets.xcassets/',
  ];
}
