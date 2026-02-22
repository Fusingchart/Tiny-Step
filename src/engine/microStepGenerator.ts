/**
 * Micro-step generation engine
 * Rule-based first; designed for AI enhancement later.
 */

import { v4 as uuidv4 } from 'uuid';
import type { MicroStep, Task, TaskCategory } from '../types/models';
import type { TaskTemplate } from '../types/models';
import { TEMPLATE_LIBRARY } from '../data/templates';

/**
 * Generates micro-steps for a task.
 * 1. Try built-in template match (fuzzy by task name)
 * 2. Try custom user template
 * 3. Fall back to generic rule-based generation
 * Future: call AI API for free-form task text
 */
export function generateMicroSteps(
  task: Pick<Task, 'title' | 'category' | 'templateId'>,
  userTemplates: TaskTemplate[]
): MicroStep[] {
  const normalizedTitle = task.title.trim().toLowerCase();

  // 1. Use specific template if referenced
  if (task.templateId) {
    const tpl = userTemplates.find((t) => t.id === task.templateId) ??
      TEMPLATE_LIBRARY.find((t) => t.id === task.templateId);
    if (tpl) {
      return tpl.microSteps.map((s, i) => ({
        id: uuidv4(),
        text: s.text,
        order: i,
        suggestedMinutes: s.suggestedMinutes,
      }));
    }
  }

  // 2. Match built-in or user template by name
  const match = findBestTemplateMatch(normalizedTitle, task.category, userTemplates);
  if (match) {
    return match.microSteps.map((s, i) => ({
      id: uuidv4(),
      text: s.text,
      order: i,
      suggestedMinutes: s.suggestedMinutes,
    }));
  }

  // 3. Generic rule-based micro-steps
  return generateGenericMicroSteps(task.title, task.category);
}

function findBestTemplateMatch(
  normalizedTitle: string,
  category?: TaskCategory,
  userTemplates: TaskTemplate[] = []
): (TaskTemplate & { microSteps: { id?: string; text: string; order: number; suggestedMinutes?: number }[] }) | null {
  const all = [...userTemplates, ...TEMPLATE_LIBRARY];
  let best: typeof all[0] | null = null;
  let bestScore = 0;

  for (const t of all) {
    const name = t.name.toLowerCase();
    let score = 0;
    if (normalizedTitle.includes(name) || name.includes(normalizedTitle)) score += 10;
    if (category && t.category === category) score += 5;
    if (score > bestScore) {
      bestScore = score;
      best = t;
    }
  }
  return best ? { ...best, microSteps: best.microSteps.map((s, i) => ({ ...s, order: i })) } : null;
}

function generateGenericMicroSteps(title: string, category?: TaskCategory): MicroStep[] {
  const steps: { text: string; suggestedMinutes?: number }[] = [
    { text: `Gather what you need for "${title}".`, suggestedMinutes: 1 },
    { text: `Do the first tiny part – 2 minutes max.`, suggestedMinutes: 2 },
    { text: `Take a quick breather.`, suggestedMinutes: 1 },
    { text: `Do the next small piece.`, suggestedMinutes: 2 },
    { text: `Finish up or leave it ready for next time.`, suggestedMinutes: 2 },
  ];
  return steps.map((s, i) => ({
    id: uuidv4(),
    text: s.text,
    order: i,
    suggestedMinutes: s.suggestedMinutes,
  }));
}

/**
 * Break a single step into a smaller action.
 * Future: AI could generate contextual mini-step.
 */
export function makeStepSmaller(step: MicroStep): MicroStep {
  const miniTexts: string[] = [
    'Just do 30 seconds of it.',
    'Put one thing in place.',
    'Do the absolute first action only.',
    'Pick up one item and deal with it.',
  ];
  const idx = Math.floor(Math.random() * miniTexts.length);
  return {
    ...step,
    id: uuidv4(),
    text: miniTexts[idx],
    suggestedMinutes: 1,
  };
}
