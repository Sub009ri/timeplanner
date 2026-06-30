import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStore } from '../src/store/useStore';
import { todayKey } from '../src/utils/time';
import { colors } from '../src/theme/theme';

export default function RootLayout() {
  const hydrated = useStore((s) => s.hydrated);
  const selectedDate = useStore((s) => s.selectedDate);
  const setSelectedDate = useStore((s) => s.setSelectedDate);

  // Default the calendar to today once storage has loaded.
  useEffect(() => {
    if (hydrated && !selectedDate) setSelectedDate(todayKey());
  }, [hydrated, selectedDate]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {!hydrated ? (
          <View style={{ flex: 1, backgroundColor: colors.bg }} />
        ) : (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            <Stack.Screen
              name="task/new"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="task/[id]"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
          </Stack>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
