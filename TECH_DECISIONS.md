# Technology Stack Decisions

## Stack Overview

| Layer | Choice |
|---|---|
| Backend | Rust |
| Desktop Framework | Tauri v2 |
| Frontend | React + TypeScript + Tailwind CSS |
| Build (backend) | Cargo |
| Build (frontend) | Vite |

---

## Why Tauri

### The Alternatives Considered

| Framework | Backend | Bundle Size | Notes |
|---|---|---|---|
| Electron | Node.js | ~150 MB | Ships its own Chromium |
| Tauri | Rust | ~5-10 MB | Uses OS system WebView |
| Wails | Go | ~10 MB | Smaller ecosystem than Tauri |
| NeutralinoJS | C++ | ~2 MB | Immature, sparse documentation |
| Flutter Desktop | Dart | ~20 MB | Own rendering engine, not web tech |
| Qt + WebEngine | C++ | ~50 MB | C++ frontend, large, complex |

### Why Not Electron

Electron ships a full copy of Chromium bundled inside every app. For a matchmaking tool this produces a ~150 MB installer. Every running Electron app also spawns its own isolated Chromium process consuming 100-200 MB of RAM independently. The Node.js backend has unrestricted system access with no enforced permission boundary between frontend and backend.

### Why Not Wails

Architecturally equivalent to Tauri (system WebView, small bundle), but has a smaller community, fewer plugins, and less active development. Go offers no advantage over Rust for this project.

### Why Not NeutralinoJS

Uses a C++ core but is a small, under-resourced project. Documentation is sparse, tooling is limited, and the ecosystem is thin. Not suitable for a portfolio project where polish matters.

### Why Not Flutter Desktop

Flutter uses its own rendering engine — it does not use web technology. The UI is written in Dart using Flutter's widget system, which produces results that look like a mobile app ported to desktop. Dart is further from C++ mentally than Rust is, and the entire web ecosystem (React, Tailwind, CSS animations) is unavailable.

### Why Not Qt + WebEngine

Qt WebEngine embeds a browser inside a Qt application — still requires significant C++ glue code and does not provide the clean frontend/backend separation we want. The WebEngine module itself is large and complex. Worst of both worlds.

### The Case for Tauri

**System WebView — the key architectural difference**

Tauri uses the browser engine the OS already provides:
- Windows → WebView2 (Edge/Chromium, pre-installed on all modern Windows)
- macOS → WebKit
- Linux → WebKitGTK

The user's machine already has the engine. Your app is 5-10 MB instead of 150 MB.

**Explicit security model**

Every backend function the frontend is allowed to call must be explicitly registered. The frontend cannot reach anything that is not whitelisted:

```rust
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![balance])
    // frontend can ONLY call "balance" — nothing else exposed
```

**Typed IPC — no REST boilerplate**

Tauri generates TypeScript bindings for Rust commands. No HTTP server, no JSON parsing boilerplate, no manual serialization:

```typescript
import { invoke } from '@tauri-apps/api';
const result = await invoke<BalanceResult>('balance', { players });
```

**Genuine cross-platform builds**

One command produces platform-native installers:
- Windows → `.msi` / `.exe`
- macOS → `.dmg` / `.app`
- Linux → `.deb` / `.AppImage`

**Frontend is unconstrained**

Tauri does not dictate the frontend framework. React, Svelte, Vue, or plain HTML all work. Vite is the standard dev server.

**Actively maintained**

Tauri v2 shipped in late 2024. Mobile support (iOS/Android) is in progress. Backed by the Commons Conservancy.

---

## Why Rust (for the Tauri backend)

Tauri's command and plugin system is built in Rust — the `#[tauri::command]` macro is Rust-specific. Using C++ would require FFI bridging (`extern "C"` blocks between Rust and C++), which adds build complexity for no gain on a project of this size.

Beyond the framework constraint, Rust provides:

- **Cargo** — unified build system and package manager; eliminates the CMake + vcpkg friction familiar from C++ cross-platform work
- **Memory and concurrency safety** enforced at compile time, without a garbage collector
- **Zero-cost abstractions** — same mental model as C++, different syntax

For a Senior C++ developer, Rust is the most natural adjacent language. Ownership, RAII, no GC, zero-cost abstractions — these are concepts already in use daily. The primary learning cost is the borrow checker.

---

## Algorithm Design

The balancing problem (split N players into 2 teams minimizing ELO difference) is the **balanced partition problem**.

**Current approach: brute force enumeration**

For 2 teams of N/2 players, enumerate all C(N, N/2) subsets and keep the minimum ELO difference split:

| Players | Unique splits | Notes |
|---|---|---|
| 8 | 35 | Microseconds |
| 10 | 126 | Microseconds |
| 12 | 462 | Microseconds |
| 16 | 6,435 | Still instant |

Exact, simple, and fast for all realistic input sizes.

**Extensibility — Strategy Pattern**

The algorithm is hidden behind a trait so it can be swapped without touching the rest of the application:

```rust
trait Matchmaker {
    fn balance(&self, players: Vec<Player>) -> BalanceResult;
}

struct BruteForceMatchmaker;          // current
struct SimulatedAnnealingMatchmaker;  // future: 3+ teams
struct WeightedMatchmaker;            // future: role/lane weighting
```

The Tauri command layer holds a reference to the active `Matchmaker` implementation. The frontend calls one generic command and is unaware of which algorithm runs.

---

## Future Extension Points

| Feature | Algorithm / Change needed |
|---|---|
| 3+ teams (e.g. 12 players → 3×4) | Simulated annealing (NP-hard in general) |
| Role/lane weighting | Weighted partition, new `Matchmaker` impl |
| Session history | SQLite via `rusqlite` crate |
| Tournament bracket | New interface, separate from `Matchmaker` |
| Mobile support | Tauri mobile (in progress upstream) |
