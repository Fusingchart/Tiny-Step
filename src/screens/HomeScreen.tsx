/**
 * Home - Task list and quick add
 */

import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { BottomBar } from '../components/BottomBar';
import { getFriendlyInsight } from '../engine/personalization';
import { format, isToday, isTomorrow } from 'date-fns';
import { CATEGORY_LABELS } from '../constants';
import { colors, radii } from '../theme/theme';

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
      <View style={styles.header}>
        <Text style={styles.greeting}>What's on your mind?</Text>
        <Text style={styles.subtitle}>Add a task and we'll break it into tiny steps.</Text>
      </View>
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
          activeOpacity={0.8}
        >
          <View style={styles.suggestedIcon}>
            <Ionicons name="flash" size={20} color={colors.accent} />
          </View>
          <View style={styles.suggestedContent}>
            <Text style={styles.suggestedLabel}>Suggested next</Text>
            <Text style={styles.suggestedTitle}>{suggestedTask.title}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
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
          <Text style={styles.presetsLabel}>Quick add</Text>
          <View style={styles.presetRow}>
            {quickAddPresets.map((p) => (
              <TouchableOpacity
                key={p.templateId}
                style={styles.presetChip}
                onPress={() => handleAdd(p.label, p.templateId)}
                activeOpacity={0.8}
                accessibilityLabel={`Quick add ${p.label}`}
              >
                <Text style={styles.presetText}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {insight && (
        <View style={styles.insight}>
          <Ionicons name="bulb-outline" size={20} color={colors.warning} />
          <Text style={styles.insightText}>{insight}</Text>
        </View>
      )}

      <View style={styles.headlineRow}>
        <Text style={styles.headline}>Your tasks</Text>
        {activeTasks.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{activeTasks.length}</Text>
          </View>
        )}
      </View>
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
              <View style={styles.checkboxCircle}>
                <Ionicons name="ellipse-outline" size={24} color={colors.primary} />
              </View>
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
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
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
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 },
  header: { marginBottom: 20 },
  greeting: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 16, color: colors.textSecondary },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addDetailsBtn: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: colors.accentSoft,
    borderRadius: radii.md,
  },
  addDetailsText: { fontSize: 14, color: colors.accent, fontWeight: '700' },
  suggestedBanner: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    gap: 12,
  },
  suggestedIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  suggestedContent: { flex: 1 },
  suggestedLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
  suggestedTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  presets: { marginTop: 20 },
  presetsLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 10 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  presetChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: colors.border,
  },
  presetText: { fontSize: 14, fontWeight: '600', color: colors.text },
  insight: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFF9E8',
    borderRadius: radii.md,
  },
  insightText: { flex: 1, fontSize: 14, color: colors.text },
  headlineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 28, marginBottom: 14 },
  headline: { fontSize: 20, fontWeight: '700', color: colors.text },
  countBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  countBadgeText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  list: { paddingBottom: 100 },
  empty: { color: colors.textMuted, fontSize: 16, marginTop: 8 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: radii.md,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 64,
  },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
  taskMeta: { flexDirection: 'row', gap: 12, marginTop: 6 },
  taskCategory: { fontSize: 12, color: colors.primary, fontWeight: '600' },
  taskDue: { fontSize: 12, color: colors.textMuted },
  filterRow: { marginTop: 20 },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
  },
  categoryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceSoft,
  },
  categoryChipActive: { backgroundColor: colors.primary },
  categoryChipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  categoryChipTextActive: { color: '#fff' },
  checkbox: { marginRight: 14 },
  checkboxCircle: {},
  completedToggle: { marginTop: 20, paddingVertical: 14 },
  completedToggleText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
});
