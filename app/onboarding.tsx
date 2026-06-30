import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView, AnimatePresence } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, font, palette, radius, spacing, tint, ColorKey, motion } from '../src/theme/theme';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { TimeWheel } from '../src/components/TimeWheel';
import { useStore } from '../src/store/useStore';
import { todayKey } from '../src/utils/time';
import { tap } from '../src/utils/haptics';
import { useT } from '../src/i18n';

const FLOATERS: { emoji: string; color: ColorKey; x: number; y: number; d: number }[] = [
  { emoji: '🌱', color: 'green', x: 0, y: -120, d: 0 },
  { emoji: '☕', color: 'coral', x: -120, y: -60, d: 120 },
  { emoji: '🚿', color: 'blue', x: 120, y: -50, d: 200 },
  { emoji: '💧', color: 'teal', x: -10, y: -10, d: 90 },
  { emoji: '❤️', color: 'coral', x: -130, y: 40, d: 260 },
  { emoji: '🎂', color: 'yellow', x: 10, y: 90, d: 160 },
  { emoji: '🧘', color: 'blue', x: -110, y: 130, d: 220 },
  { emoji: '🚴', color: 'green', x: 110, y: 120, d: 300 },
];

export default function Onboarding() {
  const router = useRouter();
  const tr = useT();
  const [step, setStep] = useState(0);
  const [wake, setWake] = useState(8 * 60);
  const complete = useStore((s) => s.completeOnboarding);
  const setSelectedDate = useStore((s) => s.setSelectedDate);

  const finish = (notifications: boolean) => {
    setSelectedDate(todayKey());
    complete({ wakeMinutes: wake, notifications });
    tap.success();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* progress dots */}
      <View style={styles.progress}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.pdot, i <= step && styles.pdotActive]} />
        ))}
      </View>

      <AnimatePresence exitBeforeEnter>
        {step === 0 && (
          <MotiView
            key="intro"
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.page}
          >
            <View style={styles.copy}>
              <Text style={styles.h1}>
                {tr('ob.intro.title.a')}
                <Text style={styles.accent}>{tr('ob.intro.title.b')}</Text>
              </Text>
              <Text style={styles.sub}>{tr('ob.intro.sub')}</Text>
            </View>

            <View style={styles.cloud}>
              {FLOATERS.map((f, i) => (
                <MotiView
                  key={i}
                  from={{ opacity: 0, scale: 0.7, translateY: f.y + 14 }}
                  animate={{ opacity: 1, scale: 1, translateY: f.y }}
                  transition={{ type: 'spring', ...motion.springSoft, delay: 120 + f.d * 0.6 }}
                  style={[
                    styles.floater,
                    {
                      backgroundColor: palette[f.color],
                      transform: [{ translateX: f.x }, { translateY: f.y }],
                    },
                  ]}
                >
                  <Text style={styles.floaterEmoji}>{f.emoji}</Text>
                </MotiView>
              ))}
            </View>

            <PrimaryButton label={tr('ob.getStarted')} onPress={() => setStep(1)} style={styles.cta} />
          </MotiView>
        )}

        {step === 1 && (
          <MotiView
            key="wake"
            from={{ opacity: 0, translateX: 16 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -16 }}
            style={styles.page}
          >
            <View style={styles.copy}>
              <Text style={styles.h1}>
                {tr('ob.wake.title.a')}
                <Text style={styles.accent}>{tr('ob.wake.title.b')}</Text>
              </Text>
              <Text style={styles.sub}>{tr('ob.wake.sub')}</Text>
            </View>

            <View style={styles.wheelWrap}>
              <TimeWheel value={wake} onChange={setWake} />
            </View>

            <PrimaryButton label={tr('ob.continue')} onPress={() => setStep(2)} style={styles.cta} />
          </MotiView>
        )}

        {step === 2 && (
          <MotiView
            key="notif"
            from={{ opacity: 0, translateX: 16 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -16 }}
            style={styles.page}
          >
            <View style={styles.copy}>
              <Text style={styles.h1}>
                {tr('ob.notif.title.a')}
                <Text style={styles.accent}>{tr('ob.notif.title.b')}</Text>
              </Text>
              <Text style={styles.sub}>{tr('ob.notif.sub')}</Text>
            </View>

            <MotiView
              from={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', ...motion.springSoft, delay: 120 }}
              style={[styles.bell, { backgroundColor: tint(palette.yellow, 0.16) }]}
            >
              <Ionicons name="notifications" size={56} color={palette.yellow} />
            </MotiView>

            <View style={styles.cta}>
              <PrimaryButton label={tr('ob.allow')} onPress={() => finish(true)} />
              <PrimaryButton label={tr('ob.skip')} variant="ghost" onPress={() => finish(false)} style={{ marginTop: spacing(2) }} />
            </View>
          </MotiView>
        )}
      </AnimatePresence>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: spacing(6) },
  progress: { flexDirection: 'row', gap: spacing(2), paddingTop: spacing(4), justifyContent: 'center' },
  pdot: { width: 28, height: 5, borderRadius: 3, backgroundColor: colors.surfacePressed },
  pdotActive: { backgroundColor: palette.coral },

  page: { flex: 1, justifyContent: 'space-between', paddingVertical: spacing(6) },
  copy: { paddingTop: spacing(6) },
  h1: { color: colors.textPrimary, fontSize: 34, fontWeight: font.black, lineHeight: 40 },
  accent: { color: palette.coral },
  sub: { color: colors.textSecondary, fontSize: 16, lineHeight: 23, marginTop: spacing(4) },

  cloud: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  floater: {
    position: 'absolute',
    width: 56,
    height: 72,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floaterEmoji: { fontSize: 24 },

  wheelWrap: { flex: 1, justifyContent: 'center' },
  bell: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing(8),
  },
  cta: { marginTop: spacing(4) },
});
