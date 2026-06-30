import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  FlatList,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, palette, radius, spacing } from '../theme/theme';
import {
  weekKeys,
  weekdayShort,
  dayNumber,
  monthYear,
  isTodayKey,
  dateToKey,
  keyToDate,
} from '../utils/time';
import { addDays } from 'date-fns';
import { useStore, dayDots } from '../store/useStore';
import { tap } from '../utils/haptics';
import { useDfLocale } from '../i18n';
import { CalendarModal } from './CalendarModal';

const WEEK_WINDOW = 53; // weeks rendered around "now" for swiping

export function DateStrip() {
  const { width } = useWindowDimensions();
  const selectedDate = useStore((s) => s.selectedDate);
  const setSelectedDate = useStore((s) => s.setSelectedDate);
  const tasks = useStore((s) => s.tasks);
  const listRef = useRef<FlatList>(null);
  const locale = useDfLocale();
  const weekStartsOn = useStore((s) => s.settings.weekStartsOn) as 0 | 1 | 6;
  const [calOpen, setCalOpen] = useState(false);

  // Build a list of week-start keys centered on today.
  const weeks = useMemo(() => {
    const center = Math.floor(WEEK_WINDOW / 2);
    const todayWeek = weekKeys(selectedDate || dateToKey(new Date()), weekStartsOn);
    return Array.from({ length: WEEK_WINDOW }, (_, i) => {
      const offset = i - center;
      return weekKeys(dateToKey(addDays(keyToDate(todayWeek[0]), offset * 7)), weekStartsOn);
    });
  }, [weekStartsOn]);

  const initialIndex = Math.floor(WEEK_WINDOW / 2);
  const { month, year } = monthYear(selectedDate || dateToKey(new Date()), locale);

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          <Text style={styles.month}>{month} </Text>
          <Text style={styles.year}>{year}</Text>
        </View>
        <Pressable
          hitSlop={10}
          style={styles.calBtn}
          onPress={() => {
            tap.light();
            setCalOpen(true);
          }}
        >
          <Ionicons name="calendar-clear-outline" size={22} color={colors.accent} />
        </Pressable>
      </View>

      <CalendarModal
        visible={calOpen}
        initialKey={selectedDate}
        onSelect={setSelectedDate}
        onClose={() => setCalOpen(false)}
      />

      <FlatList
        ref={listRef}
        data={weeks}
        keyExtractor={(w) => w[0]}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        windowSize={3}
        renderItem={({ item: week }) => (
          <View style={[styles.week, { width }]}>
            {week.map((key: string) => {
              const selected = key === selectedDate;
              const today = isTodayKey(key);
              const dots = dayDots(tasks, key);
              return (
                <Pressable
                  key={key}
                  style={styles.day}
                  onPress={() => {
                    tap.selection();
                    setSelectedDate(key);
                  }}
                >
                  <Text style={[styles.wd, today && styles.wdToday]}>
                    {weekdayShort(key, locale)}
                  </Text>
                  <View
                    style={[
                      styles.numWrap,
                      selected && styles.numWrapSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.num,
                        selected && styles.numSelected,
                        !selected && today && styles.numToday,
                      ]}
                    >
                      {dayNumber(key)}
                    </Text>
                  </View>
                  <View style={styles.dots}>
                    {dots.map((c, i) => (
                      <Animated.View
                        key={i}
                        entering={FadeIn.duration(160)}
                        style={[styles.dot, { backgroundColor: palette[c] }]}
                      />
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: spacing(1) },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(5),
    marginBottom: spacing(3),
  },
  titleLeft: { flexDirection: 'row', alignItems: 'baseline' },
  calBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: { color: colors.textPrimary, fontSize: 30, fontWeight: font.black, textTransform: 'capitalize' },
  year: { color: colors.accent, fontSize: 30, fontWeight: font.black },

  week: { flexDirection: 'row', paddingHorizontal: spacing(2) },
  day: { flex: 1, alignItems: 'center' },
  wd: { color: colors.textTertiary, fontSize: 12, fontWeight: font.semibold, marginBottom: spacing(2) },
  wdToday: { color: colors.textSecondary },

  numWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numWrapSelected: { backgroundColor: colors.accent },
  num: { color: colors.textPrimary, fontSize: 17, fontWeight: font.semibold },
  numSelected: { color: colors.bg, fontWeight: font.bold },
  numToday: { color: colors.accent },

  dots: {
    flexDirection: 'row',
    height: 8,
    marginTop: spacing(1.5),
    gap: 3,
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
});
