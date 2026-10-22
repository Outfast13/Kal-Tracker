import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useDb } from '../../src/db/provider';
import { getJson, setSetting } from '../../src/diary/settings';
import { Btn, Card, Line, Screen, Section, Txt } from '../../src/ui/kit';
import { color } from '../../src/ui/theme';

const DEFAULT_ROUTINES = [
  { title: 'Push & pull strength', sets: '4 rounds', time: '32 min' },
  { title: 'HIIT cardio', sets: '3 circuits', time: '18 min' },
  { title: 'Recovery mobility', sets: '10 min', time: 'Low intensity' },
];

type Routine = { title: string; sets: string; time: string };

const exercises = ['Pull-ups', 'Push-ups', 'Squats', 'Walking', 'Planks', 'Deadlifts'];

export default function FitnessScreen() {
  const { diary } = useDb();
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>(DEFAULT_ROUTINES);

  useFocusEffect(useCallback(() => {
    (async () => {
      const list = await getJson<Routine[]>(diary, 'fitness_routines', DEFAULT_ROUTINES);
      setRoutines(list);
    })();
  }, [diary]));

  const addRoutine = async () => {
    const next = [...routines, { title: `Routine ${routines.length + 1}`, sets: '3 rounds', time: '20 min' }];
    setRoutines(next);
    await setSetting(diary, 'fitness_routines', JSON.stringify(next));
  };

  return (
    <Screen tab title="Fitness">
      <Card>
        <Txt v="headline">Weekly training</Txt>
        <Line label="Workouts this week" value="3 planned" />
        <Line label="Consistency" value="72%" />
        <Line label="Volume" value="4.8 hrs" />
      </Card>

      <Section title="Routines">
        <View style={{ gap: 10 }}>
          {routines.map((routine) => (
            <Card key={routine.title} style={{ padding: 12, gap: 6 }}>
              <Txt style={{ fontWeight: '600' }}>{routine.title}</Txt>
              <Txt v="muted">{routine.sets} • {routine.time}</Txt>
            </Card>
          ))}
        </View>
      </Section>

      <Section title="Exercise library">
        <Card style={{ gap: 8 }}>
          {exercises.map((exercise) => (
            <Txt key={exercise} v="muted">• {exercise}</Txt>
          ))}
        </Card>
      </Section>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Btn kind="primary" title="Add routine" icon="fitness" onPress={addRoutine} />
        <Btn title="View progress" icon="progress" onPress={() => router.push('/progress')} />
      </View>
    </Screen>
  );
}
