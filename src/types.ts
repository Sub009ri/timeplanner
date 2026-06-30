import { ColorKey } from './theme/theme';

export type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

export type RepeatMode = 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
export type RepeatUnit = 'day' | 'week' | 'month';

/** Minutes before the task's start an alert fires. 0 = exactly at start. */
export type AlertOffset = number;

export type Task = {
  id: string;
  title: string;
  emoji: string;
  color: ColorKey;
  /** ISO date 'yyyy-MM-dd' — the anchor day the task (or its series) starts. */
  date: string;
  /** Minutes from midnight. Ignored when `allDay` or `inbox`. */
  startMinutes: number;
  durationMinutes: number;
  /** How often the task recurs. */
  repeat: RepeatMode;
  /** For `custom` repeat: every N units. */
  repeatEvery: number;
  /** For `custom` repeat: the unit of the interval. */
  repeatUnit: RepeatUnit;
  /** Reminder offsets in minutes-before-start. Empty = no alerts. */
  alerts: AlertOffset[];
  /** Top "all-day" chips (Period, Call Mum, Birthday…). */
  allDay: boolean;
  /** Unscheduled — lives in the Inbox until dragged onto a day. */
  inbox: boolean;
  subtasks: Subtask[];
  notes: string;
  /** Per-occurrence completion: ISO dates on which this task was completed. */
  completedDates: string[];
  /** 0..1 progress for ring-style all-day chips (e.g. a period tracker). */
  ringProgress?: number;
};

/** Shape the task form edits — completion is managed by the store, not the form. */
export type FormValue = Omit<Task, 'id' | 'completedDates'>;

// ── AI coach ────────────────────────────────────────────────
export type Profile = {
  name: string;
  role: string; // '', 'student', 'working', 'freelance', 'other'
  goals: string; // free text: what they want to learn / improve
  focusMinutes: number; // daily focus budget, 0 = unset
  bedtimeMinutes: number; // minutes from midnight, -1 = unset
};

export type AiMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};
