# Tamyla UI Platform

🚀 **Unified UI Platform** - The central hub for all Tamyla UI components and design systems.

[![npm version](https://badge.fury.io/js/%40tamyla%2Fui-platform.svg)](https://badge.fury.io/js/%40tamyla%2Fui-platform)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## 🎯 Overview

The **Tamyla UI Platform** is a comprehensive design system that unifies and orchestrates both vanilla JavaScript and React UI components. It provides a single source of truth for all UI elements while maintaining separate, distinct packages for different frameworks.

### Architecture Philosophy

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Platform                               │
│  ┌─────────────────┐              ┌─────────────────────┐   │
│  │  UI Components  │              │ UI Components React │   │
│  │   (Vanilla JS)  │◄────────────►│     (React)         │   │
│  └─────────────────┘              └─────────────────────┘   │
│           │                                   │             │
│           └──────────┬────────────────────────┘             │
│                      │                                      │
│           ┌─────────────────────────┐                       │
│           │    Shared Core          │                       │
│           │  • Design Tokens        │                       │
│           │  • Theme System         │                       │
│           │  • Type Definitions     │                       │
│           │  • Common Utilities     │                       │
│           └─────────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

## ✨ Key Benefits

- **🎯 Single Source of Truth**: All UI elements evolve through this platform
- **🔄 Framework Agnostic**: Support for both vanilla JS and React
- **🎨 Design Consistency**: Shared design tokens and theme system
- **📦 Modular**: Use only what you need
- **🔧 Developer Experience**: Enhanced tooling and development workflow
- **📚 Unified Documentation**: One place for all UI documentation
- **🚀 CI/CD Integration**: Automated testing and deployment

## 📦 Installation

### Install the Platform (Recommended)
```bash
npm install @tamyla/ui-platform
```

### Or Install Individual Packages
```bash
# Vanilla JavaScript components
npm install @tamyla/ui-components

# React components
npm install @tamyla/ui-components-react
```

## 🚀 Quick Start

### Universal Platform API
```javascript
import { Platform } from '@tamyla/ui-platform';

// Initialize platform
const ui = Platform.create({
  framework: 'auto', // 'vanilla', 'react', or 'auto'
  theme: 'default'
});

// Create components (framework automatically detected)
const button = ui.button({ text: 'Click me!' });
const card = ui.card({ title: 'My Card' });
```

### Vanilla JavaScript
```javascript
import { createButton, createCard } from '@tamyla/ui-platform/vanilla';

const button = createButton({ 
  text: 'Hello World',
  variant: 'primary' 
});

document.body.appendChild(button);
```

### React
```tsx
import React from 'react';
import { Button, Card, PlatformProvider } from '@tamyla/ui-platform/react';

function App() {
  return (
    <PlatformProvider theme="default">
      <Card>
        <Button variant="primary">
          Hello World
        </Button>
      </Card>
    </PlatformProvider>
  );
}
```

## 🏗️ Project Structure

```
ui-platform/
├── packages/
│   ├── ui-components/          # Vanilla JS components (workspace)
│   └── ui-components-react/    # React components (workspace)
├── src/
│   ├── core/                   # Shared platform core
│   ├── tokens/                 # Design tokens
│   ├── platform/               # Platform orchestration
│   └── types/                  # Shared TypeScript definitions
├── playground/                 # Development playground
├── docs/                       # Documentation
├── scripts/                    # Build and utility scripts
└── examples/                   # Usage examples
```

## 🎨 Design System

### Design Tokens
All design tokens are centralized and shared across both packages:

```javascript
import { tokens } from '@tamyla/ui-platform/tokens';

console.log(tokens.colors.primary); // #007bff
console.log(tokens.spacing.md);     // 16px
console.log(tokens.typography.body); // Font family and size
```

### Theme System
```javascript
import { ThemeProvider, createTheme } from '@tamyla/ui-platform/core';

const customTheme = createTheme({
  colors: {
    primary: '#ff6b35',
    secondary: '#004e89'
  }
});
```

## 📚 Component Categories

### Atoms (Basic Building Blocks)
- Button, Input, Card, Icon, Badge, Avatar, Spinner

### Molecules (Component Combinations)
- SearchBar, ActionCard, ContentCard, Notification, FileList

### Organisms (Complete Interface Sections)
- Dashboard, SearchInterface, Navigation, Header, Footer

### Applications (Full Features)
- ContentManager, EnhancedSearch, CampaignSelector

## 🔧 Development

### Getting Started
```bash
# Clone and setup
git clone <repo-url>
cd ui-platform
npm run bootstrap

# Start development
npm run dev

# Run tests
npm run test

# Build everything
npm run build
```

### Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development servers for all packages |
| `npm run build` | Build all packages and platform |
| `npm run test` | Run tests across all packages |
| `npm run lint` | Lint all code |
| `npm run docs` | Generate and serve documentation |
| `npm run playground` | Start development playground |
| `npm run storybook` | Start Storybook |

### Adding New Components

1. **Design**: Create component design in Figma/design tool
2. **Tokens**: Update design tokens if needed
3. **Vanilla**: Implement in `packages/ui-components`
4. **React**: Implement React wrapper in `packages/ui-components-react`
5. **Test**: Add comprehensive tests
6. **Document**: Update documentation and Storybook
7. **Version**: Use semantic versioning

## 🧪 Testing Strategy

- **Unit Tests**: Jest for all component logic
- **Integration Tests**: Cross-package compatibility
- **Visual Tests**: Storybook visual regression
- **E2E Tests**: Playwright for full workflows
- **Performance Tests**: Bundle size and runtime performance

## 📖 Documentation

- **[Design System Guide](./docs/design-system.md)** - Complete design system documentation
- **[Component API](./docs/components.md)** - Detailed component APIs
- **[Migration Guide](./docs/migration.md)** - Upgrading from individual packages
- **[Contribution Guide](./docs/contributing.md)** - How to contribute
- **[Architecture](./docs/architecture.md)** - Technical architecture details

## 🔄 Migration from Individual Packages

### From @tamyla/ui-components
```diff
- import { createButton } from '@tamyla/ui-components';
+ import { createButton } from '@tamyla/ui-platform/vanilla';
```

### From @tamyla/ui-components-react
```diff
- import { Button } from '@tamyla/ui-components-react';
+ import { Button } from '@tamyla/ui-platform/react';
```

## 🚀 Deployment & Publishing

The platform uses automated CI/CD:

1. **Version Management**: Synchronized versioning across packages
2. **Automated Testing**: Full test suite on every PR
3. **Bundle Analysis**: Performance monitoring
4. **Security Scanning**: Dependency vulnerability checks
5. **Documentation**: Auto-generated docs and Storybook

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/contributing.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make changes following our guidelines
4. Add tests and documentation
5. Submit a pull request

## 📄 License

MIT © [Tamyla Team](https://github.com/tamylaa)

## 🔗 Links

- **Platform**: [@tamyla/ui-platform](https://npmjs.com/package/@tamyla/ui-platform)
- **Vanilla Components**: [@tamyla/ui-components](https://npmjs.com/package/@tamyla/ui-components)
- **React Components**: [@tamyla/ui-components-react](https://npmjs.com/package/@tamyla/ui-components-react)
- **Documentation**: [UI Platform Docs](https://tamylaa.github.io/ui-platform)
- **Storybook**: [Component Library](https://tamylaa.github.io/ui-platform-storybook)
