# E2E Test Suite Infrastructure & Harness Guide

## Overview
The E2E Test Suite for **Bhargavi's Arcade Platform** provides requirement-driven, deterministic testing across 4 comprehensive tiers (125 total test cases) covering the central dashboard and all 9 games.

## Test Runner Architecture
- **Framework**: Custom Node.js Test Runner with `jsdom` DOM simulation.
- **Directory**: `/data/data/com.termux/files/home/arcade_builder/bhargavis-arcade/tests/`
- **Main Runner**: `tests/run_tests.js`
- **DOM Harness Helper**: `tests/helpers/dom_harness.js`

### Test Files Structure
```
tests/
├── helpers/
│   └── dom_harness.js           # DOM loader, AudioContext & Canvas 2D context mocks, CSS bundle importer
├── tier1_feature_coverage.test.js # Tier 1: Feature Coverage (50 test cases, 5 per feature)
├── tier2_boundary_corner.test.js  # Tier 2: Boundary & Corner Cases (50 test cases, 5 per feature)
├── tier3_cross_feature.test.js    # Tier 3: Cross-Feature Pairwise Combinations (15 test cases)
├── tier4_real_world.test.js       # Tier 4: End-to-End Real-World User Sessions (10 test cases)
└── run_tests.js                   # Master CLI Test Suite Executable
```

## Mock & Environment Harness Features
1. **AudioContext Mocking**: Simulates browser Web Audio API `AudioContext` states (`suspended`, `running`), `resume()`, `createOscillator()`, and `createGain()`.
2. **Canvas 2D Rendering Context Stub**: Intercepts `canvas.getContext('2d')` and tracks drawing operations without requiring native binary dependencies.
3. **`localStorage` Isolation**: Provides per-test isolated key-value storage for high scores and streaks without opaque origin errors.
4. **Game Loop Timer Guard**: Mocks `requestAnimationFrame`, `cancelAnimationFrame`, `setInterval`, and `clearInterval` to prevent async loop leaks and keep test execution ultra-fast (<2 seconds).
5. **CSS `@import` Resolution**: Resolves and bundles nested CSS imports (`shared/arcade-theme.css`) to verify glassmorphism and color palette tokens.

## How to Run Tests

### Run Full Test Suite
```bash
node tests/run_tests.js
```

### Verify Runner Non-Zero Exit Code on Failure
```bash
node tests/run_tests.js --verify-failure
```

## Exit Codes
- `0`: All tests passed.
- `1`: One or more tests failed.
