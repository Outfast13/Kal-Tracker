import { Card, Screen, Section, Txt, Btn, Line } from '../../src/ui/kit';

export default function ProgressScreen() {
  return (
    <Screen tab title="Progress">
      <Card>
        <Txt v="headline">This week</Txt>
        <Line label="Calories" value="2,140 avg" />
        <Line label="Water" value="2.4 L avg" />
        <Line label="Steps" value="9,800 avg" />
      </Card>

      <Section title="Trends">
        <Card style={{ gap: 8 }}>
          <Txt>Weight trend: stable</Txt>
          <Txt>Body measurements: 2 entries logged</Txt>
          <Txt>Training consistency: 3/5 workouts</Txt>
        </Card>
      </Section>

      <Section title="Milestones">
        <Card style={{ gap: 10 }}>
          <Txt>Personal record: 12 pull-ups</Txt>
          <Txt>Longest streak: 9 days</Txt>
          <Txt>Sleep consistency: 7.2 hrs avg</Txt>
        </Card>
      </Section>

      <Btn kind="primary" title="Export data" icon="progress" onPress={() => {}} />
    </Screen>
  );
}
