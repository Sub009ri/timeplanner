import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing } from '../../src/theme/theme';
import { DateStrip } from '../../src/components/DateStrip';
import { AllDayChips } from '../../src/components/AllDayChips';
import { TimelineList } from '../../src/components/TimelineList';
import { Fab } from '../../src/components/Fab';
import { useStore, tasksForDay } from '../../src/store/useStore';
import { Task } from '../../src/types';

export default function TimelineScreen() {
  const router = useRouter();
  const tasks = useStore((s) => s.tasks);
  const selectedDate = useStore((s) => s.selectedDate);

  const { allDay, timeline } = useMemo(
    () => tasksForDay(tasks, selectedDate),
    [tasks, selectedDate]
  );

  const openTask = (t: Task) => router.push(`/task/${t.id}`);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <DateStrip />

      <View style={styles.divider} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AllDayChips items={allDay} onPress={openTask} />
        <View style={styles.timelineWrap}>
          <TimelineList items={timeline} date={selectedDate} onPressTask={openTask} />
        </View>
      </ScrollView>

      <Fab style={styles.fab} onPress={() => router.push('/task/new')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
    marginTop: spacing(2),
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: spacing(28) },
  timelineWrap: { marginTop: spacing(2) },
  fab: {
    position: 'absolute',
    right: spacing(5),
    bottom: spacing(6),
  },
});
