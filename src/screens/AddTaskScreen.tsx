/**
 * Add task with full details
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { CATEGORY_LABELS, ENERGY_LABELS } from '../constants';
import { colors, radii } from '../theme/theme';
import type { TaskCategory, EnergyLevel } from '../types/models';

const CATEGORIES: TaskCategory[] = ['home', 'work', 'self-care', 'admin', 'planning', 'other'];
const ENERGY_LEVELS: EnergyLevel[] = ['low', 'medium', 'high'];

export function AddTaskScreen({ navigation }: { navigation: any }) {
  const { addTask, quickAddPresets } = useApp();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory | undefined>();
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | undefined>();
  const [dueDate, setDueDate] = useState('');

  const handleQuickAdd = async (label: string, templateId: string) => {
    const task = await addTask({ title: label, templateId, category });
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleAdd = async () => {
    if (!title.trim()) return;
    const task = await addTask({
      title: title.trim(),
      category,
      energyLevel,
      dueDate: dueDate.trim() || undefined,
    });
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="arrow-back" size={22} color={colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Add task</Text>

        <Text style={styles.label}>Task name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. clean the kitchen"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
          autoFocus
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

        <Text style={styles.label}>Due date (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#888"
          value={dueDate}
          onChangeText={setDueDate}
        />

        <Text style={styles.label}>Quick add from presets</Text>
        <View style={styles.presets}>
          {quickAddPresets.map((p) => (
            <TouchableOpacity
              key={p.templateId}
              style={styles.presetChip}
              onPress={() => handleQuickAdd(p.label, p.templateId)}
            >
              <Text style={styles.presetText}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Add task" onPress={handleAdd} style={styles.submit} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 },
  backText: { fontSize: 17, color: colors.primary, fontWeight: '600' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSoft,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  presetChip: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  presetText: { fontSize: 14, fontWeight: '600', color: colors.text },
  submit: { marginTop: 8 },
});
