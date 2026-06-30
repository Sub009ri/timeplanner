import { Task } from '../types';
import { todayKey } from './time';
import { uid } from './id';

/** Demo day that mirrors the reference design, on first launch. */
export function seedTasks(): Task[] {
  const date = todayKey();
  const base = {
    date,
    repeat: 'once' as const,
    repeatEvery: 1,
    repeatUnit: 'day' as const,
    alerts: [] as number[],
    allDay: false,
    inbox: false,
    subtasks: [],
    notes: '',
    completedDates: [] as string[],
  };

  return [
    // ── all-day chips ──────────────────────────────────────────
    {
      ...base,
      id: uid(),
      title: 'Period',
      emoji: '❄️',
      color: 'blue',
      startMinutes: 0,
      durationMinutes: 0,
      allDay: true,
      ringProgress: 0.35,
    },
    {
      ...base,
      id: uid(),
      title: 'Call Mum',
      emoji: '📞',
      color: 'green',
      startMinutes: 0,
      durationMinutes: 0,
      allDay: true,
    },
    {
      ...base,
      id: uid(),
      title: "Kevin's Birthday",
      emoji: '🎂',
      color: 'coral',
      startMinutes: 0,
      durationMinutes: 0,
      allDay: true,
    },
    // ── timeline ───────────────────────────────────────────────
    {
      ...base,
      id: uid(),
      title: 'Wake Up',
      emoji: '⏰',
      color: 'coral',
      startMinutes: 8 * 60,
      durationMinutes: 0,
      repeat: 'daily',
    },
    {
      ...base,
      id: uid(),
      title: 'Morning Routine',
      emoji: '☀️',
      color: 'blue',
      startMinutes: 8 * 60,
      durationMinutes: 30,
      repeat: 'daily',
      subtasks: [
        { id: uid(), title: 'Brush teeth', done: false },
        { id: uid(), title: 'Make the bed', done: false },
        { id: uid(), title: 'Stretch', done: false },
      ],
    },
    {
      ...base,
      id: uid(),
      title: 'Walk Huge',
      emoji: '🐾',
      color: 'green',
      startMinutes: 8 * 60 + 30,
      durationMinutes: 30,
      repeat: 'daily',
    },
    {
      ...base,
      id: uid(),
      title: 'Coffee with George',
      emoji: '☕',
      color: 'coral',
      startMinutes: 9 * 60 + 30,
      durationMinutes: 45,
      alerts: [15],
    },
    {
      ...base,
      id: uid(),
      title: 'Deep Work',
      emoji: '💻',
      color: 'blue',
      startMinutes: 10 * 60 + 15,
      durationMinutes: 90,
    },
  ];
}
