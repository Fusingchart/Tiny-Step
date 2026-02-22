/**
 * Icon component - uses emoji for now to avoid font loading issues
 * Can be upgraded to Ionicons later when font loader is fixed
 */

import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

const EMOJI_MAP: Record<string, string> = {
  'home-outline': '🏠',
  'library-outline': '📚',
  'bar-chart-outline': '📊',
  'settings-outline': '⚙️',
  'arrow-back': '←',
  'chevron-forward': '→',
  'flash': '⚡',
  'bulb-outline': '💡',
  'ellipse-outline': '○',
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 22, color }: IconProps) {
  const emoji = EMOJI_MAP[name] || '•';
  
  return (
    <View style={styles.container}>
      <Text style={[styles.emoji, { fontSize: size * 0.85 }]}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  emoji: {
    textAlign: 'center',
    lineHeight: 24,
  },
});
