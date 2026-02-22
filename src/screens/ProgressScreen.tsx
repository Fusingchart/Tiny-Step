/**
 * Progress - Wins, streaks, session history, gentle encouragement
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { BottomBar } from '../components/BottomBar';
import { storage } from '../storage/storage';
import type { Session } from '../types/models';
import { format } from 'date-fns';
import { analyzeInsights } from '../engine/insights';
import { CATEGORY_LABELS } from '../constants';

export function ProgressScreen({ navigation }: { navigation: any }) {
  const { insights, tasks } = useApp();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    storage.getSessions().then(setSessions);
  }, [insights?.totalSessionsCompleted]);

  const insightData = useMemo(() => analyzeInsights(insights ?? null, sessions, tasks), [insights, sessions, tasks]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your progress</Text>
      <Text style={styles.tagline}>Small wins add up.</Text>

      <View style={styles.cards}>
        <View style={styles.card}>
          <Text style={styles.cardValue}>{insights?.totalMicroStepsCompleted ?? 0}</Text>
          <Text style={styles.cardLabel}>Micro-steps completed</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardValue}>{insights?.totalSessionsCompleted ?? 0}</Text>
          <Text style={styles.cardLabel}>Sessions finished</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardValue}>{insights?.currentStreak ?? 0}</Text>
          <Text style={styles.cardLabel}>Day streak</Text>
        </View>
      </View>

      {insights?.currentStreak === 0 && insights?.lastActiveDate && (
        <View style={styles.kindness}>
          <Text style={styles.kindnessText}>
            Life happened. Let's find your next small win.
          </Text>
        </View>
      )}

      {insightData.recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          {insightData.recommendations.map((rec, i) => (
            <View key={i} style={styles.insightCard}>
              <Text style={styles.insightText}>💡 {rec}</Text>
            </View>
          ))}
        </View>
      )}

      {insightData.bestTimeOfDay && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your patterns</Text>
          <View style={styles.patternCard}>
            <Text style={styles.patternLabel}>Best time of day</Text>
            <Text style={styles.patternValue}>{insightData.bestTimeOfDay}</Text>
          </View>
          {insightData.bestDayOfWeek && (
            <View style={styles.patternCard}>
              <Text style={styles.patternLabel}>Most productive day</Text>
              <Text style={styles.patternValue}>{insightData.bestDayOfWeek}</Text>
            </View>
          )}
          {insightData.averageStepsPerSession > 0 && (
            <View style={styles.patternCard}>
              <Text style={styles.patternLabel}>Avg steps per session</Text>
              <Text style={styles.patternValue}>{insightData.averageStepsPerSession}</Text>
            </View>
          )}
          {insightData.completionRate > 0 && (
            <View style={styles.patternCard}>
              <Text style={styles.patternLabel}>Completion rate</Text>
              <Text style={styles.patternValue}>{insightData.completionRate}%</Text>
            </View>
          )}
        </View>
      )}

      {insightData.categoryBreakdown.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category breakdown</Text>
          {insightData.categoryBreakdown.map((cat) => (
            <View key={cat.category} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{CATEGORY_LABELS[cat.category]}</Text>
                <Text style={styles.categoryPercent}>{cat.percentage}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${cat.percentage}%` }]} />
              </View>
            </View>
          ))}
        </View>
      )}

      {insightData.weeklyActivity.some((d) => d.count > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly activity</Text>
          <View style={styles.weeklyChart}>
            {insightData.weeklyActivity.map((day) => {
              const maxCount = Math.max(...insightData.weeklyActivity.map((d) => d.count), 1);
              const height = maxCount > 0 ? (day.count / maxCount) * 60 : 0;
              return (
                <View key={day.day} style={styles.weeklyBar}>
                  <View style={[styles.weeklyBarFill, { height: Math.max(height, 4) }]} />
                  <Text style={styles.weeklyBarLabel}>{day.day}</Text>
                  {day.count > 0 && <Text style={styles.weeklyBarValue}>{day.count}</Text>}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {sessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent sessions</Text>
          {sessions.slice(0, 10).map((s) => (
            <View key={s.id} style={styles.sessionRow}>
              <Text style={styles.sessionTitle}>{s.taskTitle}</Text>
              <Text style={styles.sessionMeta}>
                {s.completedSteps?.length ?? 0} steps · {s.startedAt && format(new Date(s.startedAt), 'MMM d')}
              </Text>
            </View>
          ))}
        </View>
      )}

      <BottomBar
        links={[
          { label: 'Home', onPress: () => navigation.navigate('Home') },
          { label: 'Library', onPress: () => navigation.navigate('TaskLibrary') },
          { label: 'Settings', onPress: () => navigation.navigate('Settings') },
        ]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  content: { padding: 20, paddingTop: 80, paddingBottom: 120 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  tagline: { fontSize: 16, color: '#4a4a5a', marginBottom: 32 },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  card: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardValue: { fontSize: 28, fontWeight: '700', color: '#4ecdc4', marginBottom: 4 },
  cardLabel: { fontSize: 14, color: '#4a4a5a' },
  kindness: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 12,
  },
  kindnessText: { fontSize: 16, color: '#1a1a2e' },
  section: { marginTop: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a2e', marginBottom: 12 },
  sessionRow: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sessionTitle: { fontSize: 16, fontWeight: '500', color: '#1a1a2e' },
  sessionMeta: { fontSize: 13, color: '#888', marginTop: 4 },
  insightCard: {
    backgroundColor: '#e8f6f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  insightText: { fontSize: 15, color: '#1a1a2e', lineHeight: 22 },
  patternCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patternLabel: { fontSize: 15, color: '#4a4a5a' },
  patternValue: { fontSize: 18, fontWeight: '600', color: '#4ecdc4' },
  categoryRow: { marginBottom: 12 },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: { fontSize: 15, fontWeight: '500', color: '#1a1a2e' },
  categoryPercent: { fontSize: 14, color: '#4ecdc4', fontWeight: '600' },
  progressBar: {
    height: 8,
    backgroundColor: '#e8e8e8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ecdc4',
    borderRadius: 4,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    paddingHorizontal: 4,
  },
  weeklyBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  weeklyBarFill: {
    width: '100%',
    backgroundColor: '#4ecdc4',
    borderRadius: 4,
    minHeight: 4,
  },
  weeklyBarLabel: { fontSize: 11, color: '#888', marginTop: 6 },
  weeklyBarValue: { fontSize: 10, color: '#4ecdc4', fontWeight: '600', marginTop: 2 },
});
