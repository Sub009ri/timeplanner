import React from 'react';
import { Tabs } from 'expo-router';
import { CustomTabBar } from '../../src/components/CustomTabBar';
import { useStore, inboxTasks } from '../../src/store/useStore';
import { useT } from '../../src/i18n';

export default function TabsLayout() {
  const tr = useT();
  const inboxCount = useStore((s) => inboxTasks(s.tasks).length);

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="inbox"
        options={{ title: tr('tab.inbox'), tabBarBadge: inboxCount > 0 ? inboxCount : undefined }}
      />
      <Tabs.Screen name="index" options={{ title: tr('tab.timeline') }} />
      <Tabs.Screen name="ai" options={{ title: tr('tab.ai') }} />
      <Tabs.Screen name="settings" options={{ title: tr('tab.settings') }} />
    </Tabs>
  );
}
