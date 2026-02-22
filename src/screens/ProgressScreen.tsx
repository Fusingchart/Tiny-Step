/**
 * Progress - Wins, streaks, session history, gentle encouragement
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { BottomBar } from '../components/BottomBar';
import { storage } from '../storage/storage';
import type { Session } from '../types/models';
import { format } from 'date-fns';

export function ProgressScreen({ navigation }: { navigation: any }) {
  const { insights } = useApp();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    storage.getSessions().then(setSessions);
  }, [insights?.totalSessionsCompleted]);

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
});
