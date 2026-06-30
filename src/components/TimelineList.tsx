import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, spacing, motion } from '../theme/theme';
import { Task } from '../types';
import { TimelineItem, GUTTER_W, RAIL_W } from './TimelineItem';
import { fmtDuration } from '../utils/time';
import { useT, useLang } from '../i18n';

type Props = {
  items: Task[];
  date: string;
  onPressTask: (t: Task) => void;
};

const LINE_X = GUTTER_W + RAIL_W / 2 - 1;

/** A soft "nothing scheduled" gap between two tasks, threaded by a dotted line. */
function GapRow({ minutes, delay }: { minutes: number; delay: number }) {
  const tr = useT();
  const lang = useLang();
  return (
    <MotiView
      from={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: 'timing', duration: motion.base, delay }}
      style={styles.gapRow}
    >
      <View style={styles.gapDottedLine} pointerEvents="none" />
      <View style={styles.gapRailSpacer} />
      <View style={styles.gapContent}>
        <Ionicons name="moon-outline" size={15} color={colors.textTertiary} />
        <Text style={styles.gapText}>
          {minutes >= 60
            ? tr('timeline.freeTime', { dur: fmtDuration(minutes, lang) })
            : tr('timeline.intervalOver')}
        </Text>
      </View>
    </MotiView>
  );
}

export function TimelineList({ items, date, onPressTask }: Props) {
  const tr = useT();
  if (items.length === 0) {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: motion.slow }}
        style={styles.empty}
      >
        <Text style={styles.emptyEmoji}>🌤️</Text>
        <Text style={styles.emptyTitle}>{tr('timeline.empty.title')}</Text>
        <Text style={styles.emptySub}>{tr('timeline.empty.sub')}</Text>
      </MotiView>
    );
  }

  // Pre-compute the gap (idle minutes) before each item.
  const gaps = items.map((task, i) => {
    const prev = items[i - 1];
    return prev ? task.startMinutes - (prev.startMinutes + prev.durationMinutes) : 0;
  });

  return (
    <View style={styles.wrap}>
      {items.map((task, i) => {
        const gapBefore = gaps[i] >= 15;
        const gapAfter = i + 1 < items.length && gaps[i + 1] >= 15;
        return (
          <React.Fragment key={task.id}>
            {gapBefore && <GapRow minutes={gaps[i]} delay={motion.stagger(i)} />}
            <TimelineItem
              task={task}
              index={i}
              date={date}
              first={i === 0}
              last={i === items.length - 1}
              gapBefore={gapBefore}
              gapAfter={gapAfter}
              onPress={onPressTask}
            />
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative', paddingBottom: spacing(6) },

  gapRow: { flexDirection: 'row', alignItems: 'center', minHeight: 46, position: 'relative' },
  gapDottedLine: {
    position: 'absolute',
    left: LINE_X,
    top: 0,
    bottom: 0,
    width: 0,
    borderLeftWidth: 3,
    borderColor: colors.checkRing,
    borderStyle: 'dashed',
  },
  gapRailSpacer: { width: GUTTER_W + RAIL_W },
  gapContent: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), flex: 1 },
  gapText: { color: colors.textTertiary, fontSize: 14, fontWeight: font.medium },

  empty: { alignItems: 'center', paddingTop: spacing(16), paddingHorizontal: spacing(10) },
  emptyEmoji: { fontSize: 44, marginBottom: spacing(3) },
  emptyTitle: { color: colors.textPrimary, fontSize: 19, fontWeight: font.bold },
  emptySub: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing(2),
    lineHeight: 20,
  },
});
