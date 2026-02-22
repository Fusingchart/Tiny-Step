/**
 * Settings - Preferences, export, notifications
 */

import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Share, Alert } from 'react-native';
import { colors, radii } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { BottomBar } from '../components/BottomBar';
import { storage } from '../storage/storage';
import { requestPermissions, cancelAllNotifications, scheduleNextStepNudge, scheduleEnergyCheck } from '../services/notifications';

export function SettingsScreen({ navigation }: { navigation: any }) {
  const { preferences, updatePreferences, insights, loadInsights } = useApp();

  const handleExport = async () => {
    try {
      const data = await storage.exportData();
      await Share.share({
        message: data,
        title: 'Next Step - My Data Export',
      });
    } catch (e) {
      alert('Could not export. Try again.');
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    await updatePreferences({ notificationEnabled: value });
    if (value) {
      const granted = await requestPermissions();
      if (granted) {
        await scheduleNextStepNudge();
        await scheduleEnergyCheck();
      }
    } else {
      await cancelAllNotifications();
    }
  };

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  return (
    <View style={styles.container}>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Enable nudges</Text>
          <Switch
            value={preferences?.notificationEnabled ?? true}
            onValueChange={handleNotificationToggle}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Show timers</Text>
          <Switch
            value={preferences?.timerEnabled ?? true}
            onValueChange={(v) => updatePreferences({ timerEnabled: v })}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Break after steps</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              onPress={() =>
                updatePreferences({
                  breakAfterSteps: Math.max(2, (preferences?.breakAfterSteps ?? 3) - 1),
                })
              }
              style={styles.stepperBtn}
            >
              <Text style={styles.stepperText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{preferences?.breakAfterSteps ?? 3}</Text>
            <TouchableOpacity
              onPress={() =>
                updatePreferences({
                  breakAfterSteps: Math.min(6, (preferences?.breakAfterSteps ?? 3) + 1),
                })
              }
              style={styles.stepperBtn}
            >
              <Text style={styles.stepperText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Break length (min)</Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              onPress={() =>
                updatePreferences({
                  breakMinutes: Math.max(1, (preferences?.breakMinutes ?? 2) - 1),
                })
              }
              style={styles.stepperBtn}
            >
              <Text style={styles.stepperText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{preferences?.breakMinutes ?? 2}</Text>
            <TouchableOpacity
              onPress={() =>
                updatePreferences({
                  breakMinutes: Math.min(10, (preferences?.breakMinutes ?? 2) + 1),
                })
              }
              style={styles.stepperBtn}
            >
              <Text style={styles.stepperText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Theme</Text>
          <Text style={styles.rowValue}>
            {(preferences?.theme ?? 'system') === 'system' ? 'System' : preferences?.theme === 'dark' ? 'Dark' : 'Light'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress</Text>
        {insights && (
          <View style={styles.stats}>
            <Text style={styles.stat}>Micro-steps completed: {insights.totalMicroStepsCompleted}</Text>
            <Text style={styles.stat}>Sessions completed: {insights.totalSessionsCompleted}</Text>
            <Text style={styles.stat}>Current streak: {insights.currentStreak} day(s)</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
        <Text style={styles.exportText}>Export my data</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dangerBtn}
        onPress={() =>
          Alert.alert(
            'Clear all data?',
            'This cannot be undone. All tasks, templates, and progress will be deleted.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Clear',
                style: 'destructive',
                onPress: async () => {
                  await storage.clearAll();
                  alert('Data cleared. Restart the app to see changes.');
                },
              },
            ]
          )
        }
      >
        <Text style={styles.dangerText}>Clear all data</Text>
      </TouchableOpacity>

      <BottomBar
        links={[
          { label: 'Home', onPress: () => navigation.navigate('Home') },
          { label: 'Library', onPress: () => navigation.navigate('TaskLibrary') },
          { label: 'Progress', onPress: () => navigation.navigate('Progress') },
        ]}
      />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: radii.md,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 56,
  },
  rowLabel: { fontSize: 17, color: colors.text },
  rowValue: { fontSize: 15, color: colors.textSecondary },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepperBtn: { width: 36, height: 36, borderRadius: radii.sm, backgroundColor: colors.accentSoft, justifyContent: 'center', alignItems: 'center' },
  stepperText: { fontSize: 20, color: colors.accent, fontWeight: '700' },
  stepperValue: { fontSize: 16, color: colors.text, minWidth: 24, textAlign: 'center' },
  stats: { backgroundColor: colors.surface, padding: 18, borderRadius: radii.md, borderWidth: 2, borderColor: colors.border },
  stat: { fontSize: 16, color: colors.text, marginBottom: 8 },
  exportBtn: { marginTop: 8, padding: 18, backgroundColor: colors.accentSoft, borderRadius: radii.md },
  exportText: { fontSize: 17, color: colors.accent, fontWeight: '600' },
  dangerBtn: { marginTop: 12, padding: 18, borderRadius: 12 },
  dangerText: { fontSize: 17, color: colors.destructive, fontWeight: '600' },
});
