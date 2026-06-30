import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors, font, palette, radius, spacing, motion } from '../theme/theme';
import { tap } from '../utils/haptics';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'ghost';
  style?: ViewStyle;
};

export function PrimaryButton({ label, onPress, variant = 'solid', style }: Props) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const ghost = variant === 'ghost';

  return (
    <Animated.View style={[aStyle, style]}>
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.97, motion.springPress))}
        onPressOut={() => (scale.value = withSpring(1, motion.springPress))}
        onPress={() => {
          tap.medium();
          onPress();
        }}
        style={[styles.btn, ghost ? styles.ghost : styles.solid]}
      >
        <Text style={[styles.label, ghost && styles.ghostLabel]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(6),
  },
  solid: { backgroundColor: palette.coral },
  ghost: { backgroundColor: 'transparent' },
  label: { color: colors.bg, fontSize: 17, fontWeight: font.bold },
  ghostLabel: { color: colors.textSecondary },
});
