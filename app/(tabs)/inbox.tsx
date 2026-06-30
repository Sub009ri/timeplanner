import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, font, palette, radius, spacing, tint } from '../../src/theme/theme';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { Fab } from '../../src/components/Fab';
import { useStore, inboxTasks } from '../../src/store/useStore';
import { todayKey } from '../../src/utils/time';
import { tap } from '../../src/utils/haptics';
import { useT } from '../../src/i18n';

export default function InboxScreen() {
  const router = useRouter();
  const tr = useT();
  const tasks = useStore((s) => s.tasks);
  const schedule = useStore((s) => s.scheduleFromInbox);
  const wake = useStore((s) => s.settings.wakeMinutes);
  const items = inboxTasks(tasks);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScreenHeader title={tr('inbox.title')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 360 }}
            style={styles.empty}
          >
            <Text style={styles.emptyEmoji}>📥</Text>
            <Text style={styles.emptyTitle}>{tr('inbox.empty.title')}</Text>
            <Text style={styles.emptySub}>{tr('inbox.empty.sub')}</Text>
          </MotiView>
        ) : (
          items.map((t, i) => {
            const c = palette[t.color];
            return (
              <MotiView
                key={t.id}
                from={{ opacity: 0, translateX: -10 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 280, delay: i * 50 }}
              >
                <Pressable style={styles.card} onPress={() => router.push(`/task/${t.id}`)}>
                  <View style={[styles.icon, { backgroundColor: tint(c, 0.18) }]}>
                    <Text style={styles.emoji}>{t.emoji}</Text>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {t.title}
                  </Text>
                  <Pressable
                    hitSlop={10}
                    style={[styles.schedule, { backgroundColor: c }]}
                    onPress={() => {
                      tap.success();
                      schedule(t.id, todayKey(), wake);
                    }}
                  >
                    <Ionicons name="calendar-outline" size={16} color={colors.bg} />
                  </Pressable>
                </Pressable>
              </MotiView>
            );
          })
        )}
      </ScrollView>

      <Fab style={styles.fab} onPress={() => router.push('/task/new?inbox=1')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing(5), paddingBottom: spacing(28), gap: spacing(3) },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(3),
    gap: spacing(3),
  },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 20 },
  cardTitle: { flex: 1, color: colors.textPrimary, fontSize: 16, fontWeight: font.semibold },
  schedule: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  empty: { alignItems: 'center', paddingTop: spacing(20), paddingHorizontal: spacing(6) },
  emptyEmoji: { fontSize: 44, marginBottom: spacing(3) },
  emptyTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: font.bold },
  emptySub: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: spacing(2), lineHeight: 20 },
  fab: { position: 'absolute', right: spacing(5), bottom: spacing(6) },
});
