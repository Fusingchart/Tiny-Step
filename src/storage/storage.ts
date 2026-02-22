/**
 * Persistent storage layer using AsyncStorage
 * Designed for future migration to encrypted/cloud sync.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task, TaskTemplate, Session, UserPreferences, UserInsights, Routine } from '../types/models';

const KEYS = {
  TASKS: '@nextstep/tasks',
  TEMPLATES: '@nextstep/templates',
  SESSIONS: '@nextstep/sessions',
  SESSION_EVENTS: '@nextstep/session_events',
  PREFERENCES: '@nextstep/preferences',
  INSIGHTS: '@nextstep/insights',
  ROUTINES: '@nextstep/routines',
} as const;

export const storage = {
  async getTasks(): Promise<Task[]> {
    const raw = await AsyncStorage.getItem(KEYS.TASKS);
    return raw ? JSON.parse(raw) : [];
  },

  async saveTasks(tasks: Task[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  },

  async getTemplates(): Promise<TaskTemplate[]> {
    const raw = await AsyncStorage.getItem(KEYS.TEMPLATES);
    return raw ? JSON.parse(raw) : [];
  },

  async saveTemplates(templates: TaskTemplate[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
  },

  async getSessions(): Promise<Session[]> {
    const raw = await AsyncStorage.getItem(KEYS.SESSIONS);
    return raw ? JSON.parse(raw) : [];
  },

  async saveSessions(sessions: Session[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
  },

  async getPreferences(): Promise<UserPreferences | null> {
    const raw = await AsyncStorage.getItem(KEYS.PREFERENCES);
    return raw ? JSON.parse(raw) : null;
  },

  async savePreferences(prefs: UserPreferences): Promise<void> {
    await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
  },

  async getInsights(): Promise<UserInsights | null> {
    const raw = await AsyncStorage.getItem(KEYS.INSIGHTS);
    return raw ? JSON.parse(raw) : null;
  },

  async saveInsights(insights: UserInsights): Promise<void> {
    await AsyncStorage.setItem(KEYS.INSIGHTS, JSON.stringify(insights));
  },

  async getRoutines(): Promise<Routine[]> {
    const raw = await AsyncStorage.getItem(KEYS.ROUTINES);
    return raw ? JSON.parse(raw) : [];
  },

  async saveRoutines(routines: Routine[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.ROUTINES, JSON.stringify(routines));
  },

  async exportData(): Promise<string> {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks: await this.getTasks(),
      templates: await this.getTemplates(),
      routines: await this.getRoutines(),
      preferences: await this.getPreferences(),
      insights: await this.getInsights(),
    };
    return JSON.stringify(data, null, 2);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
