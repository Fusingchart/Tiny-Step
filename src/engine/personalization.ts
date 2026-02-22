/**
 * Personalization and learning logic
 * Tracks what works per user, adapts defaults.
 */

import { format, addDays } from 'date-fns';
import type { UserPreferences, UserInsights, TaskCategory } from '../types/models';
import { storage } from '../storage/storage';
import { DEFAULT_PREFERENCES, CATEGORY_LABELS } from '../constants';

export async function getPreferences(): Promise<UserPreferences> {
  const prefs = await storage.getPreferences();
  return { ...DEFAULT_PREFERENCES, ...prefs };
}

export async function savePreferences(prefs: Partial<UserPreferences>): Promise<void> {
  const current = await getPreferences();
  await storage.savePreferences({ ...current, ...prefs });
}

/**
 * Update insights from session completion
 */
export async function recordSessionComplete(
  stepsCompleted: number,
  sessionStartHour: number,
  categories: TaskCategory[],
  templateIds: string[]
): Promise<void> {
  const insights = await storage.getInsights();
  const today = format(new Date(), 'yyyy-MM-dd');

  const base: UserInsights = {
    bestCompletionTimes: [],
    bestStepLengthMinutes: 3,
    mostCompletedCategories: [],
    frequentTemplates: [],
    totalMicroStepsCompleted: 0,
    totalSessionsCompleted: 0,
    currentStreak: 0,
    lastActiveDate: undefined,
  };

  const next = { ...base, ...insights };
  next.totalMicroStepsCompleted += stepsCompleted;
  next.totalSessionsCompleted += 1;
  next.lastActiveDate = today;

  // Streak logic
  if (insights?.lastActiveDate) {
    const last = new Date(insights.lastActiveDate);
    const prev = addDays(new Date(), -1);
    if (format(last, 'yyyy-MM-dd') === format(prev, 'yyyy-MM-dd')) {
      next.currentStreak = (insights.currentStreak || 0) + 1;
    } else if (format(last, 'yyyy-MM-dd') !== today) {
      next.currentStreak = 1;
    } else {
      next.currentStreak = insights.currentStreak || 1;
    }
  } else {
    next.currentStreak = 1;
  }

  // Simple learning: track session start hour
  const hours = next.bestCompletionTimes as string[];
  const hourStr = String(sessionStartHour).padStart(2, '0') + ':00';
  if (!hours.includes(hourStr)) {
    hours.push(hourStr);
    next.bestCompletionTimes = hours.slice(-5);
  }

  // Track categories
  for (const c of categories) {
    const idx = next.mostCompletedCategories.indexOf(c);
    if (idx >= 0) next.mostCompletedCategories.splice(idx, 1);
    next.mostCompletedCategories.unshift(c);
  }
  next.mostCompletedCategories = next.mostCompletedCategories.slice(0, 5);

  // Track templates
  for (const t of templateIds) {
    const arr = next.frequentTemplates;
    const idx = arr.indexOf(t);
    if (idx >= 0) arr.splice(idx, 1);
    arr.unshift(t);
    next.frequentTemplates = arr.slice(0, 10);
  }

  await storage.saveInsights(next);
}

export function getFriendlyInsight(insights: UserInsights | null): string | null {
  if (!insights) return null;
  const hours = insights.bestCompletionTimes;
  if (hours?.length) {
    const h = hours[0];
    const [hour] = h.split(':').map(Number);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const h12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `You tend to get more done around ${h12}${ampm}.`;
  }
  if (insights.mostCompletedCategories?.length) {
    const cat = insights.mostCompletedCategories[0];
    return `${CATEGORY_LABELS[cat] || cat} tasks work well for you.`;
  }
  return null;
}
