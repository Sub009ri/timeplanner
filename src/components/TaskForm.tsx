import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
  StyleSheet,
} from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { colors, font, palette, radius, spacing, tint, colorKeys, ColorKey, motion } from '../theme/theme';
import { Task, Subtask, RepeatMode, RepeatUnit, FormValue } from '../types';
import { fmtTime, fmtRange, keyToDate } from '../utils/time';
import { uid } from '../utils/id';
import { tap } from '../utils/haptics';
import { useT, useDfLocale } from '../i18n';
import { TimeWheel } from './TimeWheel';
import { CalendarModal } from './CalendarModal';
import { DurationWheelModal } from './DurationWheelModal';

const EMOJIS = ['✨', '⏰', '☀️', '🌙', '💻', '🏃', '☕', '🍽️', '📞', '📖', '🧘', '🚿', '🐾', '🛒', '🎂', '❤️', '🎯', '🎸', '✈️', '💊'];

const DURATIONS: { label: string; value: number }[] = [
  { label: '15m', value: 15 },
  { label: '30', value: 30 },
  { label: '45', value: 45 },
  { label: '1h', value: 60 },
  { label: '1.5h', value: 90 },
  { label: '2h', value: 120 },
];

const REPEATS: { mode: RepeatMode; key: string }[] = [
  { mode: 'once', key: 'form.repeat.once' },
  { mode: 'daily', key: 'form.repeat.daily' },
  { mode: 'weekly', key: 'form.repeat.weekly' },
  { mode: 'monthly', key: 'form.repeat.monthly' },
  { mode: 'custom', key: 'form.repeat.custom' },
];

const UNITS: { unit: RepeatUnit; key: string }[] = [
  { unit: 'day', key: 'form.unit.day' },
  { unit: 'week', key: 'form.unit.week' },
  { unit: 'month', key: 'form.unit.month' },
];

const ALERT_OPTIONS: { value: number; key: string }[] = [
  { value: 0, key: 'form.alert.start' },
  { value: 15, key: 'form.alert.15' },
  { value: 60, key: 'form.alert.60' },
];

export type { FormValue };

type Props = {
  initial: FormValue;
  submitLabel: string;
  onSubmit: (v: FormValue) => void;
  onDelete?: () => void;
};

