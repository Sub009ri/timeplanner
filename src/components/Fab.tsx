import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, palette, motion } from '../theme/theme';
import { tap } from '../utils/haptics';

export function Fab({ onPress, style }: { onPress: () => void; style?: ViewStyle }) {
  const scale = useSharedValue(1);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.wrap, style, aStyle]}>
      <Pressable
        style={styles.btn}
        onPressIn={() => {
          scale.value = withSpring(0.92, motion.springPress);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, motion.springPress);
        }}
        onPress={() => {
          tap.light();
          onPress();
        }}
      >
        <Ionicons name="add" size={32} color={colors.bg} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    shadowColor: palette.coral,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  btn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
