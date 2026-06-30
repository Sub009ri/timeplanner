import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, palette, radius, spacing, motion } from '../theme/theme';
import { tap } from '../utils/haptics';

export type PickerOption<T> = { label: string; value: T };

type Props<T> = {
  visible: boolean;
  title: string;
  options: PickerOption<T>[];
  value: T;
  onSelect: (value: T) => void;
  onClose: () => void;
};

/** Lightweight themed single-choice bottom sheet. */
export function PickerModal<T extends string | number>({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: Props<T>) {
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
          <Text style={styles.title}>{title}</Text>
          {options.map((o) => {
            const sel = o.value === value;
            return (
              <Pressable
                key={String(o.value)}
                style={[styles.row, sel && styles.rowSelected]}
                onPress={() => {
                  tap.selection();
                  onSelect(o.value);
                  onClose();
                }}
              >
                <Text style={[styles.label, sel && styles.labelSelected]}>{o.label}</Text>
                {sel && <Ionicons name="checkmark" size={20} color={palette.coral} />}
              </Pressable>
            );
          })}
        </MotiView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing(5),
    paddingBottom: spacing(10),
  },
  title: { color: colors.textTertiary, fontSize: 13, fontWeight: font.semibold, marginBottom: spacing(3), textTransform: 'uppercase', letterSpacing: 0.5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing(4),
    paddingHorizontal: spacing(4),
    borderRadius: radius.md,
  },
  rowSelected: { backgroundColor: colors.surface },
  label: { color: colors.textPrimary, fontSize: 17, fontWeight: font.medium },
  labelSelected: { fontWeight: font.bold },
});
