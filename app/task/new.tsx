import React from 'react';
import { View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, font, spacing } from '../../src/theme/theme';
import { TaskForm, FormValue } from '../../src/components/TaskForm';
import { useStore } from '../../src/store/useStore';
import { useT } from '../../src/i18n';

export default function NewTask() {
  const router = useRouter();
  const tr = useT();
  const { inbox } = useLocalSearchParams<{ inbox?: string }>();
  const addTask = useStore((s) => s.addTask);
  const selectedDate = useStore((s) => s.selectedDate);
  const wake = useStore((s) => s.settings.wakeMinutes);
  const isInbox = inbox === '1';

  const initial: FormValue = {
    title: '',
    emoji: '✨',
    color: 'coral',
    date: selectedDate,
    startMinutes: wake,
    durationMinutes: 30,
    repeat: 'once',
    repeatEvery: 1,
    repeatUnit: 'day',
    alerts: [],
    allDay: false,
    inbox: isInbox,
    subtasks: [],
    notes: '',
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>
          {tr('form.new')}<Text style={styles.accent}>{tr('form.new.accent')}</Text>
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TaskForm
          initial={initial}
          submitLabel={isInbox ? tr('form.submit.inbox') : tr('form.submit.add')}
          onSubmit={(v: FormValue) => {
            addTask(v);
            router.back();
          }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(3),
  },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: font.bold },
  accent: { color: colors.accent },
});
