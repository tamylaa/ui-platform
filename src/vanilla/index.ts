/**
 * Vanilla JS Exports
 * 
 * Direct access to vanilla JavaScript components
 */

import { Platform } from '../platform/index.js';

// Create vanilla-specific platform instance
const vanillaPlatform = Platform.create({ framework: 'vanilla' });

// Export component factories
export const createButton = vanillaPlatform.button;
export const createCard = vanillaPlatform.card;
export const createInput = vanillaPlatform.input;
export const createSearchBar = vanillaPlatform.searchBar;
export const createActionCard = vanillaPlatform.actionCard;
export const createContentCard = vanillaPlatform.contentCard;
export const createDashboard = vanillaPlatform.dashboard;
export const createSearchInterface = vanillaPlatform.searchInterface;
export const createContentManager = vanillaPlatform.contentManager;
export const createEnhancedSearch = vanillaPlatform.enhancedSearch;
export const createCampaignSelector = vanillaPlatform.campaignSelector;

// Export generic factory
export const create = vanillaPlatform.create;

// Export platform instance
export { vanillaPlatform as platform };

// Re-export types
export type {
  ButtonProps,
  CardProps,
  InputProps,
  ComponentProps,
} from '../types/platform.js';
