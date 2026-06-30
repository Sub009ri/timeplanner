import * as Haptics from 'expo-haptics';
import { useStore } from '../store/useStore';

/** Fire haptics only if the user hasn't disabled them. Never throws. */
export const tap = {
  light() {
    if (!useStore.getState().settings.hapticsEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  medium() {
    if (!useStore.getState().settings.hapticsEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  success() {
    if (!useStore.getState().settings.hapticsEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  selection() {
    if (!useStore.getState().settings.hapticsEnabled) return;
    Haptics.selectionAsync().catch(() => {});
  },
};
