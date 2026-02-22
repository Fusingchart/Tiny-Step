/**
 * Analytics service - instrument for learning
 * Logs locally; ready for backend integration.
 */

import type { AnalyticsEvent, AnalyticsService } from '../types/analytics';

const DEBUG = __DEV__;

export const analytics: AnalyticsService = {
  track(event: AnalyticsEvent) {
    if (DEBUG) {
      console.log('[Analytics]', event);
    }
    // Future: send to backend, e.g. PostHog, Amplitude, etc.
  },
};
