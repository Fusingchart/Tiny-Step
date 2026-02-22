/**
 * Next Step - Core data models
 * Designed for extensibility: household/shared support can be added later.
 */

export type TaskCategory = 'home' | 'work' | 'self-care' | 'admin' | 'planning' | 'other';
export type TaskContext = 'home' | 'office' | 'phone' | 'computer' | 'anywhere';
export type EnergyLevel = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  category?: TaskCategory;
  context?: TaskContext;
  energyLevel?: EnergyLevel;
  dueDate?: string; // ISO date string
  microSteps?: MicroStep[];
  templateId?: string; // Reference to saved template
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface MicroStep {
  id: string;
  text: string;
  order: number;
  suggestedMinutes?: number; // 1-5 min typically
  completed?: boolean;
}

export interface TaskTemplate {
  id: string;
  name: string;
  category: TaskCategory;
  microSteps: Omit<MicroStep, 'id' | 'completed'>[];
  isBuiltIn: boolean;
  usageCount?: number;
}

export interface Session {
  id: string;
  taskId: string;
  taskTitle: string;
  microSteps: MicroStep[];
  currentStepIndex: number;
  startedAt: string;
  completedSteps: string[]; // MicroStep ids
  status: 'active' | 'completed' | 'paused' | 'abandoned';
}

export interface SessionEvent {
  id: string;
  sessionId: string;
  microStepId: string;
  action: 'completed' | 'skipped' | 'made_smaller';
  timestamp: string;
  stepDurationMs?: number;
}

export interface UserPreferences {
  preferredStepLengthMinutes: number;
  breakAfterSteps: number;
  breakMinutes: number;
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string; // "08:00"
  nudgeTimes: string[];
  notificationEnabled: boolean;
  timerEnabled: boolean;
  microStepDetailLevel: 'simple' | 'explicit';
  theme: 'light' | 'dark' | 'system';
}

export interface UserInsights {
  bestCompletionTimes: string[];
  bestStepLengthMinutes: number;
  mostCompletedCategories: TaskCategory[];
  frequentTemplates: string[];
  totalMicroStepsCompleted: number;
  totalSessionsCompleted: number;
  currentStreak: number;
  lastActiveDate?: string;
}

export type RoutineFrequency = 'daily' | 'weekly' | 'monthly' | 'custom';
export interface Routine {
  id: string;
  taskTemplateId: string;
  taskTitle: string;
  frequency: RoutineFrequency;
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  timeOfDay?: string; // "20:00"
}
