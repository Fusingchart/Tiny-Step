/**
 * Session complete - Celebrate the win (Duolingo/Finch style)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../components/Button';
import { colors } from '../theme/theme';

const CELEBRATIONS = ['✨', '🎉', '🌟', '💪', '🔥'];

export function SessionCompleteScreen({ route, navigation }: { route: any; navigation: any }) {
  const { taskTitle, stepsCompleted } = route.params ?? {};
  const emoji = CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];

  return (
    <View style={styles.container}>
      <View style={styles.celebrationCircle}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={styles.title}>Nice work!</Text>
      <Text style={styles.subtitle}>
        You completed {stepsCompleted ?? 0} step{(stepsCompleted ?? 0) !== 1 ? 's' : ''} for "{taskTitle ?? 'your task'}".
      </Text>
      <Text style={styles.tagline}>That's progress. Keep it going.</Text>
      <Button
        title="Back to tasks"
        onPress={() => navigation.replace('Home')}
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sessionBg,
    padding: 24,
    paddingTop: 100,
    alignItems: 'center',
  },
  celebrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.sessionSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  emoji: { fontSize: 48 },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', marginBottom: 12 },
  subtitle: { fontSize: 17, color: colors.sessionAccent, textAlign: 'center', marginBottom: 12, paddingHorizontal: 20 },
  tagline: { fontSize: 16, color: colors.sessionAccent, marginBottom: 56 },
  btn: { minWidth: 220 },
});
