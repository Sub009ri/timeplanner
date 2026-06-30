import React, { useMemo, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  isSameMonth,
  isSameDay,
  format,
} from 'date-fns';
import { colors, font, palette, radius, spacing, motion } from '../theme/theme';
import { keyToDate, dateToKey, isTodayKey } from '../utils/time';
import { useStore } from '../store/useStore';
import { useT, useDfLocale } from '../i18n';
import { tap } from '../utils/haptics';

type Props = {
  visible: boolean;
  initialKey: string;
  onSelect: (key: string) => void;
  onClose: () => void;
};

/** Themed month-grid date picker shown from the Timeline header. */
export function CalendarModal({ visible, initialKey, onSelect, onClose }: Props) {
  const tr = useT();
  const locale = useDfLocale();
  const weekStartsOn = useStore((s) => s.settings.weekStartsOn) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  const [cursor, setCursor] = useState(() => keyToDate(initialKey || dateToKey(new Date())));

  // Reset the visible month whenever the modal re-opens.
  React.useEffect(() => {
    if (visible) setCursor(keyToDate(initialKey || dateToKey(new Date())));
  }, [visible]);

  const weeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn });
    const days: Date[] = [];
    let d = start;
    while (d <= end) {
      days.push(d);
      d = addDays(d, 1);
    }
    const rows: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
    return rows;
  }, [cursor, weekStartsOn]);

  const weekdayLabels = useMemo(() => {
    const base = startOfWeek(new Date(), { weekStartsOn });
    return Array.from({ length: 7 }, (_, i) => format(addDays(base, i), 'EEEEE', { locale }));
  }, [weekStartsOn, locale]);

  const selected = keyToDate(initialKey || dateToKey(new Date()));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <MotiView
          from={{ opacity: 0, scale: 0.96, translateY: 8 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: motion.base }}
          style={styles.sheet}
          // stop taps inside the sheet from closing it
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.title}>{tr('cal.title')}</Text>

          <View style={styles.monthRow}>
            <Text style={styles.monthLabel}>
              {format(cursor, 'LLLL yyyy', { locale })}
            </Text>
            <View style={styles.navBtns}>
              <Pressable
                hitSlop={10}
                style={styles.navBtn}
                onPress={() => {
                  tap.selection();
                  setCursor((c) => addMonths(c, -1));
                }}
              >
                <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
              </Pressable>
              <Pressable
                hitSlop={10}
                style={styles.navBtn}
                onPress={() => {
                  tap.selection();
                  setCursor((c) => addMonths(c, 1));
                }}
              >
                <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>
          </View>

          <View style={styles.weekHead}>
            {weekdayLabels.map((w, i) => (
              <Text key={i} style={styles.weekHeadText}>
                {w.toUpperCase()}
              </Text>
            ))}
          </View>

          {weeks.map((row, ri) => (
            <View key={ri} style={styles.weekRow}>
              {row.map((day) => {
                const key = dateToKey(day);
                const inMonth = isSameMonth(day, cursor);
                const isSel = isSameDay(day, selected);
                const today = isTodayKey(key);
                return (
                  <Pressable
                    key={key}
                    style={styles.cell}
                    onPress={() => {
                      tap.selection();
                      onSelect(key);
                      onClose();
                    }}
                  >
                    <View style={[styles.cellInner, isSel && styles.cellSelected]}>
                      <Text
                        style={[
                          styles.cellText,
                          !inMonth && styles.cellMuted,
                          isSel && styles.cellTextSelected,
                          !isSel && today && styles.cellToday,
                        ]}
                      >
                        {format(day, 'd')}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}

          <View style={styles.footer}>
            <Pressable
              style={styles.todayBtn}
              onPress={() => {
                tap.light();
                onSelect(dateToKey(new Date()));
                onClose();
              }}
            >
              <Text style={styles.todayText}>{tr('common.today')}</Text>
            </Pressable>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>{tr('common.cancel')}</Text>
            </Pressable>
          </View>
        </MotiView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(6),
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: spacing(5),
  },
  title: { color: colors.accent, fontSize: 14, fontWeight: font.bold, marginBottom: spacing(3) },

  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthLabel: { color: colors.textPrimary, fontSize: 18, fontWeight: font.bold, textTransform: 'capitalize' },
  navBtns: { flexDirection: 'row', gap: spacing(2) },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  weekHead: { flexDirection: 'row', marginTop: spacing(4), marginBottom: spacing(1) },
  weekHeadText: {
    flex: 1,
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: 11,
    fontWeight: font.semibold,
  },

  weekRow: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', paddingVertical: spacing(1) },
  cellInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: { backgroundColor: colors.accent },
  cellText: { color: colors.textPrimary, fontSize: 15, fontWeight: font.medium },
  cellMuted: { color: colors.textTertiary, opacity: 0.5 },
  cellTextSelected: { color: colors.bg, fontWeight: font.bold },
  cellToday: { color: colors.accent, fontWeight: font.bold },

  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing(3),
    marginTop: spacing(4),
  },
  todayBtn: { paddingVertical: spacing(2), paddingHorizontal: spacing(3) },
  todayText: { color: colors.textSecondary, fontSize: 15, fontWeight: font.semibold },
  closeBtn: { paddingVertical: spacing(2), paddingHorizontal: spacing(3) },
  closeText: { color: colors.accent, fontSize: 15, fontWeight: font.bold },
});
