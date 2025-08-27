/**
 * React Exports
 * 
 * React-specific components and utilities
 */

import { Platform } from '../platform/index.js';

// Create React-specific platform instance
const reactPlatform = Platform.create({ framework: 'react' });

// Export React component factories
export const Button = reactPlatform.button;
export const Card = reactPlatform.card;
export const Input = reactPlatform.input;
export const SearchBar = reactPlatform.searchBar;
export const ActionCard = reactPlatform.actionCard;
export const ContentCard = reactPlatform.contentCard;
export const Dashboard = reactPlatform.dashboard;
export const SearchInterface = reactPlatform.searchInterface;
export const ContentManager = reactPlatform.contentManager;
export const EnhancedSearch = reactPlatform.enhancedSearch;
export const CampaignSelector = reactPlatform.campaignSelector;

// Export generic factory
export const create = reactPlatform.create;

// Export platform instance
export { reactPlatform as platform };

// React-specific utilities
export const PlatformProvider = ({ children, theme = 'default' }: any) => {
  // This would be a proper React context provider
  // For now, just return children with theme applied
  if (typeof window !== 'undefined') {
    reactPlatform.setTheme(theme);
  }
  return children;
};

// Re-export types
export type {
  ButtonProps,
  CardProps,
  InputProps,
  ComponentProps,
} from '../types/platform.js';
