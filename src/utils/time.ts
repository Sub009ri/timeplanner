import { format, parse, addDays, startOfWeek, isToday as dfIsToday } from 'date-fns';
import type { Locale } from 'date-fns';

export const DAY_KEY = 'yyyy-MM-dd';

const UNITS: Record<string, { min: string; hr: string }> = {
  en: { min: 'min', hr: 'hr' },
  ru: { min: 'мин', hr: 'ч' },
};

export function todayKey(): string {
  return format(new Date(), DAY_KEY);
}

export function keyToDate(key: string): Date {
  return parse(key, DAY_KEY, new Date());
}

export function dateToKey(d: Date): string {
  return format(d, DAY_KEY);
}

export function isTodayKey(key: string): boolean {
  return dfIsToday(keyToDate(key));
}

/** Minutes-from-midnight -> "08:30". */
export function fmtTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Human duration: 30 -> "30 min", 90 -> "1 hr, 30 min". */
export function fmtDuration(minutes: number, lang: string = 'en'): string {
  const u = UNITS[lang] ?? UNITS.en;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} ${u.min}`;
  if (m === 0) return `${h} ${u.hr}`;
  return `${h} ${u.hr}, ${m} ${u.min}`;
}

export function fmtRange(start: number, duration: number): string {
  return `${fmtTime(start)} – ${fmtTime(start + duration)}`;
}

/** Seven date keys for the week containing `key`. */
export function weekKeys(key: string, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1): string[] {
  const base = startOfWeek(keyToDate(key), { weekStartsOn });
  return Array.from({ length: 7 }, (_, i) => dateToKey(addDays(base, i)));
}

export function weekdayShort(key: string, locale?: Locale): string {
  return format(keyToDate(key), 'EEE', { locale });
}

export function dayNumber(key: string): string {
  return format(keyToDate(key), 'd');
}

export function monthYear(key: string, locale?: Locale): { month: string; year: string } {
  const d = keyToDate(key);
  return { month: format(d, 'LLLL', { locale }), year: format(d, 'yyyy') };
}

/** Minutes elapsed since midnight, for the "now" line. */
export function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}
