/**
 * Advanced insights and analytics
 */

import { format, startOfWeek, isSameDay, parseISO, getDay, getHours } from 'date-fns';
import type { Session, TaskCategory, UserInsights, Task } from '../types/models';
import { CATEGORY_LABELS } from '../constants';

export interface InsightData {
  bestTimeOfDay: string | null;
  bestDayOfWeek: string | null;
  categoryBreakdown: { category: TaskCategory; count: number; percentage: number }[];
  averageStepsPerSession: number;
  completionRate: number;
  weeklyActivity: { day: string; count: number }[];
  mostProductiveHour: string | null;
  recommendations: string[];
}

export function analyzeInsights(
  insights: UserInsights | null,
  sessions: Session[],
  tasks: Task[]
): InsightData {
  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const totalSessions = sessions.length || 1;

  // Best time of day
  const hourCounts: Record<number, number> = {};
  completedSessions.forEach((s) => {
    const hour = getHours(parseISO(s.startedAt));
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const bestHour = Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0];
  const bestTimeOfDay = bestHour
    ? (() => {
        const h = Number(bestHour[0]);
        const ampm = h >= 12 ? 'pm' : 'am';
        const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
        return `${h12}${ampm}`;
      })()
    : null;

  // Best day of week
  const dayCounts: Record<number, number> = {};
  completedSessions.forEach((s) => {
    const day = getDay(parseISO(s.startedAt));
    dayCounts[day] = (dayCounts[day] || 0) + 1;
  });
  const bestDayNum = Object.entries(dayCounts).sort(([, a], [, b]) => b - a)[0]?.[0];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const bestDayOfWeek = bestDayNum ? dayNames[Number(bestDayNum)] : null;

  // Category breakdown - use insights data which tracks categories from completed sessions
  const categoryCounts: Record<TaskCategory, number> = {
    home: 0,
    work: 0,
    'self-care': 0,
    admin: 0,
    planning: 0,
    other: 0,
  };
  // Count categories from insights (which tracks completed sessions)
  insights?.mostCompletedCategories?.forEach((cat) => {
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  // Also check tasks for additional category data
  tasks.forEach((t) => {
    if (t.category && t.completedAt) {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    }
  });
  const totalCategoryCompletions = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;
  const categoryBreakdown = Object.entries(categoryCounts)
    .map(([cat, count]) => ({
      category: cat as TaskCategory,
      count,
      percentage: Math.round((count / totalCategoryCompletions) * 100),
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  // Average steps per session
  const totalSteps = completedSessions.reduce((sum, s) => sum + (s.completedSteps?.length || 0), 0);
  const averageStepsPerSession = completedSessions.length > 0 ? Math.round(totalSteps / completedSessions.length) : 0;

  // Completion rate
  const completionRate = Math.round((completedSessions.length / totalSessions) * 100);

  // Weekly activity
  const weeklyCounts: Record<number, number> = {};
  completedSessions.forEach((s) => {
    const day = getDay(parseISO(s.startedAt));
    weeklyCounts[day] = (weeklyCounts[day] || 0) + 1;
  });
  const weeklyActivity = dayNames.map((name, idx) => ({
    day: name.slice(0, 3),
    count: weeklyCounts[idx] || 0,
  }));

  // Most productive hour
  const mostProductiveHour = bestTimeOfDay;

  // Recommendations
  const recommendations: string[] = [];
  if (bestTimeOfDay) {
    recommendations.push(`Try scheduling tasks around ${bestTimeOfDay} – that's when you're most productive.`);
  }
  if (bestDayOfWeek) {
    recommendations.push(`${bestDayOfWeek}s are your strongest days. Plan bigger tasks then.`);
  }
  if (categoryBreakdown.length > 0) {
    const topCat = categoryBreakdown[0];
    recommendations.push(
      `You complete ${CATEGORY_LABELS[topCat.category]} tasks most often. Keep that momentum going!`
    );
  }
  if (completionRate < 50 && completedSessions.length > 3) {
    recommendations.push('Try breaking tasks into even smaller steps if sessions feel too long.');
  }
  if (averageStepsPerSession > 5) {
    recommendations.push("You're completing lots of steps per session. That's great progress!");
  }
  if (insights?.currentStreak && insights.currentStreak >= 7) {
    recommendations.push(`You're on a ${insights.currentStreak}-day streak! Keep it up.`);
  }

  return {
    bestTimeOfDay,
    bestDayOfWeek,
    categoryBreakdown,
    averageStepsPerSession,
    completionRate,
    weeklyActivity,
    mostProductiveHour,
    recommendations: recommendations.slice(0, 3),
  };
}
