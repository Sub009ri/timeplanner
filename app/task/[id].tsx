import React from 'react';
import { View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, font, spacing } from '../../src/theme/theme';
import { TaskForm, FormValue } from '../../src/components/TaskForm';
import { useStore } from '../../src/store/useStore';
import { useT } from '../../src/i18n';

export default function EditTask() {
  const router = useRouter();
  const tr = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = useStore((s) => s.tasks.find((t) => t.id === id));
  const updateTask = useStore((s) => s.updateTask);
  const removeTask = useStore((s) => s.removeTask);

  if (!task) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable hitSlop={12} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>{tr('form.notFound')}</Text>
          <View style={{ width: 28 }} />
        </View>
      </SafeAreaView>
    );
  }

  const { id: _omit, completedDates: _cd, ...rest } = task;
  const initial = rest as FormValue;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>
          {tr('form.edit')}<Text style={styles.accent}>{tr('form.edit.accent')}</Text>
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TaskForm
          initial={initial}
          submitLabel={tr('form.submit.save')}
          onSubmit={(v: FormValue) => {
            updateTask(task.id, v);
            router.back();
          }}
          onDelete={() => {
            removeTask(task.id);
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
