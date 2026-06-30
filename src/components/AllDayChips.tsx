import React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { colors, font, palette, spacing, tint, motion } from '../theme/theme';
import { Ring } from './Ring';
import { Task } from '../types';
import { tap } from '../utils/haptics';

type Props = {
  items: Task[];
  onPress: (task: Task) => void;
};

export function AllDayChips({ items, onPress }: Props) {
  if (items.length === 0) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {items.map((t, i) => {
        const c = palette[t.color];
        return (
          <MotiView
            key={t.id}
            from={{ opacity: 0, translateY: 4 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: motion.base, delay: motion.stagger(i) }}
          >
            <Pressable
              style={styles.chip}
              onPress={() => {
                tap.light();
                onPress(t);
              }}
            >
              <View style={styles.iconWrap}>
                {t.ringProgress != null ? (
                  <Ring
                    size={52}
                    stroke={4}
                    progress={t.ringProgress}
                    color={c}
                    track={colors.surfaceElevated}
                  >
                    <View style={[styles.iconInner, { backgroundColor: tint(c, 0.18) }]}>
                      <Text style={styles.emoji}>{t.emoji}</Text>
                    </View>
                  </Ring>
                ) : (
                  <View style={[styles.iconPlain, { backgroundColor: colors.surfaceElevated }]}>
                    <Text style={styles.emoji}>{t.emoji}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.label} numberOfLines={2}>
                {t.title}
              </Text>
            </Pressable>
          </MotiView>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing(5), paddingVertical: spacing(2), gap: spacing(5) },
  chip: { alignItems: 'center', width: 74 },
  iconWrap: { height: 56, alignItems: 'center', justifyContent: 'center' },
  iconInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlain: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 20 },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: font.semibold,
    textAlign: 'center',
    marginTop: spacing(2),
  },
});
