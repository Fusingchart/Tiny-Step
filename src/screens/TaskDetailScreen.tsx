/**
 * Task detail - Micro-steps preview, regenerate, edit, start session
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { colors, radii } from '../theme/theme';

export function TaskDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { taskId } = route.params;
  const { getTask, updateTask, generateSteps, startSession, saveTaskTemplate } = useApp();
  const task = getTask(taskId);
  const [steps, setSteps] = useState(task?.microSteps ?? []);

  useEffect(() => {
    const t = getTask(taskId);
    if (!t) return;
    if (t.microSteps?.length) {
      setSteps(t.microSteps);
    } else {
      const generated = generateSteps(t);
      setSteps(generated);
      updateTask(taskId, { microSteps: generated }).catch(() => {});
    }
  }, [taskId, getTask, generateSteps, updateTask]);

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Task not found.</Text>
      </View>
    );
  }

  const handleRegenerate = () => {
    const newSteps = generateSteps(task);
    setSteps(newSteps);
    updateTask(taskId, { microSteps: newSteps }).catch(() => {});
  };

  const handleStartSession = () => {
    const s = startSession(taskId);
    if (s) navigation.replace('SessionRunner', { sessionId: s.id });
  };

  const handleSaveTemplate = () => {
    Alert.alert(
      'Save as template?',
      `Save "${task.title}" steps for quick add later?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async () => {
            try {
              await saveTaskTemplate(taskId, task.title);
              Alert.alert('Saved', 'Template saved. You can use it from quick add.');
            } catch {
              Alert.alert('Oops', 'Could not save. Make sure the task has steps.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={22} color={colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.subtitle}>Here’s how we’ll break it down:</Text>

      <ScrollView style={styles.steps} contentContainerStyle={styles.stepsContent}>
        {steps.map((s, i) => (
          <View key={s.id} style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{s.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate('EditTask', { taskId })} style={styles.regen}>
          <Text style={styles.regenText}>Edit task</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRegenerate} style={styles.regen}>
          <Text style={styles.regenText}>Regenerate steps</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSaveTemplate} style={styles.regen}>
          <Text style={styles.regenText}>Save as template</Text>
        </TouchableOpacity>
      </View>

      <Button title="Let's go" onPress={handleStartSession} style={styles.start} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 56 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  backText: { fontSize: 17, color: colors.primary, fontWeight: '600' },
  error: { fontSize: 16, color: colors.accent },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 24 },
  steps: { flex: 1 },
  stepsContent: { paddingBottom: 20 },
  stepRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  stepNum: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  stepText: { flex: 1, fontSize: 16, color: colors.text, lineHeight: 24 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 20 },
  regen: {},
  regenText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  start: { marginBottom: 40 },
});
