/**
 * Completed tasks - view and optionally restore
 */

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { CATEGORY_LABELS } from '../constants';
import { format } from 'date-fns';

export function CompletedTasksScreen({ navigation }: { navigation: any }) {
  const { tasks, updateTask } = useApp();
  const completed = tasks.filter((t) => t.completedAt).sort(
    (a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
  );

  const handleRestore = (id: string) => {
    updateTask(id, { completedAt: undefined });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Completed tasks</Text>
      <FlatList
        data={completed}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No completed tasks yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.taskContent}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskDate}>
                Done {item.completedAt && format(new Date(item.completedAt), 'MMM d')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.restoreBtn}
              onPress={() => handleRestore(item.id)}
            >
              <Text style={styles.restoreText}>Restore</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa', padding: 20, paddingTop: 56 },
  back: { marginBottom: 16 },
  backText: { fontSize: 16, color: '#4ecdc4', fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a2e', marginBottom: 20 },
  list: { paddingBottom: 40 },
  empty: { color: '#888', fontSize: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 17, color: '#1a1a2e' },
  taskDate: { fontSize: 12, color: '#888', marginTop: 4 },
  restoreBtn: { padding: 8 },
  restoreText: { fontSize: 14, color: '#4ecdc4', fontWeight: '600' },
});
