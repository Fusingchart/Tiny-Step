/**
 * Task library - Built-in templates
 */

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { BottomBar } from '../components/BottomBar';
import { CATEGORY_LABELS } from '../constants';
import { TEMPLATE_LIBRARY } from '../data/templates';
import { colors, radii } from '../theme/theme';

export function TaskLibraryScreen({ navigation }: { navigation: any }) {
  const { addTask, templates } = useApp();
  const allTemplates = [...TEMPLATE_LIBRARY, ...templates.filter((t) => !t.isBuiltIn)];

  const byCategory = allTemplates.reduce<Record<string, typeof allTemplates>>(
    (acc, t) => {
      const c = t.category;
      if (!acc[c]) acc[c] = [];
      acc[c].push(t);
      return acc;
    },
    {}
  );

  const handleUse = async (tpl: (typeof TEMPLATE_LIBRARY)[0]) => {
    const task = await addTask({ title: tpl.name, templateId: tpl.id, category: tpl.category });
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const categories = Object.keys(byCategory).sort();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Task library</Text>
        <Text style={styles.subtitle}>Pick a template to get started with micro-steps.</Text>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(c) => c}
        contentContainerStyle={styles.list}
        renderItem={({ item: cat }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{CATEGORY_LABELS[cat] ?? cat}</Text>
            {(byCategory[cat] ?? []).map((tpl) => (
              <TouchableOpacity
                key={tpl.id}
                style={styles.row}
                onPress={() => handleUse(tpl)}
                activeOpacity={0.7}
              >
                <Text style={styles.rowText}>{tpl.name}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      />

      <BottomBar
        links={[
          { label: 'Home', onPress: () => navigation.navigate('Home') },
          { label: 'Progress', onPress: () => navigation.navigate('Progress') },
          { label: 'Settings', onPress: () => navigation.navigate('Settings') },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 60 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary },
  list: { paddingBottom: 100 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 14 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    minHeight: 60,
  },
  rowText: { fontSize: 17, fontWeight: '500', color: colors.text },
});
