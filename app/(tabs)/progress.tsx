import { View } from 'react-native';
import { Btn, Card, Line, Screen, Section, Txt } from '../../src/ui/kit';

const habits = ['Hydration', 'Exercise', 'Balanced nutrition', 'Sleep', 'Skincare', 'Grooming'];

export default function GlowUpScreen() {
  return (
    <Screen tab title="Glow Up">
      <Card>
        <Txt v="headline">Daily glow score</Txt>
        <Txt style={{ fontSize: 32, fontWeight: '800' }}>84%</Txt>
        <Line label="Completed" value="6 of 7 habits" />
        <Line label="Streak" value="9 days" />
      </Card>

      <Section title="Core habits">
        <View style={{ gap: 10 }}>
          {habits.map((habit) => (
            <Card key={habit} style={{ padding: 12 }}>
              <Txt>{habit}</Txt>
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

      <Btn kind="primary" title="Track today" icon="glow" onPress={() => {}} />
    </Screen>
  );
}
