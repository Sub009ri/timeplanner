import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, font, palette, radius, spacing, tint } from '../../src/theme/theme';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { PickerModal } from '../../src/components/PickerModal';
import { useStore, Language } from '../../src/store/useStore';
import { fmtTime } from '../../src/utils/time';
import { tap } from '../../src/utils/haptics';
import { useT } from '../../src/i18n';

function Row({
  icon,
  color,
  label,
  value,
  right,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  value?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={[styles.rowIcon, { backgroundColor: tint(color, 0.18) }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} /> : null)}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const tr = useT();
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const resetOnboarding = useStore((s) => s.resetOnboarding);
  const tasks = useStore((s) => s.tasks);

  const [langOpen, setLangOpen] = useState(false);
  const [weekOpen, setWeekOpen] = useState(false);

  const setWake = (delta: number) => {
    tap.selection();
    const next = Math.max(0, Math.min(23 * 60 + 45, settings.wakeMinutes + delta));
    updateSettings({ wakeMinutes: next });
  };

  const languageLabel = settings.language === 'ru' ? tr('settings.language.ru') : tr('settings.language.en');

  // First-day-of-week options use locale-independent labels.
  const weekOptions = [
    { label: 'Mon', value: 1 },
    { label: 'Sun', value: 0 },
    { label: 'Sat', value: 6 },
  ];
  const weekLabel = weekOptions.find((w) => w.value === settings.weekStartsOn)?.label ?? 'Mon';

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScreenHeader title={tr('settings.title')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.section}>{tr('settings.prefs')}</Text>
        <View style={styles.card}>
          <Row
            icon="sunny-outline"
            color={palette.coral}
            label={tr('settings.wake')}
            value={fmtTime(settings.wakeMinutes)}
            right={
              <View style={styles.stepper}>
                <Pressable hitSlop={8} onPress={() => setWake(-15)} style={styles.stepBtn}>
                  <Ionicons name="remove" size={16} color={colors.textPrimary} />
                </Pressable>
                <Pressable hitSlop={8} onPress={() => setWake(15)} style={styles.stepBtn}>
                  <Ionicons name="add" size={16} color={colors.textPrimary} />
                </Pressable>
              </View>
            }
          />
          <View style={styles.sep} />
          <Row
            icon="notifications-outline"
            color={palette.blue}
            label={tr('settings.notifications')}
            right={
              <Switch
                value={settings.notifications}
                onValueChange={(v) => {
                  tap.light();
                  updateSettings({ notifications: v });
                }}
                trackColor={{ true: palette.coral, false: colors.surfacePressed }}
                thumbColor={colors.textPrimary}
              />
            }
          />
          <View style={styles.sep} />
          <Row
            icon="phone-portrait-outline"
            color={palette.green}
            label={tr('settings.haptics')}
            right={
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={(v) => {
                  if (v) tap.light();
                  updateSettings({ hapticsEnabled: v });
                }}
                trackColor={{ true: palette.coral, false: colors.surfacePressed }}
                thumbColor={colors.textPrimary}
              />
            }
          />
        </View>

        <Text style={styles.section}>{tr('settings.general')}</Text>
        <View style={styles.card}>
          <Row
            icon="language-outline"
            color={palette.indigo}
            label={tr('settings.language')}
            value={languageLabel}
            onPress={() => {
              tap.light();
              setLangOpen(true);
            }}
          />
          <View style={styles.sep} />
          <Row
            icon="calendar-outline"
            color={palette.teal}
            label={tr('settings.weekStart')}
            value={weekLabel}
            onPress={() => {
              tap.light();
              setWeekOpen(true);
            }}
          />
        </View>

        <Text style={styles.section}>{tr('settings.data')}</Text>
        <View style={styles.card}>
          <Row icon="albums-outline" color={palette.yellow} label={tr('settings.totalTasks')} value={String(tasks.length)} />
          <View style={styles.sep} />
          <Row
            icon="refresh-outline"
            color={palette.green}
            label={tr('settings.replay')}
            onPress={() => router.push('/onboarding')}
          />
          <View style={styles.sep} />
          <Row
            icon="trash-outline"
            color={palette.red}
            label={tr('settings.clear')}
            onPress={() =>
              Alert.alert(tr('settings.clear.title'), tr('settings.clear.msg'), [
                { text: tr('common.cancel'), style: 'cancel' },
                {
                  text: tr('settings.clear.confirm'),
                  style: 'destructive',
                  onPress: () => {
                    resetOnboarding();
                    router.replace('/onboarding');
                  },
                },
              ])
            }
          />
        </View>

        <Text style={styles.footer}>{tr('settings.footer')}</Text>
      </ScrollView>

      <PickerModal<Language>
        visible={langOpen}
        title={tr('settings.language')}
        value={settings.language}
        options={[
          { label: tr('settings.language.en'), value: 'en' },
          { label: tr('settings.language.ru'), value: 'ru' },
        ]}
        onSelect={(language) => updateSettings({ language })}
        onClose={() => setLangOpen(false)}
      />

      <PickerModal<number>
        visible={weekOpen}
        title={tr('settings.weekStart')}
        value={settings.weekStartsOn}
        options={weekOptions}
        onSelect={(weekStartsOn) => updateSettings({ weekStartsOn })}
        onClose={() => setWeekOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing(5), paddingBottom: spacing(20) },
  section: {
    color: colors.textTertiary,
    fontSize: 13,
    fontWeight: font.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing(4),
    marginBottom: spacing(2),
  },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing(3.5), gap: spacing(3) },
  rowIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, color: colors.textPrimary, fontSize: 16, fontWeight: font.medium },
  rowValue: { color: colors.textSecondary, fontSize: 16, fontWeight: font.semibold, marginRight: spacing(1) },
  sep: { height: 1, backgroundColor: colors.hairline, marginLeft: spacing(12) },
  stepper: { flexDirection: 'row', gap: spacing(2) },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    color: colors.textTertiary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing(8),
  },
});
