/**
 * Home - Task list and quick add
 */

import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { BottomBar } from '../components/BottomBar';
import { getFriendlyInsight } from '../engine/personalization';
import { format, isToday, isTomorrow } from 'date-fns';
import { CATEGORY_LABELS } from '../constants';

export function HomeScreen({ navigation }: { navigation: any }) {
  const { tasks, addTask, deleteTask, completeTask, quickAddPresets, insights } = useApp();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const insight = getFriendlyInsight(insights ?? null);

  const handleAdd = async (title: string, templateId?: string) => {
    if (!title.trim()) return;
    const task = await addTask({ title: title.trim(), templateId });
    setInput('');
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleDelete = (taskId: string, title: string) => {
    Alert.alert('Remove task?', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteTask(taskId) },
    ]);
  };

  const activeTasks = useMemo(() => {
    let list = tasks.filter((t) => !t.completedAt);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q));
    }
    if (filterCategory) {
      list = list.filter((t) => (t.category || 'other') === filterCategory);
    }
    return list;
  }, [tasks, search, filterCategory]);

  const categories = useMemo(() => {
    const cats = new Set(tasks.map((t) => t.category || 'other'));
    return Array.from(cats);
  }, [tasks]);

  const suggestedTask = useMemo(() => {
    const active = tasks.filter((t) => !t.completedAt);
    if (active.length === 0 || !insights?.frequentTemplates?.length) return null;
    const topTemplate = insights.frequentTemplates[0];
    return active.find((t) => t.templateId === topTemplate) ?? active[0];
  }, [tasks, insights]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's on your mind?</Text>
      <View style={styles.inputRow}>
        <TextInput
        style={styles.input}
        placeholder="e.g. clean the kitchen, do my taxes..."
        placeholderTextColor="#888"
        value={input}
        onChangeText={setInput}
        onSubmitEditing={() => handleAdd(input)}
        returnKeyType="done"
        accessibilityLabel="Add task"
      />
        <TouchableOpacity
          style={styles.addDetailsBtn}
          onPress={() => navigation.navigate('AddTask')}
        >
          <Text style={styles.addDetailsText}>+ Details</Text>
        </TouchableOpacity>
      </View>

      {suggestedTask && activeTasks.length > 1 && (
        <TouchableOpacity
          style={styles.suggestedBanner}
          onPress={() => navigation.navigate('TaskDetail', { taskId: suggestedTask.id })}
        >
          <Text style={styles.suggestedLabel}>Suggested next</Text>
          <Text style={styles.suggestedTitle}>{suggestedTask.title}</Text>
        </TouchableOpacity>
      )}

      {tasks.length > 2 && (
        <View style={styles.filterRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search tasks..."
            placeholderTextColor="#888"
            value={search}
            onChangeText={setSearch}
          />
          <View style={styles.categoryChips}>
            <TouchableOpacity
              style={[styles.categoryChip, !filterCategory && styles.categoryChipActive]}
              onPress={() => setFilterCategory(null)}
            >
              <Text style={[styles.categoryChipText, !filterCategory && styles.categoryChipTextActive]}>All</Text>
            </TouchableOpacity>
            {categories.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.categoryChip, filterCategory === c && styles.categoryChipActive]}
                onPress={() => setFilterCategory(filterCategory === c ? null : c)}
              >
                <Text style={[styles.categoryChipText, filterCategory === c && styles.categoryChipTextActive]}>
                  {CATEGORY_LABELS[c] ?? c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {quickAddPresets.length > 0 && (
        <View style={styles.presets}>
          {quickAddPresets.map((p) => (
            <TouchableOpacity
              key={p.templateId}
              style={styles.presetChip}
              onPress={() => handleAdd(p.label, p.templateId)}
              accessibilityLabel={`Quick add ${p.label}`}
            >
              <Text style={styles.presetText}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {insight && (
        <View style={styles.insight}>
          <Text style={styles.insightText}>{insight}</Text>
        </View>
      )}

      <Text style={styles.headline}>Your tasks</Text>
      <FlatList
        data={activeTasks}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No tasks yet. Add one above, or tap a preset.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.taskRow}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            onLongPress={() => handleDelete(item.id, item.title)}
            activeOpacity={0.7}
          >
            <TouchableOpacity
              style={styles.checkbox}
              onPress={(e) => { e.stopPropagation(); completeTask(item.id); }}
            >
              <Text style={styles.checkboxText}>○</Text>
            </TouchableOpacity>
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              {(item.category || item.dueDate) && (
                <View style={styles.taskMeta}>
                  {item.category && (
                    <Text style={styles.taskCategory}>{CATEGORY_LABELS[item.category] ?? item.category}</Text>
                  )}
                  {item.dueDate && (
                    <Text style={styles.taskDue}>
                      {isToday(new Date(item.dueDate))
                        ? 'Today'
                        : isTomorrow(new Date(item.dueDate))
                        ? 'Tomorrow'
                        : format(new Date(item.dueDate), 'MMM d')}
                    </Text>
                  )}
                </View>
              )}
            </View>
            <Text style={styles.taskArrow}>→</Text>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          tasks.some((t) => t.completedAt) ? (
            <TouchableOpacity
              style={styles.completedToggle}
              onPress={() => navigation.navigate('CompletedTasks')}
            >
              <Text style={styles.completedToggleText}>View completed tasks</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <BottomBar
        links={[
          { label: 'Library', onPress: () => navigation.navigate('TaskLibrary') },
          { label: 'Progress', onPress: () => navigation.navigate('Progress') },
          { label: 'Settings', onPress: () => navigation.navigate('Settings') },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa', padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a2e', marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a2e',
  },
  presets: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, gap: 8 },
  presetChip: {
    backgroundColor: '#e8f6f5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  presetText: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
  insight: { marginTop: 16, padding: 12, backgroundColor: '#fff3cd', borderRadius: 8 },
  insightText: { fontSize: 14, color: '#1a1a2e' },
  headline: { fontSize: 20, fontWeight: '600', color: '#1a1a2e', marginTop: 24, marginBottom: 12 },
  list: { paddingBottom: 80 },
  empty: { color: '#888', fontSize: 16, marginTop: 8 },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 56,
  },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 17, fontWeight: '500', color: '#1a1a2e' },
  taskMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  taskCategory: { fontSize: 12, color: '#4ecdc4', fontWeight: '600' },
  taskDue: { fontSize: 12, color: '#888' },
  taskArrow: { fontSize: 18, color: '#4ecdc4', marginLeft: 8 },
  filterRow: { marginTop: 16 },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1a1a2e',
    marginBottom: 10,
  },
  categoryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  categoryChipActive: { backgroundColor: '#4ecdc4' },
  categoryChipText: { fontSize: 13, color: '#4a4a5a', fontWeight: '500' },
  categoryChipTextActive: { color: '#1a1a2e' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addDetailsBtn: { paddingVertical: 14, paddingHorizontal: 12 },
  addDetailsText: { fontSize: 14, color: '#4ecdc4', fontWeight: '600' },
  suggestedBanner: { marginTop: 16, padding: 16, backgroundColor: '#e8f6f5', borderRadius: 12 },
  suggestedLabel: { fontSize: 12, color: '#4a4a5a', marginBottom: 4 },
  suggestedTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  checkbox: { marginRight: 12, padding: 4 },
  checkboxText: { fontSize: 20, color: '#4ecdc4' },
  completedToggle: { marginTop: 16, paddingVertical: 12 },
  completedToggleText: { fontSize: 14, color: '#4ecdc4', fontWeight: '600' },
});
