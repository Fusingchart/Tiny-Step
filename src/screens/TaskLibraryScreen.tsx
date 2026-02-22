/**
 * Task library - Built-in templates
 */

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { BottomBar } from '../components/BottomBar';
import { CATEGORY_LABELS } from '../constants';
import { TEMPLATE_LIBRARY } from '../data/templates';

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
      <Text style={styles.title}>Task library</Text>
      <Text style={styles.subtitle}>Pick a template to get started with micro-steps.</Text>

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
              >
                <Text style={styles.rowText}>{tpl.name}</Text>
                <Text style={styles.rowArrow}>→</Text>
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
  container: { flex: 1, backgroundColor: '#fafafa', padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '700', color: '#1a1a2e', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#4a4a5a', marginBottom: 24 },
  list: { paddingBottom: 100 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a2e', marginBottom: 12 },
  row: {
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
  rowText: { fontSize: 17, color: '#1a1a2e' },
  rowArrow: { fontSize: 18, color: '#4ecdc4' },
});
