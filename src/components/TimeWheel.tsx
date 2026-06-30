import React, { useMemo, useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { colors, font, palette, radius, spacing } from '../theme/theme';
import { fmtTime } from '../utils/time';
import { tap } from '../utils/haptics';

const ITEM_H = 52;

type Props = {
  value: number; // minutes from midnight
  onChange: (minutes: number) => void;
  /** inclusive range in minutes */
  min?: number;
  max?: number;
  step?: number;
  /** Custom row label; defaults to HH:MM. */
  renderLabel?: (minutes: number) => string;
  /** Smaller text for wider labels like ranges. */
  compact?: boolean;
};

/**
 * Snapping vertical time picker with a highlighted center selection.
 * Uses a ScrollView (not FlatList) so it can be safely nested inside the
 * vertical ScrollView of the task form without VirtualizedList warnings.
 */
export function TimeWheel({
  value,
  onChange,
  min = 5 * 60,
  max = 11 * 60,
  step = 5,
  renderLabel = fmtTime,
  compact = false,
}: Props) {
  const ref = useRef<ScrollView>(null);
  const didInit = useRef(false);
  const data = useMemo(() => {
    const out: number[] = [];
    for (let m = min; m <= max; m += step) out.push(m);
    return out;
  }, [min, max, step]);

  // Closest grid index to the current value, for the initial offset.
  const initialIndex = useMemo(() => {
    let best = 0;
    let bestDiff = Infinity;
    data.forEach((m, i) => {
      const d = Math.abs(m - value);
      if (d < bestDiff) {
        bestDiff = d;
        best = i;
      }
    });
    return best;
  }, [data]);

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    const next = data[Math.max(0, Math.min(data.length - 1, idx))];
    if (next !== value) {
      tap.selection();
      onChange(next);
    }
  };

  return (
    <View style={styles.wrap}>
      {/* center selection band */}
      <View style={styles.band} pointerEvents="none" />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        nestedScrollEnabled
        contentOffset={{ x: 0, y: initialIndex * ITEM_H }}
        contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
        onContentSizeChange={() => {
          if (!didInit.current) {
            didInit.current = true;
            ref.current?.scrollTo({ y: initialIndex * ITEM_H, animated: false });
          }
        }}
        onMomentumScrollEnd={settle}
        onScrollEndDrag={settle}
      >
        {data.map((item) => {
          const selected = item === value;
          return (
            <Pressable
              key={item}
              style={styles.item}
              onPress={() => {
                tap.selection();
                onChange(item);
                ref.current?.scrollTo({ y: data.indexOf(item) * ITEM_H, animated: true });
              }}
            >
              <Text
                style={[
                  compact ? styles.timeCompact : styles.time,
                  selected ? styles.timeSelected : styles.timeIdle,
                ]}
              >
                {renderLabel(item)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: ITEM_H * 5, justifyContent: 'center' },
  band: {
    position: 'absolute',
    left: spacing(6),
    right: spacing(6),
    height: ITEM_H,
    top: ITEM_H * 2,
    backgroundColor: palette.coral,
    borderRadius: radius.md,
  },
  item: { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
  time: { fontSize: 26, fontWeight: font.bold },
  timeCompact: { fontSize: 21, fontWeight: font.bold },
  timeSelected: { color: colors.bg },
  timeIdle: { color: colors.textTertiary },
});
