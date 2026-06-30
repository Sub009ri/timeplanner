import { enUS, ru as ruLocale } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { useStore, Language } from '../store/useStore';

type Dict = Record<string, string>;

const en: Dict = {
  // tabs
  'tab.inbox': 'Inbox',
  'tab.timeline': 'Timeline',
  'tab.ai': 'AI',
  'tab.settings': 'Settings',

  // common
  'common.cancel': 'Cancel',
  'common.ok': 'OK',
  'common.today': 'Today',

  // timeline
  'timeline.empty.title': 'Nothing planned yet',
  'timeline.empty.sub': 'Tap the + button to add your first task to this day.',
  'timeline.intervalOver': "Interval over. What's next?",
  'timeline.freeTime': "Free time — {dur}. What's next?",

  // inbox
  'inbox.title': 'Inbox',
  'inbox.empty.title': 'Inbox zero',
  'inbox.empty.sub':
    "Capture tasks here without a time, then schedule them onto a day when you're ready.",

  // ai
  'ai.title': 'AI ',
  'ai.accent': 'Coach',
  'ai.subtitle': "A few questions and I'll suggest a daily routine.",
  'ai.placeholder': 'Type a message…',
  'ai.added': 'Added “{title}” at {time} · {dur}',
  'ai.reset': 'Start over',
  'ai.add': 'Add',
  'ai.addAll': 'Add all to my day',
  'ai.coach.added': 'Added “{title}” to your timeline.',

  // coach interview
  'ai.coach.intro':
    "Hi! I'm your planning coach 👋 Answer a few quick questions and I'll build a daily routine for you.",
  'ai.q.name': 'First — what should I call you?',
  'ai.q.role': 'Nice to meet you, {name}! What best describes you right now?',
  'ai.q.goals': 'What do you want to learn or get better at? (e.g. English, coding, fitness)',
  'ai.q.focus': 'How much focused time can you give it each day?',
  'ai.q.bedtime': 'And when do you usually go to bed?',
  'ai.role.student': 'Student',
  'ai.role.working': 'Working',
  'ai.role.freelance': 'Freelance',
  'ai.role.other': 'Other',
  'ai.focus.30': '30 min',
  'ai.focus.60': '1 hour',
  'ai.focus.120': '2 hours',
  'ai.focus.180': '3 hours',
  'ai.bed.22': '22:00',
  'ai.bed.23': '23:00',
  'ai.bed.0': '00:00',
  'ai.bed.1': '01:00',
  'ai.done':
    "Perfect, {name} — here's a routine I'd suggest. Tap a card to add it to your timeline:",

  // recommendations
  'ai.rec.morning.title': 'Morning routine',
  'ai.rec.morning.reason': 'Start the day calmly, right after you wake at {time}.',
  'ai.rec.study.reason': 'A daily {dur} focus block at {time} — small, steady progress.',
  'ai.rec.move.title': 'Move & recharge',
  'ai.rec.move.reason': 'A short afternoon walk to reset your energy.',
  'ai.rec.winddown.title': 'Wind down',
  'ai.rec.winddown.reason': 'Screens off and relax before bed at {time}.',
  'ai.rec.sleep.reason': "You go to bed quite late ({time}) — try winding down earlier to sleep better.",

  // settings
  'settings.title': 'Settings',
  'settings.prefs': 'Preferences',
  'settings.wake': 'Wake up',
  'settings.notifications': 'Notifications',
  'settings.haptics': 'Haptic feedback',
  'settings.data': 'Data',
  'settings.totalTasks': 'Total tasks',
  'settings.replay': 'Replay onboarding',
  'settings.clear': 'Clear all data',
  'settings.clear.title': 'Clear all data?',
  'settings.clear.msg': 'This removes every task on this device. It cannot be undone.',
  'settings.clear.confirm': 'Clear',
  'settings.footer': 'Timeline · Local-first · No account needed',
  'settings.general': 'General',
  'settings.appearance': 'Appearance',
  'settings.language': 'Language',
  'settings.weekStart': 'First day of week',
  'settings.language.en': 'English',
  'settings.language.ru': 'Русский',

  // onboarding
  'ob.intro.title.a': 'Timeline is your ',
  'ob.intro.title.b': 'daily planner',
  'ob.intro.sub':
    'Give every day a clear structure. Setup takes a minute — and no account is required.',
  'ob.getStarted': 'Get started',
  'ob.wake.title.a': 'When do you usually ',
  'ob.wake.title.b': 'wake up?',
  'ob.wake.sub': 'Scroll to pick a time. You can change it anytime.',
  'ob.continue': 'Continue',
  'ob.notif.title.a': 'Never miss a ',
  'ob.notif.title.b': 'task',
  'ob.notif.sub':
    'Want timely reminders before your tasks? You can tune this later in Settings — no spam, promise.',
  'ob.allow': 'Allow notifications',
  'ob.skip': 'Skip for now',

  // task form
  'form.new': 'New ',
  'form.new.accent': 'task',
  'form.edit': 'Edit ',
  'form.edit.accent': 'task',
  'form.name': 'Task name',
  'form.when': 'When?',
  'form.howLong': 'How long?',
  'form.color': 'What color?',
  'form.howOften': 'How often?',
  'form.details': 'Details…',
  'form.presets': 'Presets',
  'form.every': 'Every',
  'form.unit.day': 'days',
  'form.unit.week': 'weeks',
  'form.unit.month': 'months',
  'form.repeat.once': 'Once',
  'form.repeat.daily': 'Daily',
  'form.repeat.weekly': 'Weekly',
  'form.repeat.monthly': 'Monthly',
  'form.repeat.custom': 'Custom',
  'form.alerts': 'Alerts',
  'form.alert.start': 'At start',
  'form.alert.15': '15m before',
  'form.alert.60': '1h before',
  'form.allDay': 'All-day event',
  'form.checklist': 'Checklist',
  'form.addStep': 'Add a step…',
  'form.notes': 'Notes',
  'form.notes.placeholder': 'Add notes, links…',
  'form.submit.add': 'Add task',
  'form.submit.inbox': 'Add to Inbox',
  'form.submit.save': 'Save changes',
  'form.delete': 'Delete task',
  'form.notFound': 'Task not found',

  // calendar
  'cal.title': 'Select date',

  // units
  'unit.min': 'min',
  'unit.hr': 'hr',
};

