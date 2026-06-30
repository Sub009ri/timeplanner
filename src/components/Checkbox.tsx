import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, palette, ColorKey, motion } from '../theme/theme';
import { tap } from '../utils/haptics';

type Props = {
  checked: boolean;
  color: ColorKey;
  onToggle: () => void;
  size?: number;
};

/**
 * Circular checkbox that fills + pops when completed. The whole hit area is
 * generous (padding) so it stays easy to tap on the timeline.
 */
export function Checkbox({ checked, color, onToggle, size = 26 }: Props) {
  const c = palette[color];
  const progress = useSharedValue(checked ? 1 : 0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: motion.fast });
  }, [checked]);

  const fillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.6 + progress.value * 0.4 }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handle = () => {
    tap.success();
    scale.value = withSequence(
      withTiming(0.88, { duration: 70 }),
      withSpring(1, motion.springPress)
    );
    onToggle();
  };

  return (
    <Pressable hitSlop={12} onPress={handle}>
      <Animated.View
        style={[
          styles.ring,
          { width: size, height: size, borderRadius: size / 2, borderColor: c },
          wrapStyle,
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: size / 2, backgroundColor: c },
            fillStyle,
          ]}
        />
        <Animated.View style={checkStyle}>
          <Ionicons name="checkmark" size={size * 0.62} color={colors.bg} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
