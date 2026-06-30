import { differenceInCalendarDays, differenceInCalendarMonths, getDate } from 'date-fns';
import { Task, RepeatUnit } from '../types';
import { keyToDate } from './time';

function resolve(task: Task): { unit: RepeatUnit; every: number } {
  switch (task.repeat) {
    case 'daily':
      return { unit: 'day', every: 1 };
    case 'weekly':
      return { unit: 'week', every: 1 };
    case 'monthly':
      return { unit: 'month', every: 1 };
    case 'custom':
      return { unit: task.repeatUnit, every: Math.max(1, task.repeatEvery || 1) };
    default:
      return { unit: 'day', every: 1 };
  }
}

/** Does this task (or one of its recurrences) land on the given day? */
export function occursOn(task: Task, dateKey: string): boolean {
  if (task.inbox) return false;
  if (task.repeat === 'once') return dateKey === task.date;

  const anchor = keyToDate(task.date);
  const day = keyToDate(dateKey);
  const diffDays = differenceInCalendarDays(day, anchor);
  if (diffDays < 0) return false; // series only runs forward from its anchor

  const { unit, every } = resolve(task);
  if (unit === 'day') return diffDays % every === 0;
  if (unit === 'week') return diffDays % (7 * every) === 0;
  // monthly: same day-of-month, every N months
  if (getDate(day) !== getDate(anchor)) return false;
  const months = differenceInCalendarMonths(day, anchor);
  return months >= 0 && months % every === 0;
}

export function isDoneOn(task: Task, dateKey: string): boolean {
  return task.completedDates.includes(dateKey);
}
