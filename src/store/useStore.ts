import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, Subtask, Profile, AiMessage } from '../types';
import { seedTasks } from '../utils/seed';
import { uid } from '../utils/id';
import { occursOn } from '../utils/recurrence';
import { emptyProfile } from '../ai/coach';

export type Language = 'en' | 'ru';

type Settings = {
  wakeMinutes: number; // chosen during onboarding
  notifications: boolean;
  hapticsEnabled: boolean;
  language: Language;
  /** 1 = Monday … 7 = Sunday. */
  weekStartsOn: number;
};

type State = {
  hydrated: boolean;
  onboarded: boolean;
  selectedDate: string; // 'yyyy-MM-dd'
  tasks: Task[];
  settings: Settings;

  // AI coach
  profile: Profile;
  aiMessages: AiMessage[];
  aiStep: number;

  setSelectedDate: (key: string) => void;
  completeOnboarding: (s: Partial<Settings>) => void;
  updateSettings: (s: Partial<Settings>) => void;
  resetOnboarding: () => void;

  aiPush: (m: Omit<AiMessage, 'id'>) => void;
  aiSetStep: (n: number) => void;
  aiSetProfile: (patch: Partial<Profile>) => void;
  aiReset: () => void;

  addTask: (t: Omit<Task, 'id' | 'completedDates'>) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;
  removeTask: (id: string) => void;
  /** Toggle completion of a task's occurrence on a specific day. */
  toggleComplete: (id: string, date: string) => void;
  toggleSubtask: (taskId: string, subId: string) => void;
  scheduleFromInbox: (id: string, date: string, startMinutes: number) => void;

  setHydrated: (v: boolean) => void;
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      hydrated: false,
      onboarded: false,
      selectedDate: '', // set on first render to today
      tasks: [],
      settings: {
        wakeMinutes: 8 * 60,
        notifications: false,
        hapticsEnabled: true,
        language: 'en',
        weekStartsOn: 1,
      },
      profile: emptyProfile,
      aiMessages: [],
      aiStep: 0,

      setHydrated: (v) => set({ hydrated: v }),
      setSelectedDate: (key) => set({ selectedDate: key }),

      completeOnboarding: (s) =>
        set((state) => ({
          onboarded: true,
          settings: { ...state.settings, ...s },
          // Give first-time users a populated demo day.
          tasks: state.tasks.length ? state.tasks : seedTasks(),
        })),

      updateSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),

      resetOnboarding: () => set({ onboarded: false, tasks: [] }),

      aiPush: (m) =>
        set((state) => ({ aiMessages: [...state.aiMessages, { ...m, id: uid() }] })),
      aiSetStep: (n) => set({ aiStep: n }),
      aiSetProfile: (patch) =>
        set((state) => ({ profile: { ...state.profile, ...patch } })),
      aiReset: () => set({ aiMessages: [], aiStep: 0, profile: emptyProfile }),

      addTask: (t) => {
        const id = uid();
        set((state) => ({ tasks: [...state.tasks, { ...t, id, completedDates: [] }] }));
        return id;
      },

      updateTask: (id, patch) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      removeTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      toggleComplete: (id, date) =>
        set((state) => ({
          tasks: state.tasks.map((t) => {
            if (t.id !== id) return t;
            const has = t.completedDates.includes(date);
            return {
              ...t,
              completedDates: has
                ? t.completedDates.filter((d) => d !== date)
                : [...t.completedDates, date],
            };
          }),
        })),

      toggleSubtask: (taskId, subId) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id !== taskId
              ? t
              : {
                  ...t,
                  subtasks: t.subtasks.map((s: Subtask) =>
                    s.id === subId ? { ...s, done: !s.done } : s
                  ),
                }
          ),
        })),

      scheduleFromInbox: (id, date, startMinutes) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, inbox: false, date, startMinutes } : t
          ),
        })),
    }),
    {
      name: 'timeline-store-v1',
      version: 4,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        onboarded: s.onboarded,
        tasks: s.tasks,
        settings: s.settings,
        profile: s.profile,
        aiMessages: s.aiMessages,
        aiStep: s.aiStep,
      }),
      // Migrate older shapes: v1 used `recurring`/`reminder` booleans; v2 used a
      // single `completed` flag. Map both forward to repeat/alerts/completedDates.
      migrate: (persisted: any, version) => {
        if (persisted?.tasks) {
          persisted.tasks = persisted.tasks.map((t: any) => {
            const repeat = t.repeat ?? (t.recurring ? 'daily' : 'once');
            const repeatUnit: any =
              repeat === 'weekly' ? 'week' : repeat === 'monthly' ? 'month' : 'day';
            return {
              ...t,
              repeat,
              repeatEvery: t.repeatEvery ?? 1,
              repeatUnit: t.repeatUnit ?? repeatUnit,
              alerts: t.alerts ?? (t.reminder ? [0] : []),
              notes: t.notes ?? '',
              completedDates:
                t.completedDates ?? (t.completed ? [t.date] : []),
            };
          });
        }
        if (persisted?.settings) {
          persisted.settings.language = persisted.settings.language ?? 'en';
          persisted.settings.weekStartsOn = persisted.settings.weekStartsOn ?? 1;
        }
        // v4: AI coach state
        if (persisted) {
          persisted.profile = persisted.profile ?? emptyProfile;
          persisted.aiMessages = persisted.aiMessages ?? [];
          persisted.aiStep = persisted.aiStep ?? 0;
        }
        return persisted;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

// ── selectors ────────────────────────────────────────────────
export function tasksForDay(tasks: Task[], date: string) {
  const day = tasks.filter((t) => occursOn(t, date));
  return {
    allDay: day.filter((t) => t.allDay).sort((a, b) => a.title.localeCompare(b.title)),
    timeline: day
      .filter((t) => !t.allDay)
      .sort((a, b) => a.startMinutes - b.startMinutes),
  };
}

export function inboxTasks(tasks: Task[]) {
  return tasks.filter((t) => t.inbox);
}

/** Colors of the timeline tasks occurring on a day, for the date-strip dots. */
export function dayDots(tasks: Task[], date: string) {
  return tasks
    .filter((t) => !t.allDay && occursOn(t, date))
    .slice(0, 5)
    .map((t) => t.color);
}