export function TaskForm({ initial, submitLabel, onSubmit, onDelete }: Props) {
  const tr = useT();
  const locale = useDfLocale();
  const [v, setV] = useState<FormValue>(initial);
  const [subInput, setSubInput] = useState('');
  const [durOpen, setDurOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const set = (patch: Partial<FormValue>) => setV((p) => ({ ...p, ...patch }));

  const toggleAlert = (value: number) =>
    set({
      alerts: v.alerts.includes(value)
        ? v.alerts.filter((a) => a !== value)
        : [...v.alerts, value],
    });

  const addSub = () => {
    const val = subInput.trim();
    if (!val) return;
    tap.light();
    set({ subtasks: [...v.subtasks, { id: uid(), title: val, done: false }] });
    setSubInput('');
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* title + emoji */}
      <View style={styles.titleRow}>
        <Pressable
          style={[styles.emojiBtn, { backgroundColor: tint(palette[v.color], 0.18) }]}
          onPress={() => {
            tap.light();
            const idx = EMOJIS.indexOf(v.emoji);
            set({ emoji: EMOJIS[(idx + 1) % EMOJIS.length] });
          }}
        >
          <Text style={styles.emojiBig}>{v.emoji}</Text>
        </Pressable>
        <TextInput
          style={styles.titleInput}
          value={v.title}
          onChangeText={(title) => set({ title })}
          placeholder={tr('form.name')}
          placeholderTextColor={colors.textTertiary}
          autoFocus={!initial.title}
        />
      </View>

      {/* emoji strip */}
      <FlatList
        data={EMOJIS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(e) => e}
        contentContainerStyle={styles.emojiStrip}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.emojiChip, v.emoji === item && styles.emojiChipActive]}
            onPress={() => {
              tap.selection();
              set({ emoji: item });
            }}
          >
            <Text style={styles.emojiChipText}>{item}</Text>
          </Pressable>
        )}
      />

      {!v.allDay && (
        <>
          {/* when — spinnable wheel showing the start–end range */}
          <View style={styles.sectionRow}>
            <Text style={styles.section}>{tr('form.when')}</Text>
            <Pressable onPress={() => { tap.light(); setCalOpen(true); }}>
              <Text style={styles.detailsLink}>{tr('form.details')}</Text>
            </Pressable>
          </View>
          <TimeWheel
            value={v.startMinutes}
            onChange={(startMinutes) => set({ startMinutes })}
            min={0}
            max={24 * 60 - 15}
            step={15}
            compact
            renderLabel={(m) => fmtRange(m, v.durationMinutes)}
          />
          <Pressable
            style={styles.dateChip}
            onPress={() => { tap.light(); setCalOpen(true); }}
          >
            <Ionicons name="calendar-outline" size={15} color={colors.accent} />
            <Text style={styles.dateChipText}>
              {format(keyToDate(v.date), 'dd.MM.yyyy', { locale })}
            </Text>
          </Pressable>

          {/* duration — quick buttons + manual wheel via "Details…" */}
          <View style={styles.sectionRow}>
            <Text style={styles.section}>{tr('form.howLong')}</Text>
            <Pressable onPress={() => { tap.light(); setDurOpen(true); }}>
              <Text style={styles.detailsLink}>{tr('form.details')}</Text>
            </Pressable>
          </View>
          <View style={styles.segment}>
            {DURATIONS.map((d) => {
              const sel = v.durationMinutes === d.value;
              return (
                <Pressable
                  key={d.value}
                  style={[styles.seg, sel && styles.segActive]}
                  onPress={() => {
                    tap.selection();
                    set({ durationMinutes: d.value });
                  }}
                >
                  <Text style={[styles.segText, sel && styles.segTextActive]}>{d.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {/* color */}
      <Text style={styles.section}>{tr('form.color')}</Text>
      <View style={styles.colors}>
        {colorKeys.map((key: ColorKey) => {
          const sel = v.color === key;
          return (
            <Pressable
              key={key}
              onPress={() => {
                tap.selection();
                set({ color: key });
              }}
            >
              <MotiView
                animate={{ scale: sel ? 1.12 : 1 }}
                transition={{ type: 'spring', ...motion.springPress }}
                style={[
                  styles.colorDot,
                  { backgroundColor: palette[key] },
                  sel && styles.colorDotSel,
                ]}
              >
                {sel && <Ionicons name="checkmark" size={16} color={colors.bg} />}
              </MotiView>
            </Pressable>
          );
        })}
      </View>

      {/* how often */}
      <Text style={styles.section}>{tr('form.howOften')}</Text>
      <View style={styles.segment}>
        {REPEATS.map((r) => {
          const sel = v.repeat === r.mode;
          return (
            <Pressable
              key={r.mode}
              style={[styles.seg, sel && styles.segActive]}
              onPress={() => {
                tap.selection();
                set({ repeat: r.mode });
              }}
            >
              <Text style={[styles.segTextSmall, sel && styles.segTextActive]} numberOfLines={1}>
                {tr(r.key)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* custom interval: "Every [N] [unit]" */}
      {v.repeat === 'custom' && (
        <View style={styles.customRow}>
          <Text style={styles.customLabel}>{tr('form.every')}</Text>
          <View style={styles.stepper}>
            <Pressable
              style={styles.stepBtn}
              onPress={() => { tap.selection(); set({ repeatEvery: Math.max(1, v.repeatEvery - 1) }); }}
            >
              <Ionicons name="remove" size={16} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.stepValue}>{v.repeatEvery}</Text>
            <Pressable
              style={styles.stepBtn}
              onPress={() => { tap.selection(); set({ repeatEvery: Math.min(99, v.repeatEvery + 1) }); }}
            >
              <Ionicons name="add" size={16} color={colors.textPrimary} />
            </Pressable>
          </View>
          <View style={[styles.segment, { flex: 1 }]}>
            {UNITS.map((u) => {
              const sel = v.repeatUnit === u.unit;
              return (
                <Pressable
                  key={u.unit}
                  style={[styles.seg, sel && styles.segActive]}
                  onPress={() => { tap.selection(); set({ repeatUnit: u.unit }); }}
                >
                  <Text style={[styles.segTextSmall, sel && styles.segTextActive]}>{tr(u.key)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* alerts */}
      {!v.allDay && (
        <>
          <Text style={styles.section}>{tr('form.alerts')}</Text>
          <View style={styles.optionRow}>
            {ALERT_OPTIONS.map((a) => (
              <OptionChip
                key={a.value}
                icon="notifications-outline"
                label={tr(a.key)}
                active={v.alerts.includes(a.value)}
                onPress={() => toggleAlert(a.value)}
              />
            ))}
          </View>
        </>
      )}

      {/* all-day */}
      <Text style={styles.section}>{tr('form.allDay')}</Text>
      <View style={styles.optionRow}>
        <OptionChip
          icon={v.allDay ? 'star' : 'star-outline'}
          label={tr('form.allDay')}
          active={v.allDay}
          onPress={() => set({ allDay: !v.allDay })}
        />
      </View>

      {/* subtasks */}
      <Text style={styles.section}>{tr('form.checklist')}</Text>
      {v.subtasks.map((s: Subtask) => (
        <View key={s.id} style={styles.subRow}>
          <Ionicons name="ellipse-outline" size={16} color={colors.textTertiary} />
          <Text style={styles.subText}>{s.title}</Text>
          <Pressable
            hitSlop={8}
            onPress={() => set({ subtasks: v.subtasks.filter((x) => x.id !== s.id) })}
          >
            <Ionicons name="close" size={18} color={colors.textTertiary} />
          </Pressable>
        </View>
      ))}
      <View style={styles.subAddRow}>
        <TextInput
          style={styles.subInput}
          value={subInput}
          onChangeText={setSubInput}
          placeholder={tr('form.addStep')}
          placeholderTextColor={colors.textTertiary}
          onSubmitEditing={addSub}
          returnKeyType="done"
        />
        <Pressable style={styles.subAddBtn} onPress={addSub}>
          <Ionicons name="add" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* notes */}
      <Text style={styles.section}>{tr('form.notes')}</Text>
      <TextInput
        style={styles.notes}
        value={v.notes}
        onChangeText={(notes) => set({ notes })}
        placeholder={tr('form.notes.placeholder')}
        placeholderTextColor={colors.textTertiary}
        multiline
      />

      {onDelete && (
        <Pressable style={styles.delete} onPress={onDelete}>
          <Ionicons name="trash-outline" size={18} color={palette.red} />
          <Text style={styles.deleteText}>{tr('form.delete')}</Text>
        </Pressable>
      )}

      {/* submit */}
      <Pressable
        style={[styles.submit, !v.title.trim() && { opacity: 0.5 }]}
        disabled={!v.title.trim()}
        onPress={() => {
          tap.success();
          onSubmit(v);
        }}
      >
        <Text style={styles.submitText}>{submitLabel}</Text>
      </Pressable>

      <DurationWheelModal
        visible={durOpen}
        value={v.durationMinutes}
        onChange={(durationMinutes) => set({ durationMinutes })}
        onClose={() => setDurOpen(false)}
      />
      <CalendarModal
        visible={calOpen}
        initialKey={v.date}
        onSelect={(date) => set({ date })}
        onClose={() => setCalOpen(false)}
      />
    </ScrollView>
  );
}

function OptionChip({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.optChip, active && styles.optChipActive]}
      onPress={() => {
        tap.light();
        onPress();
      }}
    >
      <Ionicons name={icon} size={16} color={active ? colors.bg : colors.textSecondary} />
      <Text style={[styles.optText, active && styles.optTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing(5), paddingBottom: spacing(12) },

  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), marginTop: spacing(2) },
  emojiBtn: { width: 56, height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  emojiBig: { fontSize: 26 },
  titleInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: font.semibold,
    borderBottomWidth: 2,
    borderBottomColor: colors.hairline,
    paddingBottom: spacing(2),
  },

  emojiStrip: { gap: spacing(2), paddingVertical: spacing(4) },
  emojiChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiChipActive: { backgroundColor: colors.surfacePressed, borderWidth: 1, borderColor: colors.accent },
  emojiChipText: { fontSize: 20 },

  section: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: font.bold,
    marginTop: spacing(5),
    marginBottom: spacing(3),
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailsLink: { color: colors.accent, fontSize: 14, fontWeight: font.semibold },

  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing(2),
    marginTop: spacing(3),
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(4),
  },
  dateChipText: { color: colors.accent, fontSize: 15, fontWeight: font.bold },

  customRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), marginTop: spacing(3) },
  customLabel: { color: colors.textSecondary, fontSize: 14, fontWeight: font.semibold },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { color: colors.textPrimary, fontSize: 16, fontWeight: font.bold, minWidth: 22, textAlign: 'center' },

  slotStrip: { gap: spacing(2) },
  slot: {
    width: 76,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotActive: { backgroundColor: palette.coral },
  slotText: { color: colors.textSecondary, fontSize: 16, fontWeight: font.semibold },
  slotTextActive: { color: colors.bg, fontWeight: font.bold },

  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing(1),
    gap: spacing(1),
  },
  seg: { flex: 1, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  segActive: { backgroundColor: palette.coral },
  segText: { color: colors.textSecondary, fontSize: 14, fontWeight: font.semibold },
  segTextSmall: { color: colors.textSecondary, fontSize: 12.5, fontWeight: font.semibold },
  segTextActive: { color: colors.bg, fontWeight: font.bold },

  colors: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(3) },
  colorDot: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  colorDotSel: { borderWidth: 2, borderColor: colors.textPrimary },

  optionRow: { flexDirection: 'row', gap: spacing(2) },
  optChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2.5),
  },
  optChipActive: { backgroundColor: palette.coral },
  optText: { color: colors.textSecondary, fontSize: 14, fontWeight: font.semibold },
  optTextActive: { color: colors.bg, fontWeight: font.bold },

  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    paddingVertical: spacing(2),
  },
  subText: { flex: 1, color: colors.textPrimary, fontSize: 15 },
  subAddRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), marginTop: spacing(2) },
  subInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing(3.5),
    paddingVertical: spacing(3),
  },
  subAddBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notes: {
    color: colors.textPrimary,
    fontSize: 15,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing(3.5),
    paddingVertical: spacing(3),
    minHeight: 80,
    textAlignVertical: 'top',
  },

  delete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(2),
    marginTop: spacing(7),
    paddingVertical: spacing(3),
  },
  deleteText: { color: palette.red, fontSize: 15, fontWeight: font.semibold },

  submit: {
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: palette.coral,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing(6),
  },
  submitText: { color: colors.bg, fontSize: 17, fontWeight: font.bold },
});
