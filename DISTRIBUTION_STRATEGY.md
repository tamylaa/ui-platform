# UI Platform Distribution Strategy

## Problem Statement
The current monorepo approach conflicts with the original architectural vision of independent packages with their own certification processes.

## Recommended Solution: Separate Repository Publishing

### Phase 1: Maintain Current Structure for Development
- Keep the monorepo for unified development and testing
- Maintain workspace dependencies for development ease
- Keep shared build processes for consistency

### Phase 2: Automated Repository Mirroring
Create scripts that automatically sync each package to its own repository:

```
┌─── ui-platform (monorepo) ───┐
│                              │
│  packages/ui-components/ ────┼──→ github.com/tamylaa/ui-components
│  packages/ui-components-react├──→ github.com/tamylaa/ui-components-react  
│  src/ (platform layer) ─────┼──→ github.com/tamylaa/ui-platform
│                              │
└──────────────────────────────┘
```

### Phase 3: Independent Publishing
- Each repository maintains its own certification process
- ui-components: Published as standalone vanilla JS package
- ui-components-react: Published with dependency on npm-published ui-components
- ui-platform: Published as orchestration layer (optional for consumers)

## Benefits of This Approach

### ✅ Preserves Original Architecture
- Factory bridge pattern remains pure
- Independent certification processes
- Clear separation of concerns

### ✅ Maintains Development Efficiency  
- Monorepo for development
- Shared tooling and processes
- Unified testing

### ✅ Flexible Distribution
- Consumers can install just what they need:
  - `npm install @tamyla/ui-components` (vanilla only)
  - `npm install @tamyla/ui-components-react` (includes bridge)
  - `npm install @tamyla/ui-platform` (full orchestration)

### ✅ Independent Versioning
- Each package can evolve at its own pace
- Breaking changes don't affect all consumers
- Semantic versioning per package

## Implementation Plan

1. **Keep Current Monorepo** for development
2. **Create Mirror Scripts** to sync to separate repos
3. **Update package.json** dependencies to use npm packages
4. **Maintain Certification Scripts** in each package
5. **Set up Independent CI/CD** for each repository

## Package Dependencies (Published)

```
@tamyla/ui-components (standalone)
    ↑
@tamyla/ui-components-react (depends on ui-components from npm)
    ↑
@tamyla/ui-platform (depends on both from npm)
```

This preserves the factory bridge pattern while allowing independent consumption.
