import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  size: number;
  stroke: number;
  progress: number; // 0..1
  color: string;
  track: string;
  children?: React.ReactNode;
};

/** Animated circular progress ring (used by the all-day "Period" chip). */
export function Ring({ size, stroke, progress, color, track, children }: Props) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const p = useSharedValue(0);

  React.useEffect(() => {
    p.value = withTiming(progress, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - p.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
        />
      </Svg>
      {children}
    </View>
  );
}
