/**
 * Centralized emoji constants for consistent usage across the application
 */

// Flight-related emojis
export const FLIGHT_EMOJIS = {
  // Site navigation
  TAKEOFF: '↗️',
  LANDING: '↘️',
  ARROW: '→',
  
  // General icons
  PARAGLIDER: '🪂',
  PILOT: '👤',
  MOUNTAIN: '🏔️',
  PIN: '📍',
  CALENDAR: '📅',
  FILES: '🗂️',
  COMMUNITY: '👥',
  HOME: '🏠',
  REFRESH: '🔄',
  AIRPLANE: '✈️',
} as const;

// UI-related emojis
export const UI_EMOJIS = {
  WELCOME: '✈️',
} as const;

// All emojis combined for easy import
export const EMOJIS = {
  ...FLIGHT_EMOJIS,
  ...UI_EMOJIS,
} as const;

// Type for all available emojis
export type EmojiKey = keyof typeof EMOJIS;