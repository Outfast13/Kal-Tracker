import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Switch, View } from 'react-native';
import { useDb } from '../../src/db/provider';
import { today } from '../../src/dates';
import { getJson, setSetting } from '../../src/diary/settings';
import { Btn, Card, Line, Screen, Section, Txt } from '../../src/ui/kit';
import { color } from '../../src/ui/theme';

const DEFAULT_HABITS = ['Hydration', 'Exercise', 'Balanced nutrition', 'Sleep', 'Skincare', 'Grooming'];

export default function GlowUpScreen() {
  const { diary } = useDb();
  const router = useRouter();
  const [habits, setHabits] = useState<string[]>(DEFAULT_HABITS);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useFocusEffect(useCallback(() => {
    (async () => {
      const savedHabits = await getJson<string[]>(diary, 'glow_habits', DEFAULT_HABITS);
      const savedDone = await getJson<Record<string, boolean>>(diary, 'glow_done', {});
      setHabits(savedHabits);
      setDone(savedDone);
    })();
  }, [diary]));

  const persist = async (nextHabits: string[], nextDone: Record<string, boolean>) => {
    setHabits(nextHabits);
    setDone(nextDone);
    await setSetting(diary, 'glow_habits', JSON.stringify(nextHabits));
    await setSetting(diary, 'glow_done', JSON.stringify(nextDone));
  };

  const toggleHabit = async (habit: string) => {
    const nextDone = { ...done, [habit]: !done[habit] };
    await persist(habits, nextDone);
  };

  const addHabit = async () => {
    const label = `Habit ${habits.length + 1}`;
    const nextHabits = [...habits, label];
    await persist(nextHabits, done);
  };

  const completed = Object.values(done).filter(Boolean).length;
  const glowScore = habits.length ? Math.round((completed / habits.length) * 100) : 0;

  return (
    <Screen tab title="Glow Up">
      <Card>
        <Txt v="headline">Daily glow score</Txt>
        <Txt style={{ fontSize: 32, fontWeight: '800' }}>{glowScore}%</Txt>
        <Line label="Completed" value={`${completed} of ${habits.length} habits`} />
        <Line label="Streak" value="9 days" />
      </Card>

      <Section title="Core habits">
        <View style={{ gap: 10 }}>
          {habits.map((habit) => (
            <Card key={habit} style={{ padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Txt>{habit}</Txt>
              <Switch value={!!done[habit]} onValueChange={() => toggleHabit(habit)} trackColor={{ true: color.green, false: color.switchOff }} thumbColor={color.white} />
            </Card>
          ))}
        </View>
      </Section>

      <Section title="Routine">
        <Card style={{ gap: 8 }}>
          <Txt>Morning: cleanse, hydrate, sunscreen</Txt>
          <Txt>Evening: double cleanse, moisturise, floss</Txt>
        </Card>
      </Section>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Btn kind="primary" title="Add habit" icon="glow" onPress={addHabit} />
        <Btn kind="plain" title="Today" onPress={() => router.push('/settings')} />
      </View>
    </Screen>
  );
}
