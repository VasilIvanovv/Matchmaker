# Matchmaker

A desktop app for Legion TD (Warcraft 3) that balances 8 players into two fair teams based on their ELO ratings. Enter the ELOs, hit **Balance Teams**, and get the exact swaps to make.

![Matchmaker screenshot](docs/screenshot.png)

## Features

- Enter ELOs for two teams of 4
- Finds the optimal 4v4 split across all 35 possible combinations
- Shows exactly which players to swap (not just the result)
- Instant — brute-force over 35 splits runs in microseconds

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Backend**: Rust (Tauri v2)
- **Desktop**: Tauri v2 (uses system WebView2, ~5MB bundle)

See [TECH_DECISIONS.md](TECH_DECISIONS.md) for the full reasoning behind the stack.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/) (stable toolchain)
- WebView2 Runtime — pre-installed on Windows 10 (Nov 2020+) and Windows 11

## Running in development

```bash
npm install
npm run tauri dev
```

The app hot-reloads on frontend changes. First run takes 3–5 minutes while Cargo compiles dependencies; subsequent runs are ~30 seconds.

## Building a standalone executable

```bash
npm run tauri build
```

Outputs:
- `src-tauri/target/release/matchmaker.exe` — standalone executable, no installer needed
- `src-tauri/target/release/bundle/nsis/Matchmaker_0.1.0_x64-setup.exe` — Windows installer
- `src-tauri/target/release/bundle/msi/Matchmaker_0.1.0_x64_en-US.msi` — MSI package

## Algorithm

The balancer uses brute-force bitmask enumeration over all C(8,4) = 70 combinations (35 unique splits). It picks the split with the minimum ELO difference between teams.

The algorithm is behind a `Matchmaker` Rust trait, making it easy to swap in a different strategy (e.g. simulated annealing for 3+ teams) without touching the command layer or frontend.

```
src-tauri/src/matchmaker/
├── mod.rs           # Matchmaker trait
├── brute_force.rs   # BruteForceMatchmaker
└── types.rs         # Player, BalanceResult
```

## License

MIT — see [LICENSE](LICENSE).
