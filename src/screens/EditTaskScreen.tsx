/**
 * Edit task - title, category, due date
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { CATEGORY_LABELS, ENERGY_LABELS } from '../constants';
import type { TaskCategory, EnergyLevel } from '../types/models';

const CATEGORIES: TaskCategory[] = ['home', 'work', 'self-care', 'admin', 'planning', 'other'];
const ENERGY_LEVELS: EnergyLevel[] = ['low', 'medium', 'high'];

export function EditTaskScreen({ route, navigation }: { route: any; navigation: any }) {
  const { taskId } = route.params;
  const { getTask, updateTask } = useApp();
  const task = getTask(taskId);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory | undefined>();
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | undefined>();
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setCategory(task.category);
      setEnergyLevel(task.energyLevel);
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    }
  }, [task]);

  const handleSave = async () => {
    if (!title.trim() || !taskId) return;
    await updateTask(taskId, {
      title: title.trim(),
      category,
      energyLevel,
      dueDate: dueDate.trim() || undefined,
    });
    navigation.goBack();
  };

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Task not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Edit task</Text>

        <Text style={styles.label}>Task name</Text>
        <TextInput
          style={styles.input}
          placeholder="Task name"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, category === c && styles.chipActive]}
              onPress={() => setCategory(category === c ? undefined : c)}
            >
              <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
                {CATEGORY_LABELS[c]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Energy level</Text>
        <View style={styles.chips}>
          {ENERGY_LEVELS.map((e) => (
            <TouchableOpacity
              key={e}
              style={[styles.chip, energyLevel === e && styles.chipActive]}
              onPress={() => setEnergyLevel(energyLevel === e ? undefined : e)}
            >
              <Text style={[styles.chipText, energyLevel === e && styles.chipTextActive]}>
                {ENERGY_LABELS[e]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Due date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#888"
          value={dueDate}
          onChangeText={setDueDate}
        />

        <Button title="Save changes" onPress={handleSave} style={styles.submit} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  back: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 8 },
  backText: { fontSize: 16, color: '#4ecdc4', fontWeight: '600' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a2e', marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#4a4a5a', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a2e',
    marginBottom: 20,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  chipActive: { backgroundColor: '#4ecdc4' },
  chipText: { fontSize: 14, color: '#4a4a5a', fontWeight: '500' },
  chipTextActive: { color: '#1a1a2e' },
  submit: { marginTop: 8 },
  error: { fontSize: 16, color: '#e74c3c', padding: 20 },
});
