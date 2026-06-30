import { Profile, FormValue } from '../types';
import { ColorKey } from '../theme/theme';
import { fmtTime, fmtDuration } from '../utils/time';
import type { TFunc } from '../i18n';

// ── interview ────────────────────────────────────────────────
export type Question = {
  field: keyof Profile;
  promptKey: string;
  kind: 'text' | 'chips';
  options?: { labelKey: string; value: string | number }[];
};

export const QUESTIONS: Question[] = [
  { field: 'name', promptKey: 'ai.q.name', kind: 'text' },
  {
    field: 'role',
    promptKey: 'ai.q.role',
    kind: 'chips',
    options: [
      { labelKey: 'ai.role.student', value: 'student' },
      { labelKey: 'ai.role.working', value: 'working' },
      { labelKey: 'ai.role.freelance', value: 'freelance' },
      { labelKey: 'ai.role.other', value: 'other' },
    ],
  },
  { field: 'goals', promptKey: 'ai.q.goals', kind: 'text' },
  {
    field: 'focusMinutes',
    promptKey: 'ai.q.focus',
    kind: 'chips',
    options: [
      { labelKey: 'ai.focus.30', value: 30 },
      { labelKey: 'ai.focus.60', value: 60 },
      { labelKey: 'ai.focus.120', value: 120 },
      { labelKey: 'ai.focus.180', value: 180 },
    ],
  },
  {
    field: 'bedtimeMinutes',
    promptKey: 'ai.q.bedtime',
    kind: 'chips',
    options: [
      { labelKey: 'ai.bed.22', value: 22 * 60 },
      { labelKey: 'ai.bed.23', value: 23 * 60 },
      { labelKey: 'ai.bed.0', value: 24 * 60 },
      { labelKey: 'ai.bed.1', value: 25 * 60 },
    ],
  },
];

/** Resolve the assistant prompt for a step, interpolating known profile data. */
export function promptFor(step: number, profile: Profile, t: TFunc): string {
  const q = QUESTIONS[step];
  if (!q) return '';
  return t(q.promptKey, { name: profile.name || '' }).trim();
}

export const emptyProfile: Profile = {
  name: '',
  role: '',
  goals: '',
  focusMinutes: 0,
  bedtimeMinutes: -1,
};

// ── recommendations ──────────────────────────────────────────
export type Suggestion = {
  key: string;
  reason: string;
  draft: FormValue;
};

function draft(
  partial: Partial<FormValue> & {
    title: string;
    emoji: string;
    color: ColorKey;
    startMinutes: number;
    durationMinutes: number;
  }
): FormValue {
  return {
    repeat: 'daily',
    repeatEvery: 1,
    repeatUnit: 'day',
    alerts: [],
    allDay: false,
    inbox: false,
    subtasks: [],
    notes: '',
    date: '', // filled in by the screen at add time
    ...partial,
  };
}

function capitalize(s: string): string {
  const t = s.trim();
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}

type RecArgs = { profile: Profile; wakeMinutes: number; t: TFunc; lang: string };

/** Build a small personalized routine from the collected profile. */
export function recommend({ profile, wakeMinutes, t, lang }: RecArgs): Suggestion[] {
  const out: Suggestion[] = [];

  // Morning routine right after waking
  out.push({
    key: 'morning',
    reason: t('ai.rec.morning.reason', { time: fmtTime(wakeMinutes) }),
    draft: draft({
      title: t('ai.rec.morning.title'),
      emoji: '☀️',
      color: 'coral',
      startMinutes: wakeMinutes,
      durationMinutes: 30,
    }),
  });

  // A daily learning / focus block for their goal
  if (profile.goals.trim()) {
    const dur = profile.focusMinutes || 60;
    const start = Math.min(wakeMinutes + 60, 21 * 60);
    out.push({
      key: 'study',
      reason: t('ai.rec.study.reason', { dur: fmtDuration(dur, lang), time: fmtTime(start) }),
      draft: draft({
        title: capitalize(profile.goals),
        emoji: '📚',
        color: 'blue',
        startMinutes: start,
        durationMinutes: dur,
        alerts: [15],
      }),
    });
  }

  // A short movement break in the afternoon
  out.push({
    key: 'move',
    reason: t('ai.rec.move.reason'),
    draft: draft({
      title: t('ai.rec.move.title'),
      emoji: '🚶',
      color: 'green',
      startMinutes: 15 * 60,
      durationMinutes: 20,
    }),
  });

  // Wind-down before bed — emphasised if they go to bed late
  if (profile.bedtimeMinutes >= 0) {
    const bedtime = profile.bedtimeMinutes;
    const start = ((bedtime - 30) % (24 * 60) + 24 * 60) % (24 * 60);
    const late = bedtime >= 24 * 60; // midnight or later
    out.push({
      key: 'winddown',
      reason: late
        ? t('ai.rec.sleep.reason', { time: fmtTime(bedtime % (24 * 60)) })
        : t('ai.rec.winddown.reason', { time: fmtTime(bedtime % (24 * 60)) }),
      draft: draft({
        title: t('ai.rec.winddown.title'),
        emoji: '🌙',
        color: 'indigo',
        startMinutes: start,
        durationMinutes: 30,
        alerts: [0],
      }),
    });
  }

  return out;
}
