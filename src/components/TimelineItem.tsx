import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, palette, radius, spacing, tint, motion } from '../theme/theme';
import { Task } from '../types';
import { fmtTime, fmtRange, fmtDuration } from '../utils/time';
import { Checkbox } from './Checkbox';
import { useStore } from '../store/useStore';
import { tap } from '../utils/haptics';
import { useLang } from '../i18n';

export const RAIL_W = 64;
export const GUTTER_W = 52;
const NODE = 50;
const NODE_TOP = 6;
const NODE_CENTER = NODE_TOP + NODE / 2;

type Props = {
  task: Task;
  index: number;
  date: string;
  first: boolean;
  last: boolean;
  gapBefore: boolean;
  gapAfter: boolean;
  onPress: (t: Task) => void;
};

/** One timeline row: time gutter · circular node on a thread · details · checkbox. */
export function TimelineItem({
  task,
  index,
  date,
  first,
  last,
  gapBefore,
  gapAfter,
  onPress,
}: Props) {
  const c = palette[task.color];
  const toggleComplete = useStore((s) => s.toggleComplete);
  const lang = useLang();
  const done = task.completedDates.includes(date);

  // Longer tasks stretch the thread below the node — a sense of duration.
  const extra = Math.min(task.durationMinutes, 150) / 150 * 54;
  const minHeight = 74 + extra;

  const doneSub = task.subtasks.filter((s) => s.done).length;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: motion.base, delay: motion.stagger(index) }}
    >
      <Pressable
        style={[styles.row, { minHeight }]}
        onPress={() => {
          tap.light();
          onPress(task);
        }}
      >
        {/* time gutter */}
        <View style={styles.gutter}>
          <Text style={[styles.gutterTime, done && styles.dim]}>
            {fmtTime(task.startMinutes)}
          </Text>
        </View>

        {/* rail: connecting thread + circular node */}
        <View style={styles.rail}>
          {!first && (
            <View
              style={[
                styles.lineTop,
                { backgroundColor: gapBefore ? 'transparent' : c },
                gapBefore && styles.lineDotted,
              ]}
            />
          )}
          {!last && (
            <View
              style={[
                styles.lineBottom,
                { backgroundColor: gapAfter ? 'transparent' : c },
                gapAfter && styles.lineDotted,
              ]}
            />
          )}
          <View
            style={[
              styles.node,
              { backgroundColor: done ? tint(c, 0.4) : c },
            ]}
          >
            <Text style={styles.emoji}>{task.emoji}</Text>
          </View>
        </View>

        {/* details */}
        <View style={styles.body}>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, done && styles.dim]} numberOfLines={1}>
              {task.durationMinutes > 0
                ? `${fmtRange(task.startMinutes, task.durationMinutes)} (${fmtDuration(
                    task.durationMinutes,
                    lang
                  )})`
                : fmtTime(task.startMinutes)}
            </Text>
            {task.repeat !== 'once' && (
              <Ionicons name="repeat" size={13} color={colors.textTertiary} style={styles.metaIcon} />
            )}
            {task.alerts.length > 0 && (
              <Ionicons name="notifications-outline" size={12} color={colors.textTertiary} style={styles.metaIcon} />
            )}
          </View>

          <Text style={[styles.title, done && styles.titleDone]} numberOfLines={1}>
            {task.title}
          </Text>

          {task.subtasks.length > 0 && (
            <View style={styles.subPill}>
              <Ionicons
                name={doneSub === task.subtasks.length ? 'checkbox' : 'square-outline'}
                size={13}
                color={colors.textSecondary}
              />
              <Text style={styles.subText}>
                {doneSub}/{task.subtasks.length}
              </Text>
            </View>
          )}
        </View>

        {/* checkbox */}
        <View style={styles.check}>
          <Checkbox
            checked={done}
            color={task.color}
            onToggle={() => toggleComplete(task.id, date)}
          />
        </View>
      </Pressable>
    </MotiView>
  );
}

const LINE_X = RAIL_W / 2 - 1;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch', paddingRight: spacing(5) },
  gutter: { width: GUTTER_W, paddingTop: spacing(2.5), alignItems: 'flex-start', paddingLeft: spacing(2) },
  gutterTime: { color: colors.textTertiary, fontSize: 12, fontWeight: font.medium },

  rail: { width: RAIL_W, alignItems: 'center' },
  lineTop: {
    position: 'absolute',
    left: LINE_X,
    top: 0,
    height: NODE_CENTER,
    width: 3,
    borderRadius: 2,
  },
  lineBottom: {
    position: 'absolute',
    left: LINE_X,
    top: NODE_CENTER,
    bottom: 0,
    width: 3,
    borderRadius: 2,
  },
  lineDotted: {
    width: 0,
    borderLeftWidth: 3,
    borderColor: colors.checkRing,
    borderStyle: 'dashed',
  },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    marginTop: NODE_TOP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 21 },

  body: { flex: 1, paddingTop: spacing(2), justifyContent: 'flex-start' },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  meta: { color: colors.textSecondary, fontSize: 13, fontWeight: font.medium },
  metaIcon: { marginLeft: spacing(1.5) },
  title: { color: colors.textPrimary, fontSize: 19, fontWeight: font.bold, marginTop: spacing(1) },
  titleDone: { color: colors.textTertiary, textDecorationLine: 'line-through' },
  subPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: spacing(2),
  },
  subText: { color: colors.textSecondary, fontSize: 13, fontWeight: font.medium },

  check: { justifyContent: 'center', paddingLeft: spacing(2) },
  dim: { opacity: 0.5 },
});