const ru: Dict = {
  'tab.inbox': 'Входящие',
  'tab.timeline': 'Таймлайн',
  'tab.ai': 'ИИ',
  'tab.settings': 'Настройки',

  'common.cancel': 'Отмена',
  'common.ok': 'ОК',
  'common.today': 'Сегодня',

  'timeline.empty.title': 'Пока ничего не запланировано',
  'timeline.empty.sub': 'Нажмите +, чтобы добавить первую задачу на этот день.',
  'timeline.intervalOver': 'Интервал окончен. Что дальше?',
  'timeline.freeTime': 'Свободно — {dur}. Что дальше?',

  'inbox.title': 'Входящие',
  'inbox.empty.title': 'Входящие пусты',
  'inbox.empty.sub':
    'Записывайте задачи без времени, а потом ставьте их в нужный день.',

  'ai.title': 'ИИ-',
  'ai.accent': 'коуч',
  'ai.subtitle': 'Пара вопросов — и я предложу распорядок дня.',
  'ai.placeholder': 'Введите сообщение…',
  'ai.added': 'Добавлено «{title}» в {time} · {dur}',
  'ai.reset': 'Начать заново',
  'ai.add': 'Добавить',
  'ai.addAll': 'Добавить всё в день',
  'ai.coach.added': 'Задача «{title}» добавлена в таймлайн.',

  // coach interview
  'ai.coach.intro':
    'Привет! Я ваш коуч по планированию 👋 Ответьте на пару вопросов — и я составлю распорядок дня.',
  'ai.q.name': 'Для начала — как вас зовут?',
  'ai.q.role': 'Приятно познакомиться, {name}! Что вам ближе сейчас?',
  'ai.q.goals': 'Чему хотите научиться или что подтянуть? (напр. английский, код, спорт)',
  'ai.q.focus': 'Сколько времени в день можете на это выделить?',
  'ai.q.bedtime': 'А во сколько вы обычно ложитесь спать?',
  'ai.role.student': 'Учусь',
  'ai.role.working': 'Работаю',
  'ai.role.freelance': 'Фриланс',
  'ai.role.other': 'Другое',
  'ai.focus.30': '30 мин',
  'ai.focus.60': '1 час',
  'ai.focus.120': '2 часа',
  'ai.focus.180': '3 часа',
  'ai.bed.22': '22:00',
  'ai.bed.23': '23:00',
  'ai.bed.0': '00:00',
  'ai.bed.1': '01:00',
  'ai.done':
    'Отлично, {name} — вот распорядок, который я советую. Нажмите на карточку, чтобы добавить её в таймлайн:',

  // recommendations
  'ai.rec.morning.title': 'Утренний ритуал',
  'ai.rec.morning.reason': 'Начните день спокойно, сразу после пробуждения в {time}.',
  'ai.rec.study.reason': 'Ежедневный блок фокуса {dur} в {time} — небольшой, но стабильный прогресс.',
  'ai.rec.move.title': 'Разминка и перезагрузка',
  'ai.rec.move.reason': 'Короткая прогулка днём, чтобы восстановить силы.',
  'ai.rec.winddown.title': 'Подготовка ко сну',
  'ai.rec.winddown.reason': 'Отложите экраны и расслабьтесь перед сном в {time}.',
  'ai.rec.sleep.reason': 'Вы ложитесь довольно поздно ({time}) — попробуйте успокаиваться раньше, чтобы лучше высыпаться.',

  'settings.title': 'Настройки',
  'settings.prefs': 'Предпочтения',
  'settings.wake': 'Пробуждение',
  'settings.notifications': 'Уведомления',
  'settings.haptics': 'Тактильный отклик',
  'settings.data': 'Данные',
  'settings.totalTasks': 'Всего задач',
  'settings.replay': 'Повторить онбординг',
  'settings.clear': 'Очистить все данные',
  'settings.clear.title': 'Очистить все данные?',
  'settings.clear.msg': 'Это удалит все задачи на устройстве. Действие необратимо.',
  'settings.clear.confirm': 'Очистить',
  'settings.footer': 'Timeline · Локально · Без аккаунта',
  'settings.general': 'Общие',
  'settings.appearance': 'Внешний вид',
  'settings.language': 'Язык',
  'settings.weekStart': 'Первый день недели',
  'settings.language.en': 'English',
  'settings.language.ru': 'Русский',

  'ob.intro.title.a': 'Timeline — ваш ',
  'ob.intro.title.b': 'ежедневник',
  'ob.intro.sub':
    'Дайте каждому дню чёткую структуру. Настройка займёт минуту — аккаунт не нужен.',
  'ob.getStarted': 'Приступить',
  'ob.wake.title.a': 'Во сколько вы обычно ',
  'ob.wake.title.b': 'просыпаетесь?',
  'ob.wake.sub': 'Прокрутите, чтобы выбрать время. Его можно изменить в любой момент.',
  'ob.continue': 'Продолжить',
  'ob.notif.title.a': 'Никогда не пропускайте ',
  'ob.notif.title.b': 'задачи',
  'ob.notif.sub':
    'Хотите получать своевременные напоминания? Это можно настроить позже. Никакого спама, обещаем.',
  'ob.allow': 'Разрешить уведомления',
  'ob.skip': 'Пока пропустить',

  'form.new': 'Новая ',
  'form.new.accent': 'задача',
  'form.edit': 'Изменить ',
  'form.edit.accent': 'задачу',
  'form.name': 'Название задачи',
  'form.when': 'Когда?',
  'form.howLong': 'Как долго?',
  'form.color': 'Какой цвет?',
  'form.howOften': 'Как часто?',
  'form.details': 'Подробнее…',
  'form.presets': 'Типовые',
  'form.every': 'Каждые',
  'form.unit.day': 'дн.',
  'form.unit.week': 'нед.',
  'form.unit.month': 'мес.',
  'form.repeat.once': 'Один раз',
  'form.repeat.daily': 'Ежедневно',
  'form.repeat.weekly': 'Еженедельно',
  'form.repeat.monthly': 'Ежемесячно',
  'form.repeat.custom': 'Свой',
  'form.alerts': 'Оповещения',
  'form.alert.start': 'В начале',
  'form.alert.15': 'За 15м',
  'form.alert.60': 'За 1ч',
  'form.allDay': 'Событие на весь день',
  'form.checklist': 'Подзадачи',
  'form.addStep': 'Добавить шаг…',
  'form.notes': 'Заметки',
  'form.notes.placeholder': 'Добавьте заметки, ссылки…',
  'form.submit.add': 'Добавить задачу',
  'form.submit.inbox': 'Добавить во Входящие',
  'form.submit.save': 'Сохранить',
  'form.delete': 'Удалить задачу',
  'form.notFound': 'Задача не найдена',

  'cal.title': 'Выберите дату',

  'unit.min': 'мин',
  'unit.hr': 'ч',
};

const dicts: Record<Language, Dict> = { en, ru };

export type TFunc = (key: string, vars?: Record<string, string | number>) => string;

function translate(lang: Language, key: string, vars?: Record<string, string | number>) {
  let s = dicts[lang][key] ?? en[key] ?? key;
  if (vars) {
    for (const k of Object.keys(vars)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(vars[k]));
    }
  }
  return s;
}

/** Reactive translator hook — re-renders when the language changes. */
export function useT(): TFunc {
  const lang = useStore((s) => s.settings.language);
  return (key, vars) => translate(lang, key, vars);
}

export function useLang(): Language {
  return useStore((s) => s.settings.language);
}

/** Non-reactive access for plain utility functions. */
export function getLang(): Language {
  return useStore.getState().settings.language;
}

export function dfLocale(lang: Language): Locale {
  return lang === 'ru' ? ruLocale : enUS;
}

export function useDfLocale(): Locale {
  return dfLocale(useLang());
}
