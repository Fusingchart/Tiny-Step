/**
 * Session mode - One micro-step at a time, full-screen
 * Done | Skip | Too much, make it smaller
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { colors, radii } from '../theme/theme';

const TIMER_CHIPS = [2, 5, 10];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function SessionRunnerScreen({ route, navigation }: { route: any; navigation: any }) {
  const { sessionId } = route.params;
  const { activeSession, completeStep, skipStep, makeStepSmaller, endSession, preferences } = useApp();
  const [timerMins, setTimerMins] = useState<number | null>(null);
  const [remainingSecs, setRemainingSecs] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timerMins == null) {
      setRemainingSecs(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    setRemainingSecs(timerMins * 60);
    intervalRef.current = setInterval(() => {
      setRemainingSecs((prev) => {
        if (prev == null || prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setTimerMins(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerMins]);

  const session = activeSession?.id === sessionId ? activeSession : null;
  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Session ended.</Text>
        <Button title="Back to tasks" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const currentStep = session.microSteps[session.currentStepIndex];
  const isLastStep = session.currentStepIndex >= session.microSteps.length - 1;
  const breakAfter = preferences?.breakAfterSteps ?? 3;
  const breakMins = preferences?.breakMinutes ?? 2;
  const suggestBreak =
    session.completedSteps.length > 0 &&
    session.completedSteps.length % breakAfter === 0 &&
    !isLastStep;

  const handleDone = () => {
    if (!currentStep) return;
    completeStep(sessionId, currentStep.id);
    if (isLastStep) {
      navigation.replace('SessionComplete', {
        taskTitle: session.taskTitle,
        stepsCompleted: session.completedSteps.length + 1,
      });
    }
  };

  const handleSkip = () => {
    if (!currentStep) return;
    skipStep(sessionId, currentStep.id);
    if (isLastStep) navigation.replace('Home');
  };

  const handleTooMuch = () => {
    if (!currentStep) return;
    makeStepSmaller(sessionId, currentStep.id);
  };

  const handleEndSession = () => {
    endSession(sessionId, false);
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.taskTitle}>{session.taskTitle}</Text>
      <View style={styles.stepProgress}>
        <View style={styles.stepDots}>
          {session.microSteps.slice(0, 8).map((_, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                i < session.currentStepIndex && styles.stepDotDone,
                i === session.currentStepIndex && styles.stepDotCurrent,
              ]}
            />
          ))}
          {session.microSteps.length > 8 && (
            <Text style={styles.stepDotMore}>+{session.microSteps.length - 8}</Text>
          )}
        </View>
        <Text style={styles.stepCounter}>
          Step {session.currentStepIndex + 1} of {session.microSteps.length}
        </Text>
      </View>

      <View style={styles.stepCard}>
        <Text style={styles.stepText}>{currentStep?.text ?? 'All done!'}</Text>
      </View>

      {suggestBreak && (
        <View style={styles.breakBanner}>
          <Text style={styles.breakText}>
            Nice, that's progress. Want a {breakMins}-minute breather or keep rolling?
          </Text>
          <TouchableOpacity
            style={styles.breakBtn}
            onPress={() => setTimerMins(breakMins)}
          >
            <Text style={styles.breakBtnText}>Start {breakMins}‑min break</Text>
          </TouchableOpacity>
        </View>
      )}

      {preferences?.timerEnabled !== false && (
        <View style={styles.timerSection}>
          <View style={styles.timerRow}>
            {TIMER_CHIPS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.timerChip, timerMins === m && styles.timerChipActive]}
                onPress={() => setTimerMins(timerMins === m ? null : m)}
              >
                <Text style={[styles.timerText, timerMins === m && styles.timerTextActive]}>{m} min</Text>
              </TouchableOpacity>
            ))}
          </View>
          {remainingSecs != null && (
            <View style={styles.countdownBox}>
              <Text style={styles.countdownLabel}>Time remaining</Text>
              <Text style={styles.countdownValue}>{formatTime(remainingSecs)}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.actions}>
        <Button title="Done" onPress={handleDone} style={styles.doneBtn} />
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleTooMuch} style={styles.smallerBtn}>
          <Text style={styles.smallerText}>Too much – make it smaller</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleEndSession} style={styles.endSession}>
        <Text style={styles.endText}>End session</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sessionBg,
    padding: 24,
    paddingTop: 80,
  },
  taskTitle: { fontSize: 18, color: colors.sessionAccent, marginBottom: 8 },
  stepProgress: { marginBottom: 28 },
  stepDots: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  stepDotDone: { backgroundColor: colors.success },
  stepDotCurrent: { width: 24, backgroundColor: colors.sessionAccent },
  stepDotMore: { fontSize: 12, color: colors.sessionAccent, marginLeft: 4 },
  stepCounter: { fontSize: 14, color: colors.sessionAccent },
  stepCard: {
    backgroundColor: colors.sessionSurface,
    borderRadius: radii.lg,
    padding: 28,
    marginBottom: 24,
    minHeight: 140,
    justifyContent: 'center',
  },
  stepText: { fontSize: 22, fontWeight: '600', color: '#fff', lineHeight: 32 },
  text: { fontSize: 18, color: '#fff', marginBottom: 24 },
  breakBanner: {
    backgroundColor: colors.sessionSurface,
    borderRadius: radii.md,
    padding: 20,
    marginBottom: 24,
  },
  breakText: { fontSize: 15, color: colors.sessionAccent, marginBottom: 14 },
  breakBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
  },
  breakBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  timerSection: { marginBottom: 32 },
  timerRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  timerChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  timerChipActive: { borderColor: colors.sessionAccent, backgroundColor: colors.sessionSurface },
  timerText: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  timerTextActive: { color: colors.sessionAccent, fontWeight: '600' },
  countdownBox: {
    backgroundColor: colors.sessionSurface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  countdownLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  countdownValue: { fontSize: 36, fontWeight: '700', color: colors.sessionAccent },
  actions: { gap: 12 },
  doneBtn: { marginBottom: 4 },
  skipBtn: { alignItems: 'center', paddingVertical: 14 },
  skipText: { fontSize: 16, color: colors.sessionAccent },
  smallerBtn: { alignItems: 'center', paddingVertical: 14 },
  smallerText: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  endSession: { position: 'absolute', bottom: 40, alignSelf: 'center' },
  endText: { fontSize: 14, color: '#666' },
});
