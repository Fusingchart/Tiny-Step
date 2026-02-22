/**
 * Session complete - Celebrate the win
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../components/Button';

export function SessionCompleteScreen({ route, navigation }: { route: any; navigation: any }) {
  const { taskTitle, stepsCompleted } = route.params ?? {};

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>✨</Text>
      <Text style={styles.title}>Nice work</Text>
      <Text style={styles.subtitle}>
        You completed {stepsCompleted ?? 0} step{(stepsCompleted ?? 0) !== 1 ? 's' : ''} for "{taskTitle ?? 'your task'}".
      </Text>
      <Text style={styles.tagline}>That's progress.</Text>
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
    backgroundColor: '#1a1a2e',
    padding: 24,
    paddingTop: 120,
    alignItems: 'center',
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#f0f0f5', marginBottom: 8 },
  subtitle: { fontSize: 17, color: '#a0a0b0', textAlign: 'center', marginBottom: 8 },
  tagline: { fontSize: 16, color: '#4ecdc4', marginBottom: 48 },
  btn: { minWidth: 200 },
});
