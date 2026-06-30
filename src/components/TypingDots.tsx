import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { colors, spacing } from '../theme/theme';

/** Three pulsing dots — the assistant "is typing" indicator. */
export function TypingDots() {
  return (
    <View style={styles.bubble}>
      {[0, 1, 2].map((i) => (
        <MotiView
          key={i}
          from={{ opacity: 0.3, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'timing',
            duration: 500,
            loop: true,
            repeatReverse: true,
            delay: i * 160,
          }}
          style={styles.dot}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    flexDirection: 'row',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingVertical: spacing(3.5),
    paddingHorizontal: spacing(4),
    marginBottom: spacing(2),
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.textSecondary },
});
