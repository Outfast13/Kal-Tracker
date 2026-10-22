import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Btn, Card, Line, Screen, Section, Txt } from '../../src/ui/kit';

const routines = [
  { title: 'Push & pull strength', sets: '4 rounds', time: '32 min' },
  { title: 'HIIT cardio', sets: '3 circuits', time: '18 min' },
  { title: 'Recovery mobility', sets: '10 min', time: 'Low intensity' },
];

const exercises = ['Pull-ups', 'Push-ups', 'Squats', 'Walking', 'Planks', 'Deadlifts'];

export default function FitnessScreen() {
  const router = useRouter();
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
        <Btn kind="primary" title="Log workout" icon="fitness" onPress={() => router.push('/settings')} />
        <Btn title="View progress" icon="progress" onPress={() => router.push('/progress')} />
      </View>
    </Screen>
  );
}
