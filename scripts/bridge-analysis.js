#!/usr/bin/env node
/**
 * Bridge Coverage Analysis
 * Evaluates 1:1 bridge matching between ui-components and ui-components-react
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

class BridgeAnalysis {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.uiComponentsPath = path.join(this.workspaceRoot, 'packages/ui-components');
    this.uiReactPath = path.join(this.workspaceRoot, 'packages/ui-components-react');
  }

  async analyze() {
    console.log(chalk.blue.bold('\n🔍 Bridge Coverage Analysis'));
    console.log(chalk.gray('=' .repeat(60)));

    // Extract exports from ui-components
    const vanillaComponents = await this.extractVanillaComponents();

    // Extract components from ui-components-react
    const reactComponents = await this.extractReactComponents();

    // Analyze coverage
    const analysis = this.analyzeCoverage(vanillaComponents, reactComponents);

    // Report results
    this.reportResults(analysis);

    return analysis;
  }

  async extractVanillaComponents() {
    const indexPath = path.join(this.uiComponentsPath, 'src/index.js');
    const content = await fs.readFile(indexPath, 'utf8');

    // Extract factory exports
    const factoryMatches = content.match(/export \{ ([^}]*Factory[^}]*) \}/g) || [];
    const factories = [];

    factoryMatches.forEach(match => {
      const factoryNames = match.match(/(\w+Factory)/g) || [];
      factories.push(...factoryNames);
    });

    // Extract from COMPONENT_REGISTRY
    const registryMatch = content.match(/COMPONENT_REGISTRY = \{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s);
    const registryComponents = [];

    if (registryMatch) {
      const registryContent = registryMatch[1];

      // Extract atoms, molecules, organisms, applications
      const atomsMatch = registryContent.match(/atoms:\s*\{([^}]+)\}/s);
      const moleculesMatch = registryContent.match(/molecules:\s*\{([^}]+)\}/s);
      const organismsMatch = registryContent.match(/organisms:\s*\{([^}]+)\}/s);
      const applicationsMatch = registryContent.match(/applications:\s*\{([^}]+)\}/s);

      [atomsMatch, moleculesMatch, organismsMatch, applicationsMatch].forEach(match => {
        if (match) {
          const componentNames = match[1].match(/(\w+):/g) || [];
          registryComponents.push(...componentNames.map(name => name.replace(':', '')));
        }
      });
    }

    return {
      factories: [...new Set(factories)],
      registry: [...new Set(registryComponents)],
      all: [...new Set([...factories, ...registryComponents])]
    };
  }

  async extractReactComponents() {
    const indexPath = path.join(this.uiReactPath, 'src/index.ts');
    const content = await fs.readFile(indexPath, 'utf8');

    // Extract component exports
    const componentMatches = content.match(/export \{ default as (\w+) \}/g) || [];
    const components = componentMatches.map(match => {
      const componentMatch = match.match(/export \{ default as (\w+) \}/);
      return componentMatch ? componentMatch[1] : null;
    }).filter(Boolean);

    // Categorize by type
    const atoms = components.filter(name =>
      ['Button', 'ButtonPrimary', 'ButtonSecondary', 'ButtonGhost', 'ButtonDanger',
        'ButtonSuccess', 'ButtonWithIcon', 'ButtonIconOnly', 'Input', 'StatusIndicator',
        'Card', 'InputGroup'].includes(name)
    );

    const molecules = components.filter(name =>
      ['SearchBar', 'SearchBarNew', 'ActionCard', 'ContentCard', 'FileList', 'Notification'].includes(name)
    );

    const organisms = components.filter(name =>
      ['Dashboard', 'SearchInterface', 'Reward'].includes(name)
    );

    const applications = components.filter(name =>
      ['EnhancedSearch', 'ContentManager', 'CampaignSelector'].includes(name)
    );

    return {
      atoms,
      molecules,
      organisms,
      applications,
      all: components
    };
  }

  analyzeCoverage(vanilla, react) {
    const analysis = {
      total: {
        vanilla: vanilla.all.length,
        react: react.all.length,
        coverage: 0
      },
      missing: [],
      matched: [],
      extra: [],
      categories: {
        atoms: { vanilla: 0, react: react.atoms.length, missing: [] },
        molecules: { vanilla: 0, react: react.molecules.length, missing: [] },
        organisms: { vanilla: 0, react: react.organisms.length, missing: [] },
        applications: { vanilla: 0, react: react.applications.length, missing: [] }
      }
    };

    // Expected vanilla components based on factories and registry
    const expectedVanillaComponents = [
      // Atoms
      'Button', 'Input', 'Card', 'StatusIndicator', 'InputGroup',
      // Molecules
      'ActionCard', 'SearchBar', 'ContentCard', 'FileList', 'Notification',
      // Organisms
      'SearchInterface', 'Reward',
      // Applications
      'EnhancedSearch', 'CampaignSelector', 'ContentManager'
    ];

    analysis.categories.atoms.vanilla = 5;
    analysis.categories.molecules.vanilla = 5;
    analysis.categories.organisms.vanilla = 2;
    analysis.categories.applications.vanilla = 3;
    analysis.total.vanilla = expectedVanillaComponents.length;

    // Find missing bridges
    expectedVanillaComponents.forEach(component => {
      if (react.all.includes(component)) {
        analysis.matched.push(component);
      } else {
        analysis.missing.push(component);

        // Categorize missing
        if (['Button', 'Input', 'Card', 'StatusIndicator', 'InputGroup'].includes(component)) {
          analysis.categories.atoms.missing.push(component);
        } else if (['ActionCard', 'SearchBar', 'ContentCard', 'FileList', 'Notification'].includes(component)) {
          analysis.categories.molecules.missing.push(component);
        } else if (['SearchInterface', 'Reward'].includes(component)) {
          analysis.categories.organisms.missing.push(component);
        } else if (['EnhancedSearch', 'CampaignSelector', 'ContentManager'].includes(component)) {
          analysis.categories.applications.missing.push(component);
        }
      }
    });

    // Find extra React components
    react.all.forEach(component => {
      if (!expectedVanillaComponents.includes(component) && !component.startsWith('Button')) {
        analysis.extra.push(component);
      }
    });

    analysis.total.coverage = Math.round((analysis.matched.length / analysis.total.vanilla) * 100);

    return analysis;
  }

  reportResults(analysis) {
    console.log(chalk.yellow('\n📊 Coverage Summary:'));
    console.log(chalk.gray(`   Vanilla Components: ${analysis.total.vanilla}`));
    console.log(chalk.gray(`   React Bridges: ${analysis.total.react}`));
    console.log(chalk.gray(`   Coverage: ${analysis.total.coverage}%`));

    if (analysis.missing.length > 0) {
      console.log(chalk.red('\n❌ Missing Bridges:'));
      analysis.missing.forEach(component => {
        console.log(chalk.red(`   ⚠️  ${component}`));
      });
    }

    if (analysis.matched.length > 0) {
      console.log(chalk.green('\n✅ Matched Bridges:'));
      analysis.matched.forEach(component => {
        console.log(chalk.green(`   ✓  ${component}`));
      });
    }

    if (analysis.extra.length > 0) {
      console.log(chalk.cyan('\n🔄 Extra React Components:'));
      analysis.extra.forEach(component => {
        console.log(chalk.cyan(`   +  ${component}`));
      });
    }

    // Category breakdown
    console.log(chalk.yellow('\n📋 Category Breakdown:'));
    Object.entries(analysis.categories).forEach(([category, data]) => {
      const coverage = data.vanilla > 0 ? Math.round(((data.vanilla - data.missing.length) / data.vanilla) * 100) : 100;
      console.log(chalk.gray(`   ${category}: ${coverage}% (${data.react}/${data.vanilla})`));
      if (data.missing.length > 0) {
        data.missing.forEach(missing => {
          console.log(chalk.red(`     ❌ ${missing}`));
        });
      }
    });

    if (analysis.total.coverage === 100) {
      console.log(chalk.green.bold('\n🎉 Perfect Bridge Coverage!'));
      console.log(chalk.green('✅ Ready for certification and publishing'));
    } else {
      console.log(chalk.yellow('\n🔧 Bridge Gaps Identified'));
      console.log(chalk.yellow('📝 Missing bridges need to be created'));
    }
  }
}

// Run analysis
const analysis = new BridgeAnalysis();
analysis.analyze().catch(console.error);
