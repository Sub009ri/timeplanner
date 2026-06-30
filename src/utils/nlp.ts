import { ColorKey } from '../theme/theme';

export type ParsedTask = {
  title: string;
  startMinutes: number | null;
  durationMinutes: number;
  emoji: string;
  color: ColorKey;
};

const KEYWORDS: { match: RegExp; emoji: string; color: ColorKey }[] = [
  { match: /\b(gym|run|workout|exercise|walk|yoga|training)\b/i, emoji: '🏃', color: 'green' },
  { match: /\b(coffee|breakfast|lunch|dinner|eat|meal|food)\b/i, emoji: '☕', color: 'orange' },
  { match: /\b(work|deep work|focus|code|coding|study|read)\b/i, emoji: '💻', color: 'blue' },
  { match: /\b(call|meeting|meet|sync|standup|interview)\b/i, emoji: '📞', color: 'teal' },
  { match: /\b(sleep|nap|rest|bed)\b/i, emoji: '🌙', color: 'indigo' },
  { match: /\b(wake|morning)\b/i, emoji: '☀️', color: 'coral' },
  { match: /\b(shop|groceries|buy|errand)\b/i, emoji: '🛒', color: 'yellow' },
  { match: /\b(clean|laundry|chores|tidy)\b/i, emoji: '🧹', color: 'teal' },
];

/** "Gym at 18:00 for 1h" -> structured task. Time/duration are optional. */
export function parseTask(input: string): ParsedTask {
  let text = input.trim();
  let startMinutes: number | null = null;
  let durationMinutes = 30;

  // duration: "for 1h", "1h30", "45m", "90 min"
  const dur = text.match(/\b(?:for\s+)?(\d+)\s*(h|hr|hour|hours)\s*(\d+)?\s*(m|min)?/i);
  const durMin = text.match(/\b(?:for\s+)?(\d+)\s*(m|min|minutes)\b/i);
  if (dur) {
    durationMinutes = parseInt(dur[1], 10) * 60 + (dur[3] ? parseInt(dur[3], 10) : 0);
    text = text.replace(dur[0], '');
  } else if (durMin) {
    durationMinutes = parseInt(durMin[1], 10);
    text = text.replace(durMin[0], '');
  }

  // time: "at 8", "8:30", "6pm", "18:00"
  const time = text.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (time) {
    let h = parseInt(time[1], 10);
    const m = time[2] ? parseInt(time[2], 10) : 0;
    const mer = time[3]?.toLowerCase();
    if (mer === 'pm' && h < 12) h += 12;
    if (mer === 'am' && h === 12) h = 0;
    if (h >= 0 && h < 24 && m < 60) {
      startMinutes = h * 60 + m;
      text = text.replace(time[0], '');
    }
  }

  // tidy the leftover title
  text = text
    .replace(/\b(at|for|from|to)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const title = text.length ? text[0].toUpperCase() + text.slice(1) : 'New task';

  let emoji = '✨';
  let color: ColorKey = 'coral';
  for (const k of KEYWORDS) {
    if (k.match.test(input)) {
      emoji = k.emoji;
      color = k.color;
      break;
    }
  }

  return { title, startMinutes, durationMinutes, emoji, color };
}
