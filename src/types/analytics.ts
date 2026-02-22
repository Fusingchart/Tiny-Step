/**
 * Analytics events - instrument for learning & product decisions
 * Privacy-first: events are for app improvement, not tracking.
 */

export type AnalyticsEvent =
  | { name: 'task_created'; taskId: string; category?: string }
  | { name: 'session_started'; taskId: string; stepCount: number }
  | { name: 'session_completed'; sessionId: string; stepsCompleted: number }
  | { name: 'session_abandoned'; sessionId: string; stepIndex: number }
  | { name: 'microstep_completed'; sessionId: string; stepId: string; durationMs?: number }
  | { name: 'microstep_skipped'; sessionId: string; stepId: string }
  | { name: 'microstep_made_smaller'; sessionId: string; stepId: string }
  | { name: 'template_used'; templateId: string }
  | { name: 'template_regenerated'; taskId: string }
  | { name: 'break_taken'; sessionId: string }
  | { name: 'session_start_hour'; hour: number } // For time-of-day learning
  | { name: 'notification_clicked'; type: string };

export interface AnalyticsService {
  track(event: AnalyticsEvent): void;
  identify?(userId: string): void;
}
