import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, font, palette, radius, spacing, tint, motion } from '../theme/theme';
import { tap } from '../utils/haptics';

const ICONS: Record<string, { on: keyof typeof Ionicons.glyphMap; off: keyof typeof Ionicons.glyphMap; bump?: number }> = {
  inbox: { on: 'file-tray', off: 'file-tray-outline' },
  index: { on: 'reorder-three', off: 'reorder-three', bump: 4 },
  ai: { on: 'sparkles', off: 'sparkles-outline', bump: -2 },
  settings: { on: 'settings', off: 'settings-outline' },
};

/**
 * Custom bottom bar: the focused tab scales up, tints to the accent color and
 * grows a soft rounded "pill" behind the icon — all spring-animated.
 */
export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, spacing(2)) },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const label = (options.title ?? route.name) as string;
        const icon = ICONS[route.name] ?? ICONS.index;
        const badge = options.tabBarBadge;

        const onPress = () => {
          tap.selection();
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable key={route.key} style={styles.item} onPress={onPress} hitSlop={6}>
            <MotiView
              animate={{
                scale: focused ? 1.12 : 1,
                backgroundColor: focused ? tint(palette.coral, 0.16) : 'rgba(0,0,0,0)',
              }}
              transition={{ type: 'spring', ...motion.springPress }}
              style={styles.pill}
            >
              <Ionicons
                name={focused ? icon.on : icon.off}
                size={22 + (icon.bump ?? 0)}
                color={focused ? palette.coral : colors.tabInactive}
              />
              {badge != null && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{String(badge)}</Text>
                </View>
              )}
            </MotiView>
            <MotiView animate={{ opacity: focused ? 1 : 0.85 }} transition={{ type: 'timing', duration: motion.fast }}>
              <Text style={[styles.label, { color: focused ? palette.coral : colors.tabInactive }]}>
                {label}
              </Text>
            </MotiView>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    paddingTop: spacing(2.5),
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing(1) },
  pill: {
    width: 56,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 11, fontWeight: font.semibold },
  badge: {
    position: 'absolute',
    top: -2,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: palette.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.bg, fontSize: 10, fontWeight: font.bold },
});
