# Quick Start Guide

## 🚀 Getting Started with Tamyla UI Platform

### 1. Initial Setup

```bash
# Navigate to the platform directory
cd ui-platform

# Run the setup script
node scripts/setup.js

# Install dependencies
npm install
```

### 2. Migrate Existing Packages (Optional)

If you have existing `ui-components` and `ui-components-react` packages:

```bash
# Run the migration script
node scripts/migrate-packages.js
```

This will:
- Move existing packages to `packages/` directory
- Update package configurations for workspace compatibility
- Create backward compatibility symlinks

### 3. Development

```bash
# Start development servers for all packages
npm run dev

# Build all packages
npm run build

# Run tests
npm run test

# Start Storybook
npm run storybook

# Open playground
npm run playground
```

### 4. Usage Examples

#### Universal Platform API (Auto-detects Framework)
```javascript
import { Platform } from '@tamyla/ui-platform';

const ui = Platform.create();
const button = ui.button({ text: 'Click me!', variant: 'primary' });
```

#### Vanilla JavaScript
```javascript
import { createButton, createCard } from '@tamyla/ui-platform/vanilla';

const button = createButton({ text: 'Hello', variant: 'primary' });
const card = createCard({ title: 'My Card', content: 'Content here' });
```

#### React
```tsx
import React from 'react';
import { Button, Card, PlatformProvider } from '@tamyla/ui-platform/react';

function App() {
  return (
    <PlatformProvider theme="default">
      <Card>
        <Button variant="primary">Hello World</Button>
      </Card>
    </PlatformProvider>
  );
}
```

### 5. Project Structure

```
ui-platform/
├── packages/                 # Workspace packages
│   ├── ui-components/       # Vanilla JS components
│   └── ui-components-react/ # React components
├── src/                     # Platform core
│   ├── platform/           # Platform orchestration
│   ├── core/               # Shared utilities
│   ├── tokens/             # Design tokens
│   └── types/              # TypeScript definitions
├── playground/             # Development playground
├── docs/                   # Documentation
├── examples/              # Usage examples
└── scripts/               # Build and utility scripts
```

### 6. Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development servers |
| `npm run build` | Build all packages |
| `npm run test` | Run test suite |
| `npm run lint` | Lint code |
| `npm run format` | Format code |
| `npm run storybook` | Launch Storybook |
| `npm run playground` | Open development playground |
| `npm run docs` | Generate and serve docs |

### 7. Next Steps

1. **Review the architecture** in `docs/architecture.md`
2. **Check component documentation** in `docs/components.md`
3. **Explore theming** in `docs/theming.md`
4. **Read migration guide** in `docs/migration.md`
5. **Start contributing** with `docs/contributing.md`

### 8. Troubleshooting

#### Common Issues

1. **Package not found errors**: Run `npm run build` to ensure all packages are built
2. **Type errors**: Check TypeScript configuration in `tsconfig.json`
3. **Build failures**: Ensure all dependencies are installed with `npm install`

#### Getting Help

- Check the documentation in the `docs/` directory
- Review examples in the `examples/` directory
- Use the playground for testing: `npm run playground`
- Check the issues on GitHub

### 9. Production Deployment

```bash
# Build for production
npm run build

# Run tests
npm run validate

# Publish packages
npm run publish:all
```

The platform ensures all UI elements evolve through a single source while maintaining framework separation and providing excellent developer experience.
