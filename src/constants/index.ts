/**
 * Shared constants
 */

import type { TaskCategory, UserPreferences } from '../types/models';

export const CATEGORY_LABELS: Record<TaskCategory | string, string> = {
  home: 'Home',
  work: 'Work',
  'self-care': 'Self-care',
  admin: 'Admin',
  planning: 'Planning',
  other: 'Other',
};

export const ENERGY_LABELS: Record<string, string> = {
  low: 'Low energy',
  medium: 'Medium energy',
  high: 'High energy',
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  preferredStepLengthMinutes: 3,
  breakAfterSteps: 3,
  breakMinutes: 2,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  nudgeTimes: ['09:00', '14:00'],
  notificationEnabled: true,
  timerEnabled: true,
  microStepDetailLevel: 'simple',
  theme: 'system',
};
