import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Glass, Icon, type IconName } from '../../src/ui/kit';
import { color } from '../../src/ui/theme';

const ICON: Record<string, IconName> = { index: 'today', food: 'food', fitness: 'fitness', glow: 'glow', progress: 'progress' };

function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <Glass style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 12, height: 64, borderRadius: 32, flexDirection: 'row', padding: 6 }}>
      {state.routes.map((route, i) => {
        const focused = state.index === i, title = descriptors[route.key].options.title ?? route.name;
        const ink = focused ? color.greenDeep : color.textMuted;
        const onPress = () => {
          const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !e.defaultPrevented) navigation.navigate(route.name, route.params);
        };
        return (
          <Pressable key={route.key} onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={title}
            style={{ flex: 1, borderRadius: 26, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: focused ? color.greenTint : 'transparent' }}>
            <Icon name={ICON[route.name]} tint={ink} />
            <Text style={{ fontSize: 11, fontWeight: '600', color: ink }}>{title}</Text>
          </Pressable>
        );
      })}
    </Glass>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={p => <TabBar {...p} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="food" options={{ title: 'Food' }} />
      <Tabs.Screen name="fitness" options={{ title: 'Fitness' }} />
      <Tabs.Screen name="glow" options={{ title: 'Glow Up' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
    </Tabs>
  );
}
