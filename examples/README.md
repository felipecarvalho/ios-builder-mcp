# iOS Builder MCP - Example: Hello World App

This example demonstrates how to use the iOS Builder MCP to generate a basic "Hello World" iOS app.

## Prerequisites

- Node.js 20+
- Xcode 15+
- iOS 17+ Simulator

## Setup

1. Install dependencies:
```bash
cd /Volumes/SSD/Dev/ios-builder-mcp
npm install
npm run build
```

2. Configure your MCP client (Claude Desktop, Cursor, etc.):

```json
{
  "mcpServers": {
    "ios-builder": {
      "command": "node",
      "args": ["/Volumes/SSD/Dev/ios-builder-mcp/dist/index.js"],
      "env": {
        "IOS_BUILDER_PROJECT_ROOT": "/Volumes/SSD/Dev/ios-builder-mcp/examples/hello-world"
      }
    }
  }
}
```

## Example Conversation

### User:
```
Create a simple "Hello World" iOS app called "MyFirstApp" with a welcome screen and a button that shows an alert.
```

### Expected AI Response:

The AI will use the MCP tools to:

1. **Create project structure**:
```
write_file(path: "App.swift", content: "...")
write_file(path: "ContentView.swift", content: "...")
```

2. **Verify compilation**:
```
verify_compile()
```

3. **Result**:
```
✓ Created MyFirstApp with:
- App.swift (entry point)
- ContentView.swift (welcome screen with alert button)
- All files pass type checking
```

## Generated Code Example

### App.swift
```swift
import SwiftUI

@main
struct MyFirstApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
```

### ContentView.swift
```swift
import SwiftUI

struct ContentView: View {
    @State private var showAlert = false
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 32) {
                Image(systemName: "hand.wave.fill")
                    .font(.system(size: 80))
                    .foregroundStyle(.blue.gradient)
                
                Text("Hello, World!")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Welcome to your first iOS app")
                    .font(.body)
                    .foregroundStyle(.secondary)
                
                Button {
                    showAlert = true
                } label: {
                    Text("Say Hello")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(.blue.gradient)
                        .foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .padding(.horizontal)
            }
            .padding()
            .navigationTitle("MyFirstApp")
            .alert("Hello!", isPresented: $showAlert) {
                Button("OK", role: .cancel) { }
            } message: {
                Text("Welcome to MyFirstApp!")
            }
        }
    }
}

#Preview {
    ContentView()
}
```

## Testing the Generated App

1. Open the generated project in Xcode:
```bash
cd /Volumes/SSD/Dev/ios-builder-mcp/examples/hello-world
open MyFirstApp.xcodeproj
```

2. Select an iOS Simulator (iPhone 15 Pro)

3. Press Cmd+R to build and run

4. You should see:
   - A welcome screen with "Hello, World!" text
   - A blue "Say Hello" button
   - Tapping the button shows an alert

## Next Steps

Try more complex examples:
- **Fitness Tracker**: App with workout logging and progress charts
- **Recipe App**: App with recipe browsing and favorites
- **Social App**: App with user profiles and posts

See the `examples/` directory for more examples.
