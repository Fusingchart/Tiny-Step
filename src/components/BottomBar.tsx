/**
 * Centered bottom navigation - playful pill style
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radii } from '../theme/theme';
import { Icon } from './Icon';

const ICONS: Record<string, string> = {
  Home: 'home-outline',
  Library: 'library-outline',
  Progress: 'bar-chart-outline',
  Settings: 'settings-outline',
};

interface Link {
  label: string;
  onPress: () => void;
}

interface BottomBarProps {
  links: Link[];
}

export function BottomBar({ links }: BottomBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {links.map((link) => (
          <TouchableOpacity
            key={link.label}
            onPress={link.onPress}
            style={styles.link}
            activeOpacity={0.7}
            accessibilityLabel={link.label}
          >
            <Icon
              name={ICONS[link.label] || 'ellipse-outline'}
              size={22}
              color={colors.primary}
            />
            <Text style={styles.linkText}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 28,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
    gap: 8,
  },
  link: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.md,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
