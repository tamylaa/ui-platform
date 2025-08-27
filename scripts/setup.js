#!/usr/bin/env node

/**
 * Platform Setup Script
 * 
 * Initializes the UI Platform with all necessary dependencies
 * and configurations for both development and production use.
 */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const platformRoot = path.join(__dirname, '..');

async function setupPlatform() {
  console.log('🔧 Setting up Tamyla UI Platform...\n');
  
  try {
    // 1. Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm install', { 
      cwd: platformRoot, 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    
    // 2. Create necessary directories
    console.log('\n📁 Creating directory structure...');
    const directories = [
      'dist',
      'docs',
      'playground',
      'examples',
      '.storybook',
      'coverage'
    ];
    
    for (const dir of directories) {
      await fs.ensureDir(path.join(platformRoot, dir));
      console.log(`   Created: ${dir}/`);
    }
    
    // 3. Create development configuration files
    await createDevelopmentFiles();
    
    // 4. Create example files
    await createExampleFiles();
    
    // 5. Build packages if they exist
    try {
      console.log('\n🔨 Building packages...');
      execSync('npm run build:packages', { 
        cwd: platformRoot, 
        stdio: 'inherit' 
      });
    } catch (error) {
      console.log('   No packages to build yet (this is normal for initial setup)');
    }
    
    // 6. Create documentation
    await createDocumentation();
    
    console.log('\n✨ Platform setup completed successfully!');
    console.log('\n🚀 Quick start:');
    console.log('  npm run dev        # Start development servers');
    console.log('  npm run build      # Build all packages');
    console.log('  npm run test       # Run tests');
    console.log('  npm run storybook  # Launch Storybook');
    console.log('  npm run playground # Open development playground');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

async function createDevelopmentFiles() {
  console.log('\n⚙️  Creating development configuration...');
  
  // .gitignore
  const gitignore = `# Dependencies
node_modules/
.npm
.yarn
.pnpm-debug.log*

# Build outputs
dist/
build/
.next/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage
coverage/
.nyc_output

# Storybook
storybook-static/

# Testing
.jest-cache/

# Temporary
tmp/
temp/
`;
  
  await fs.writeFile(path.join(platformRoot, '.gitignore'), gitignore);
  console.log('   Created .gitignore');
  
  // .eslintrc.js
  const eslintrc = `module.exports = {
  root: true,
  extends: [
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off'
  },
  ignorePatterns: ['dist/', 'node_modules/', 'coverage/', 'storybook-static/']
};`;
  
  await fs.writeFile(path.join(platformRoot, '.eslintrc.js'), eslintrc);
  console.log('   Created .eslintrc.js');
  
  // .prettierrc
  const prettierrc = `{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}`;
  
  await fs.writeFile(path.join(platformRoot, '.prettierrc'), prettierrc);
  console.log('   Created .prettierrc');
  
  // jest.config.js
  const jestConfig = `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  rootDir: '.',
  roots: ['<rootDir>/src', '<rootDir>/packages'],
  testMatch: [
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/*.(test|spec).{js,jsx,ts,tsx}'
  ],
  transform: {
    '^.+\\\\.(ts|tsx)$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'packages/*/src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/setupTests.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};`;
  
  await fs.writeFile(path.join(platformRoot, 'jest.config.js'), jestConfig);
  console.log('   Created jest.config.js');
}

async function createExampleFiles() {
  console.log('\n📝 Creating example files...');
  
  // Playground HTML
  const playgroundHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tamyla UI Platform - Playground</title>
    <script type="module" src="./playground.js"></script>
    <style>
        body {
            font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 2rem;
            background: #f8f9fa;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .section {
            background: white;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin: 1rem 0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .component-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎨 Tamyla UI Platform Playground</h1>
        
        <div class="section">
            <h2>Framework Detection</h2>
            <p id="framework-info">Detecting framework...</p>
        </div>
        
        <div class="section">
            <h2>🧪 Component Testing</h2>
            <div class="component-grid" id="component-grid">
                <!-- Components will be dynamically added here -->
            </div>
        </div>
        
        <div class="section">
            <h2>🎨 Theme Switching</h2>
            <div id="theme-controls">
                <!-- Theme controls will be added here -->
            </div>
        </div>
    </div>
</body>
</html>`;
  
  await fs.writeFile(path.join(platformRoot, 'playground', 'index.html'), playgroundHtml);
  console.log('   Created playground/index.html');
  
  // Playground JavaScript
  const playgroundJs = `import { Platform, platform } from '../dist/index.esm.js';

// Initialize playground
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎮 Initializing Tamyla UI Platform Playground');
    
    // Display framework info
    const frameworkInfo = document.getElementById('framework-info');
    frameworkInfo.textContent = \`Framework: \${platform.getFramework()} | Version: \${platform.getVersion()}\`;
    
    // Create test components
    createTestComponents();
    
    // Create theme controls
    createThemeControls();
});

function createTestComponents() {
    const grid = document.getElementById('component-grid');
    
    // Test different component types
    const components = [
        { type: 'button', props: { text: 'Primary Button', variant: 'primary' } },
        { type: 'button', props: { text: 'Secondary Button', variant: 'secondary' } },
        { type: 'card', props: { title: 'Test Card', content: 'This is a test card component.' } },
        { type: 'input', props: { placeholder: 'Enter text here...', label: 'Test Input' } }
    ];
    
    components.forEach(({ type, props }) => {
        try {
            const component = platform.create(type, props);
            const wrapper = document.createElement('div');
            wrapper.appendChild(component);
            grid.appendChild(wrapper);
        } catch (error) {
            console.warn(\`Could not create \${type} component:\`, error);
            
            // Create placeholder
            const placeholder = document.createElement('div');
            placeholder.className = 'component-placeholder';
            placeholder.style.cssText = \`
                padding: 1rem;
                border: 2px dashed #ccc;
                border-radius: 0.375rem;
                text-align: center;
                color: #666;
            \`;
            placeholder.textContent = \`\${type} (placeholder)\`;
            grid.appendChild(placeholder);
        }
    });
}

function createThemeControls() {
    const controls = document.getElementById('theme-controls');
    
    const themes = ['default', 'dark', 'professional', 'trading'];
    
    themes.forEach(themeName => {
        const button = document.createElement('button');
        button.textContent = \`\${themeName.charAt(0).toUpperCase()}\${themeName.slice(1)} Theme\`;
        button.style.cssText = \`
            margin: 0.5rem;
            padding: 0.5rem 1rem;
            border: 1px solid #ccc;
            border-radius: 0.25rem;
            background: white;
            cursor: pointer;
        \`;
        
        button.addEventListener('click', () => {
            platform.setTheme(themeName);
            console.log(\`Theme changed to: \${themeName}\`);
        });
        
        controls.appendChild(button);
    });
}`;
  
  await fs.writeFile(path.join(platformRoot, 'playground', 'playground.js'), playgroundJs);
  console.log('   Created playground/playground.js');
}

async function createDocumentation() {
  console.log('\n📚 Creating documentation structure...');
  
  const docsStructure = [
    'getting-started.md',
    'architecture.md',
    'components.md',
    'theming.md',
    'migration.md',
    'contributing.md'
  ];
  
  for (const doc of docsStructure) {
    const docPath = path.join(platformRoot, 'docs', doc);
    if (!await fs.pathExists(docPath)) {
      await fs.writeFile(docPath, `# ${doc.replace('-', ' ').replace('.md', '')}\n\nTODO: Add documentation content\n`);
      console.log(`   Created docs/${doc}`);
    }
  }
}

// Run setup
if (import.meta.url === `file://${process.argv[1]}`) {
  setupPlatform().catch(console.error);
}
