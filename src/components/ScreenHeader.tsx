import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, font, spacing } from '../theme/theme';

export function ScreenHeader({ title, accent, subtitle }: { title: string; accent?: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>
        {title}
        {accent ? <Text style={styles.accent}>{accent}</Text> : null}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing(5), paddingTop: spacing(2), paddingBottom: spacing(4) },
  title: { color: colors.textPrimary, fontSize: 30, fontWeight: font.black },
  accent: { color: colors.accent },
  subtitle: { color: colors.textSecondary, fontSize: 15, marginTop: spacing(1.5) },
});
