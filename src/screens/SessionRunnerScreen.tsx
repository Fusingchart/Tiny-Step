/**
 * Session mode - One micro-step at a time, full-screen
 * Done | Skip | Too much, make it smaller
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';

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
      <Text style={styles.stepCounter}>
        Step {session.currentStepIndex + 1} of {session.microSteps.length}
      </Text>

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
    backgroundColor: '#1a1a2e',
    padding: 24,
    paddingTop: 80,
  },
  taskTitle: { fontSize: 18, color: '#a0a0b0', marginBottom: 4 },
  stepCounter: { fontSize: 14, color: '#7eddd6', marginBottom: 32 },
  stepCard: {
    backgroundColor: '#252540',
    borderRadius: 16,
    padding: 28,
    marginBottom: 24,
    minHeight: 120,
    justifyContent: 'center',
  },
  stepText: { fontSize: 22, fontWeight: '600', color: '#f0f0f5', lineHeight: 32 },
  text: { fontSize: 18, color: '#f0f0f5', marginBottom: 24 },
  breakBanner: {
    backgroundColor: '#2a4a47',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  breakText: { fontSize: 15, color: '#7eddd6', marginBottom: 12 },
  breakBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#4ecdc4',
    borderRadius: 8,
  },
  breakBtnText: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
  timerSection: { marginBottom: 32 },
  timerRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  timerChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#3a3a55',
  },
  timerChipActive: { borderColor: '#4ecdc4', backgroundColor: '#2a4a47' },
  timerText: { fontSize: 14, color: '#a0a0b0' },
  timerTextActive: { color: '#4ecdc4', fontWeight: '600' },
  countdownBox: {
    backgroundColor: '#252540',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  countdownLabel: { fontSize: 12, color: '#a0a0b0', marginBottom: 4 },
  countdownValue: { fontSize: 36, fontWeight: '700', color: '#4ecdc4' },
  actions: { gap: 12 },
  doneBtn: { marginBottom: 4 },
  skipBtn: { alignItems: 'center', paddingVertical: 14 },
  skipText: { fontSize: 16, color: '#7eddd6' },
  smallerBtn: { alignItems: 'center', paddingVertical: 14 },
  smallerText: { fontSize: 14, color: '#a0a0b0' },
  endSession: { position: 'absolute', bottom: 40, alignSelf: 'center' },
  endText: { fontSize: 14, color: '#666' },
});
