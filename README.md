# Timeline — a daily time-planner

A native iOS/Android day-planner built with **Expo + React Native**, inspired by
apps like *Structured*. Plan your day on a vertical timeline of colored task
capsules, with all-day events, an inbox, plain-English quick-add, and smooth
60 fps animations.

No account, no sign-up — everything is stored locally on the device.

## Features

- **Timeline** — vertical day view with colored capsule nodes, time gutter,
  duration-scaled cards, subtask checklists, repeat/reminder badges and idle-gap
  hints ("Interval over. What's next?").
- **Week strip** — swipeable Mon–Sun calendar with per-day task dots.
- **All-day chips** — Period (with animated progress ring), birthdays, calls…
- **Inbox** — capture tasks without a time, schedule them onto a day later.
- **AI quick-add** — type "Gym at 18:00 for 1h" and it parses time, duration,
  emoji and color, then drops it on the timeline (fully on-device, no API).
- **Onboarding** — animated intro, wake-time wheel picker, notifications prompt.
- **Settings** — wake time, notifications, haptics, replay onboarding, clear data.
- Haptic feedback and spring animations throughout.

## Tech

| Concern        | Choice                                  |
| -------------- | --------------------------------------- |
| Framework      | Expo SDK 56, React Native 0.85, React 19 |
| Navigation     | expo-router (file-based)                |
| State          | Zustand + AsyncStorage (persisted)      |
| Animation      | Reanimated 4 + Moti                     |
| Icons / SVG    | @expo/vector-icons, react-native-svg    |
| Dates          | date-fns                                |

## Run it

```bash
npm install
npx expo start
```

Then scan the QR code with **Expo Go** (iOS/Android), or press `a` / `i` for an
emulator. First launch starts in onboarding; finish it to land on a seeded demo
day.

## Project layout

```
app/                    # expo-router routes
  _layout.tsx           # providers, hydration gate, stack + modals
  index.tsx             # entry gate -> onboarding or tabs
  onboarding.tsx        # 3-step onboarding
  (tabs)/               # Inbox · Timeline · AI · Settings
  task/new.tsx          # create modal
  task/[id].tsx         # edit modal
src/
  components/           # DateStrip, TimelineItem, Checkbox, Ring, TaskForm…
  store/useStore.ts     # zustand store + selectors
  theme/theme.ts        # colors, palette, spacing, type
  utils/                # time, nlp (quick-add parser), haptics, seed
```
