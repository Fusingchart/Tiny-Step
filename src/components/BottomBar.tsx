/**
 * Centered bottom navigation bar
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
        {links.map((link, i) => (
          <TouchableOpacity
            key={link.label}
            onPress={link.onPress}
            style={[styles.link, i < links.length - 1 && styles.linkBorder]}
            accessibilityLabel={link.label}
          >
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
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  link: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  linkBorder: {
    borderRightWidth: 1,
    borderRightColor: '#e8e8e8',
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a2e',
  },
});
