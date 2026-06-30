import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, palette, radius, spacing, tint, motion } from '../../src/theme/theme';
import { TypingDots } from '../../src/components/TypingDots';
import { useStore } from '../../src/store/useStore';
import { parseTask } from '../../src/utils/nlp';
import { fmtTime, fmtDuration, fmtRange } from '../../src/utils/time';
import { tap } from '../../src/utils/haptics';
import { useT, useLang, TFunc } from '../../src/i18n';
import { QUESTIONS, promptFor, recommend, Suggestion } from '../../src/ai/coach';
import { Profile } from '../../src/types';

export default function AIScreen() {
  const tr = useT();
  const lang = useLang();
  const scrollRef = useRef<ScrollView>(null);

  const messages = useStore((s) => s.aiMessages);
  const step = useStore((s) => s.aiStep);
  const profile = useStore((s) => s.profile);
  const wake = useStore((s) => s.settings.wakeMinutes);
  const selectedDate = useStore((s) => s.selectedDate);
  const aiPush = useStore((s) => s.aiPush);
  const aiSetStep = useStore((s) => s.aiSetStep);
  const aiSetProfile = useStore((s) => s.aiSetProfile);
  const aiReset = useStore((s) => s.aiReset);
  const addTask = useStore((s) => s.addTask);

  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const started = useRef(false);

  const done = step >= QUESTIONS.length;
  const current = !done ? QUESTIONS[step] : null;

  // Kick off the interview on first ever visit (guard against double-invoke).
  useEffect(() => {
    if (messages.length === 0 && !started.current) {
      started.current = true;
      startInterview();
    }
  }, []);

  const startInterview = () => {
    aiPush({ role: 'assistant', text: tr('ai.coach.intro') });
    setTimeout(() => {
      aiPush({ role: 'assistant', text: promptFor(0, { ...profile, name: '' } as Profile, tr) });
    }, 500);
  };

  const askNext = (nextStep: number, np: Profile) => {
    setTyping(true);
    setTimeout(() => {
      if (nextStep < QUESTIONS.length) {
        aiPush({ role: 'assistant', text: promptFor(nextStep, np, tr) });
      } else {
        aiPush({ role: 'assistant', text: tr('ai.done', { name: np.name }) });
      }
      setTyping(false);
    }, 650);
  };

  const answer = (displayText: string, value: string | number) => {
    if (!current) return;
    aiPush({ role: 'user', text: displayText });
    const np = { ...profile, [current.field]: value } as Profile;
    aiSetProfile({ [current.field]: value } as Partial<Profile>);
    const next = step + 1;
    aiSetStep(next);
    askNext(next, np);
  };

  const onSend = () => {
    const value = text.trim();
    if (!value) return;
    setText('');
    if (current?.kind === 'text') {
      answer(value, value);
      return;
    }
    if (done) {
      // free chat → quick-add a task
      aiPush({ role: 'user', text: value });
      const p = parseTask(value);
      addTask({
        title: p.title,
        emoji: p.emoji,
        color: p.color,
        date: selectedDate,
        startMinutes: p.startMinutes ?? wake,
        durationMinutes: p.durationMinutes,
        repeat: 'once',
        repeatEvery: 1,
        repeatUnit: 'day',
        alerts: [],
        allDay: false,
        inbox: false,
        subtasks: [],
        notes: '',
      });
      tap.success();
      setTyping(true);
      setTimeout(() => {
        aiPush({
          role: 'assistant',
          text: tr('ai.added', {
            title: p.title,
            time: fmtTime(p.startMinutes ?? wake),
            dur: fmtDuration(p.durationMinutes, lang),
          }),
        });
        setTyping(false);
      }, 500);
    }
  };

  const onReset = () => {
    tap.light();
    setAdded({});
    aiReset();
    setTimeout(startInterview, 60);
  };

  const addSuggestion = (s: Suggestion) => {
    if (added[s.key]) return;
    tap.success();
    addTask({ ...s.draft, date: selectedDate });
    setAdded((a) => ({ ...a, [s.key]: true }));
  };

  const suggestions = done ? recommend({ profile, wakeMinutes: wake, t: tr, lang }) : [];

  const showChips = current?.kind === 'chips' && !typing;
  const showInput = !current || current.kind === 'text';

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {tr('ai.title')}
          <Text style={styles.accent}>{tr('ai.accent')}</Text>
        </Text>
        {messages.length > 0 && (
          <Pressable hitSlop={10} style={styles.resetBtn} onPress={onReset}>
            <Ionicons name="refresh" size={16} color={colors.textSecondary} />
            <Text style={styles.resetText}>{tr('ai.reset')}</Text>
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.chat}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((m) => (
            <Bubble key={m.id} role={m.role} text={m.text} />
          ))}
          {typing && <TypingDots />}

          {done && suggestions.length > 0 && (
            <View style={styles.cards}>
              {suggestions.map((s, i) => (
                <SuggestionCard
                  key={s.key}
                  s={s}
                  index={i}
                  added={!!added[s.key]}
                  lang={lang}
                  tr={tr}
                  onAdd={() => addSuggestion(s)}
                />
              ))}
              <Pressable
                style={styles.addAll}
                onPress={() => {
                  tap.medium();
                  suggestions.forEach(addSuggestion);
                }}
              >
                <Ionicons name="checkmark-done" size={18} color={colors.bg} />
                <Text style={styles.addAllText}>{tr('ai.addAll')}</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {showChips && current?.options && (
          <View style={styles.chipsRow}>
            {current.options.map((o) => (
              <Pressable
                key={String(o.value)}
                style={styles.chip}
                onPress={() => {
                  tap.light();
                  answer(tr(o.labelKey), o.value);
                }}
              >
                <Text style={styles.chipText}>{tr(o.labelKey)}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {showInput && (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder={tr('ai.placeholder')}
              placeholderTextColor={colors.textTertiary}
              returnKeyType="send"
              onSubmitEditing={onSend}
            />
            <Pressable
              style={[styles.send, { opacity: text.trim() ? 1 : 0.4 }]}
              onPress={onSend}
            >
              <Ionicons name="arrow-up" size={20} color={colors.bg} />
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Bubble({ role, text }: { role: 'assistant' | 'user'; text: string }) {
  const isUser = role === 'user';
  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: motion.base }}
      style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}
    >
      <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{text}</Text>
    </MotiView>
  );
}

function SuggestionCard({
  s,
  index,
  added,
  lang,
  tr,
  onAdd,
}: {
  s: Suggestion;
  index: number;
  added: boolean;
  lang: string;
  tr: TFunc;
  onAdd: () => void;
}) {
  const c = palette[s.draft.color];
  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: motion.base, delay: motion.stagger(index) }}
    >
      <Pressable style={styles.card} onPress={onAdd} disabled={added}>
        <View style={[styles.cardIcon, { backgroundColor: tint(c, 0.18) }]}>
          <Text style={styles.cardEmoji}>{s.draft.emoji}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {s.draft.title}
          </Text>
          <Text style={styles.cardMeta}>
            {fmtRange(s.draft.startMinutes, s.draft.durationMinutes)} ·{' '}
            {fmtDuration(s.draft.durationMinutes, lang)}
          </Text>
          <Text style={styles.cardReason}>{s.reason}</Text>
        </View>
        <View style={[styles.cardAdd, added && { backgroundColor: palette.green }]}>
          <Ionicons name={added ? 'checkmark' : 'add'} size={20} color={colors.bg} />
        </View>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(5),
    paddingTop: spacing(2),
    paddingBottom: spacing(3),
  },
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: font.black },
  accent: { color: colors.accent },
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5) },
  resetText: { color: colors.textSecondary, fontSize: 14, fontWeight: font.semibold },

  chat: { flex: 1 },
  chatContent: { paddingHorizontal: spacing(5), paddingVertical: spacing(3), gap: spacing(1) },

  bubble: {
    maxWidth: '84%',
    borderRadius: 18,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(4),
    marginBottom: spacing(2),
  },
  bubbleBot: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderBottomLeftRadius: 4 },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: palette.coral, borderBottomRightRadius: 4 },
  bubbleText: { color: colors.textPrimary, fontSize: 15.5, lineHeight: 21 },
  bubbleTextUser: { color: colors.bg, fontWeight: font.medium },

  cards: { marginTop: spacing(2), gap: spacing(3) },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(3),
    gap: spacing(3),
  },
  cardIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 20 },
  cardBody: { flex: 1 },
  cardTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: font.bold },
  cardMeta: { color: colors.textSecondary, fontSize: 13, fontWeight: font.medium, marginTop: 1 },
  cardReason: { color: colors.textTertiary, fontSize: 13, marginTop: spacing(1), lineHeight: 18 },
  cardAdd: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAll: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(2),
    height: 50,
    borderRadius: radius.lg,
    backgroundColor: palette.coral,
    marginTop: spacing(1),
  },
  addAllText: { color: colors.bg, fontSize: 16, fontWeight: font.bold },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(3),
  },
  chip: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.pill,
    paddingVertical: spacing(2.5),
    paddingHorizontal: spacing(4),
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  chipText: { color: colors.textPrimary, fontSize: 15, fontWeight: font.semibold },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.pill,
    paddingHorizontal: spacing(4),
    paddingVertical: Platform.OS === 'ios' ? spacing(3) : spacing(2.5),
  },
  send: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: palette.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
