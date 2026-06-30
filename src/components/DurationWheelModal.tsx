import React, { useMemo, useRef } from 'react';
import { Modal, View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { colors, font, palette, radius, spacing, motion } from '../theme/theme';
import { tap } from '../utils/haptics';
import { useT } from '../i18n';

const ITEM_H = 46;

function Col({
  data,
  value,
  unit,
  onChange,
}: {
  data: number[];
  value: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const ref = useRef<FlatList<number>>(null);
  const initialIndex = Math.max(0, data.indexOf(value));
  return (
    <FlatList
      ref={ref}
      data={data}
      style={styles.col}
      keyExtractor={(n) => String(n)}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_H}
      decelerationRate="fast"
      nestedScrollEnabled
      initialScrollIndex={initialIndex}
      getItemLayout={(_, i) => ({ length: ITEM_H, offset: ITEM_H * i, index: i })}
      contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
      onMomentumScrollEnd={(e) => {
        const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
        const next = data[Math.max(0, Math.min(data.length - 1, idx))];
        if (next !== value) {
          tap.selection();
          onChange(next);
        }
      }}
      renderItem={({ item }) => {
        const sel = item === value;
        return (
          <Pressable
            style={styles.cell}
            onPress={() => {
              tap.selection();
              onChange(item);
              ref.current?.scrollToIndex({ index: data.indexOf(item), animated: true });
            }}
          >
            <Text style={[styles.num, sel ? styles.numSel : styles.numIdle]}>{item}</Text>
            {sel && <Text style={styles.unit}>{unit}</Text>}
          </Pressable>
        );
      }}
    />
  );
}

const PRESETS = [1, 15, 30, 45, 60, 90];

type Props = {
  visible: boolean;
  value: number;
  onChange: (minutes: number) => void;
  onClose: () => void;
};

/** Manual duration picker: spinnable hours + minutes columns with presets. */
export function DurationWheelModal({ visible, value, onChange, onClose }: Props) {
  const tr = useT();
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  const hourData = useMemo(() => Array.from({ length: 13 }, (_, i) => i), []);
  const minData = useMemo(() => Array.from({ length: 12 }, (_, i) => i * 5), []);

  const setH = (h: number) => onChange(h * 60 + mins);
  const setM = (m: number) => onChange(hours * 60 + m);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: motion.base }}
          style={styles.sheet}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.title}>{tr('form.howLong')}</Text>

          <View style={styles.wheels}>
            <View style={styles.band} pointerEvents="none" />
            <Col data={hourData} value={hours} unit="h" onChange={setH} />
            <Col data={minData} value={mins} unit="m" onChange={setM} />
          </View>

          <Text style={styles.presetLabel}>{tr('form.presets')}</Text>
          <View style={styles.presets}>
            {PRESETS.map((p) => {
              const sel = p === value;
              return (
                <Pressable
                  key={p}
                  style={[styles.chip, sel && styles.chipSel]}
                  onPress={() => {
                    tap.light();
                    onChange(p);
                  }}
                >
                  <Text style={[styles.chipText, sel && styles.chipTextSel]}>
                    {p < 60 ? `${p}m` : p % 60 === 0 ? `${p / 60}h` : `${Math.floor(p / 60)}h ${p % 60}m`}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.done} onPress={onClose}>
            <Text style={styles.doneText}>{tr('common.ok')}</Text>
          </Pressable>
        </MotiView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing(5),
    paddingBottom: spacing(8),
  },
  title: { color: colors.textTertiary, fontSize: 13, fontWeight: font.semibold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing(3) },

  wheels: { flexDirection: 'row', height: ITEM_H * 5, justifyContent: 'center' },
  band: {
    position: 'absolute',
    left: spacing(8),
    right: spacing(8),
    height: ITEM_H,
    top: ITEM_H * 2,
    backgroundColor: colors.surfacePressed,
    borderRadius: radius.md,
  },
  col: { width: 120 },
  cell: { height: ITEM_H, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing(2) },
  num: { fontSize: 24, fontWeight: font.bold },
  numSel: { color: colors.textPrimary },
  numIdle: { color: colors.textTertiary },
  unit: { color: colors.textSecondary, fontSize: 14, fontWeight: font.semibold },

  presetLabel: { color: colors.textSecondary, fontSize: 14, fontWeight: font.bold, marginTop: spacing(5), marginBottom: spacing(3) },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing(2.5),
    paddingHorizontal: spacing(4),
  },
  chipSel: { backgroundColor: palette.coral },
  chipText: { color: colors.textPrimary, fontSize: 14, fontWeight: font.semibold },
  chipTextSel: { color: colors.bg, fontWeight: font.bold },

  done: {
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: palette.coral,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing(6),
  },
  doneText: { color: colors.bg, fontSize: 16, fontWeight: font.bold },
});
