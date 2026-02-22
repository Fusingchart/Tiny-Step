/**
 * App context - tasks, templates, session, preferences
 */

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import type { Task, MicroStep, TaskTemplate, Session, UserPreferences, UserInsights } from '../types/models';
import { storage } from '../storage/storage';
import { generateMicroSteps, makeStepSmaller } from '../engine/microStepGenerator';
import { getPreferences, savePreferences, recordSessionComplete } from '../engine/personalization';
import { analytics } from '../services/analytics';
import { DEFAULT_PREFERENCES } from '../constants';
import { TEMPLATE_LIBRARY, QUICK_ADD_PRESETS } from '../data/templates';

interface AppContextValue {
  tasks: Task[];
  templates: TaskTemplate[];
  activeSession: Session | null;
  preferences: UserPreferences | null;
  insights: UserInsights | null;
  addTask: (t: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTask: (id: string) => Task | undefined;
  generateSteps: (task: Task) => MicroStep[];
  saveTaskTemplate: (taskId: string, name: string) => Promise<TaskTemplate>;
  startSession: (taskId: string) => Session | null;
  completeStep: (sessionId: string, stepId: string) => void;
  skipStep: (sessionId: string, stepId: string) => void;
  makeStepSmaller: (sessionId: string, stepId: string) => void;
  endSession: (sessionId: string, completed: boolean) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  loadPreferences: () => Promise<void>;
  loadInsights: () => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  quickAddPresets: typeof QUICK_ADD_PRESETS;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [insights, setInsights] = useState<UserInsights | null>(null);

  const load = useCallback(async () => {
    const [t, tpl, prefs, ins] = await Promise.all([
      storage.getTasks(),
      storage.getTemplates(),
      storage.getPreferences(),
      storage.getInsights(),
    ]);
    setTasks(t);
    setTemplates([...TEMPLATE_LIBRARY, ...tpl]);
    setPreferences(prefs ?? DEFAULT_PREFERENCES);
    setInsights(ins);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addTask = useCallback(async (t: Partial<Task>): Promise<Task> => {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
    const task: Task = {
      id: uuidv4(),
      title: t.title ?? 'New task',
      category: t.category,
      context: t.context,
      energyLevel: t.energyLevel,
      dueDate: t.dueDate,
      templateId: t.templateId,
      createdAt: now,
      updatedAt: now,
    };
    const next = [task, ...tasks];
    setTasks(next);
    await storage.saveTasks(next);
    analytics.track({ name: 'task_created', taskId: task.id, category: task.category });
    if (task.templateId) analytics.track({ name: 'template_used', templateId: task.templateId });
    return task;
  }, [tasks]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const next = tasks.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss") } : t
    );
    setTasks(next);
    await storage.saveTasks(next);
  }, [tasks]);

  const deleteTask = useCallback(async (id: string) => {
    const next = tasks.filter((t) => t.id !== id);
    setTasks(next);
    await storage.saveTasks(next);
  }, [tasks]);

  const getTask = useCallback((id: string) => tasks.find((t) => t.id === id), [tasks]);

  const generateSteps = useCallback((task: Task): MicroStep[] => {
    const steps = generateMicroSteps(task, templates.filter((x) => !x.isBuiltIn));
    return steps;
  }, [templates]);

  const saveTaskTemplate = useCallback(async (taskId: string, name: string): Promise<TaskTemplate> => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task?.microSteps?.length) throw new Error('No steps to save');
    const tpl: TaskTemplate = {
      id: uuidv4(),
      name: name || task.title,
      category: task.category ?? 'other',
      microSteps: task.microSteps.map(({ id, completed, ...rest }) => rest),
      isBuiltIn: false,
    };
    const next = [tpl, ...templates.filter((x) => !x.isBuiltIn)];
    setTemplates(next);
    await storage.saveTemplates(next.filter((x) => !x.isBuiltIn));
    return tpl;
  }, [tasks, templates]);

  const startSession = useCallback((taskId: string): Session | null => {
    const task = getTask(taskId);
    if (!task) return null;
    let steps = task.microSteps;
    if (!steps?.length) {
      steps = generateMicroSteps(task, templates.filter((x) => !x.isBuiltIn));
      updateTask(taskId, { microSteps: steps }).catch(() => {});
    }
    const session: Session = {
      id: uuidv4(),
      taskId,
      taskTitle: task.title,
      microSteps: steps.map((s) => ({ ...s })),
      currentStepIndex: 0,
      startedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      completedSteps: [],
      status: 'active',
    };
    setActiveSession(session);
    analytics.track({ name: 'session_started', taskId, stepCount: steps.length });
    analytics.track({ name: 'session_start_hour', hour: new Date().getHours() });
    return session;
  }, [getTask, templates, updateTask]);

  const completeStep = useCallback((sessionId: string, stepId: string) => {
    const taskById = (id: string) => tasks.find((t) => t.id === id);
    setActiveSession((s) => {
      if (!s || s.id !== sessionId) return s;
      const steps = s.microSteps.map((st) =>
        st.id === stepId ? { ...st, completed: true } : st
      );
      const idx = steps.findIndex((st) => st.id === stepId);
      const completedSteps = [...s.completedSteps, stepId];
      analytics.track({ name: 'microstep_completed', sessionId, stepId });
      const nextIndex = idx + 1;
      if (nextIndex >= steps.length) {
        const task = taskById(s.taskId);
        const completedSession = { ...s, status: 'completed' as const };
        storage.getSessions().then((sessions) =>
          storage.saveSessions([completedSession, ...sessions].slice(0, 50))
        );
        recordSessionComplete(
          completedSteps.length,
          new Date(s.startedAt).getHours(),
          [task?.category ?? 'other'],
          task?.templateId ? [task.templateId] : []
        ).then(() => load());
        analytics.track({ name: 'session_completed', sessionId, stepsCompleted: completedSteps.length });
        return null;
      }
      return { ...s, microSteps: steps, currentStepIndex: nextIndex, completedSteps };
    });
  }, [tasks, load]);

  const skipStep = useCallback((sessionId: string, stepId: string) => {
    setActiveSession((s) => {
      if (!s || s.id !== sessionId) return s;
      const idx = s.microSteps.findIndex((st) => st.id === stepId);
      analytics.track({ name: 'microstep_skipped', sessionId, stepId });
      const nextIndex = idx + 1;
      if (nextIndex >= s.microSteps.length) return null;
      return { ...s, currentStepIndex: nextIndex };
    });
  }, []);

  const makeStepSmallerHandler = useCallback((sessionId: string, stepId: string) => {
    setActiveSession((s) => {
      if (!s || s.id !== sessionId) return s;
      const step = s.microSteps.find((st) => st.id === stepId);
      if (!step) return s;
      const smaller = makeStepSmaller(step);
      analytics.track({ name: 'microstep_made_smaller', sessionId, stepId });
      const steps = s.microSteps.map((st) => (st.id === stepId ? smaller : st));
      return { ...s, microSteps: steps };
    });
  }, []);

  const endSession = useCallback((sessionId: string, completed: boolean) => {
    setActiveSession((s) => {
      if (!s || s.id !== sessionId) return s;
      if (!completed) analytics.track({ name: 'session_abandoned', sessionId, stepIndex: s.currentStepIndex });
      return null;
    });
  }, []);

  const completeTask = useCallback(async (id: string) => {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
    const next = tasks.map((t) =>
      t.id === id ? { ...t, completedAt: now, updatedAt: now } : t
    );
    setTasks(next);
    await storage.saveTasks(next);
  }, [tasks]);

  const updatePreferences = useCallback(async (prefs: Partial<UserPreferences>) => {
    const next = { ...(preferences ?? DEFAULT_PREFERENCES), ...prefs };
    setPreferences(next);
    await savePreferences(next);
  }, [preferences]);

  const loadPreferences = useCallback(async () => {
    const prefs = await getPreferences();
    setPreferences(prefs);
  }, []);

  const loadInsights = useCallback(async () => {
    const ins = await storage.getInsights();
    setInsights(ins);
  }, []);

  const value: AppContextValue = {
    tasks,
    templates,
    activeSession,
    preferences,
    insights,
    addTask,
    updateTask,
    deleteTask,
    getTask,
    generateSteps,
    saveTaskTemplate,
    startSession,
    completeStep,
    skipStep,
    makeStepSmaller: makeStepSmallerHandler,
    endSession,
    updatePreferences,
    loadPreferences,
    loadInsights,
    completeTask,
    quickAddPresets: QUICK_ADD_PRESETS,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
