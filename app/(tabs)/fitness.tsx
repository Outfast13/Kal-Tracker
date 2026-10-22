import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useDb } from '../../src/db/provider';
import { today } from '../../src/dates';
import { entriesForDay, type Entry } from '../../src/diary/entries';
import { goals } from '../../src/diary/settings';
import { MAIN, sum, type Nutrients } from '../../src/nutrients';
import { Btn, Card, Line, Ring, Screen, Section, Txt } from '../../src/ui/kit';
import { color } from '../../src/ui/theme';

const ENERGY = '1008';
const formatKcal = (v: number) => `${Math.round(v).toLocaleString()} kcal`;

export default function FoodScreen() {
  const { diary } = useDb();
  const router = useRouter();
  const [targets, setTargets] = useState<Nutrients>({});
  const [entries, setEntries] = useState<Entry[]>([]);
  const [day] = useState(today());

  useFocusEffect(useCallback(() => {
    (async () => {
      setEntries(await entriesForDay(diary, day));
      setTargets(await goals(diary));
    })();
  }, [day, diary]));

  const totals = sum(entries.map(e => e.nutrients));
  const eaten = totals[ENERGY] ?? 0;
  const energyGoal = targets[ENERGY] ?? 0;
  const remaining = Math.max(0, energyGoal - eaten);
  const macroPrimary = MAIN.filter(id => id !== ENERGY).slice(0, 3);

  return (
    <Screen tab title="Food">
      <Card>
        <Txt v="headline">Daily nutrition</Txt>
        <View style={{ alignItems: 'center', paddingVertical: 8 }}>
          <Ring size={128} width={12} frac={energyGoal ? eaten / energyGoal : 0}>
            <Txt v="title" style={{ fontSize: 28, fontVariant: ['tabular-nums'] }}>{Math.round(eaten)}</Txt>
            <Txt v="muted">{energyGoal ? `of ${Math.round(energyGoal)}` : 'kcal'}</Txt>
          </Ring>
        </View>
        <Line label="Consumed" value={formatKcal(eaten)} />
        <Line label="Remaining" value={formatKcal(remaining)} />
        <Line label="Daily goal" value={formatKcal(energyGoal)} />
      </Card>

      <Section title="Meals">
        <View style={{ gap: 10 }}>
          {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal) => {
            const mealEntries = entries.filter(e => e.meal === meal);
            const kcal = sum(mealEntries.map(e => e.nutrients))[ENERGY] ?? 0;
            return (
              <View key={meal} style={{ borderRadius: 16, backgroundColor: color.track, padding: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Txt style={{ fontWeight: '600' }}>{meal}</Txt>
                  <Txt v="muted">{formatKcal(kcal)}</Txt>
                </View>
              </View>
            );
          })}
        </View>
      </Section>

      <Section title="Macros">
        {macroPrimary.map((id) => {
          const nutrient = totals[id] ?? 0;
          const goal = targets[id] ?? 0;
          const label = id === '1004' ? 'Protein' : id === '1005' ? 'Carbs' : 'Fat';
          return <Line key={id} label={label} value={`${Math.round(nutrient)} / ${Math.round(goal)} g`} />;
        })}
      </Section>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Btn kind="primary" title="Add food" icon="add" onPress={() => router.push('/search')} />
        <Btn title="Scan barcode" icon="scan" onPress={() => router.push('/scan')} />
        <Btn kind="plain" title="Settings" onPress={() => router.push('/settings')} />
      </View>
    </Screen>
  );
}
