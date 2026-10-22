import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useDb } from '../../src/db/provider';
import { today } from '../../src/dates';
import { getSetting, setSetting } from '../../src/diary/settings';
import { Btn, Card, Line, Screen, Section, Txt } from '../../src/ui/kit';

const RECENT_GOAL = 10000;

export default function ProgressScreen() {
  const { diary } = useDb();
  const [water, setWater] = useState(0);
  const [steps, setSteps] = useState(0);
  const [weight, setWeight] = useState<string>('—');

  useFocusEffect(useCallback(() => {
    (async () => {
      const day = today();
      const waterValue = Number(await getSetting(diary, `water_${day}`)) || 0;
      const stepValue = Number(await getSetting(diary, `steps_${day}`)) || 0;
      const weightValue = await getSetting(diary, 'last_weight');
      setWater(waterValue);
      setSteps(stepValue);
      setWeight(weightValue ?? '—');
    })();
  }, [diary]));

  const waterProgress = Math.min((water / 2500) * 100, 100);
  const stepsProgress = Math.min((steps / RECENT_GOAL) * 100, 100);

  const persistWeight = async () => {
    if (weight === '—') return;
    await setSetting(diary, 'last_weight', weight);
  };

  return (
    <Screen tab title="Progress">
      <Card>
        <Txt v="headline">This week</Txt>
        <Line label="Calories" value="2,140 avg" />
        <Line label="Water" value={`${(water / 1000).toFixed(1)} L today`} />
        <Line label="Steps" value={`${steps.toLocaleString()} today`} />
        <Line label="Weight" value={weight === '—' ? 'No weight logged' : `${weight} kg`} />
      </Card>

      <Section title="Trend progress">
        <Card style={{ gap: 12 }}>
          <Txt>Water intake</Txt>
          <View style={{ height: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 999 }}>
            <View style={{ width: `${waterProgress}%`, height: 12, backgroundColor: '#41D2E7', borderRadius: 999 }} />
          </View>
          <Txt>Step target</Txt>
          <View style={{ height: 12, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 999 }}>
            <View style={{ width: `${stepsProgress}%`, height: 12, backgroundColor: '#4AE2A5', borderRadius: 999 }} />
          </View>
        </Card>
      </Section>

      <Section title="Milestones">
        <View style={{ gap: 10 }}>
          <Card style={{ padding: 12 }}>
            <Txt>Personal record: 12 pull-ups</Txt>
          </Card>
          <Card style={{ padding: 12 }}>
            <Txt>Longest streak: 9 days</Txt>
          </Card>
          <Card style={{ padding: 12 }}>
            <Txt>Sleep consistency: 7.2 hrs avg</Txt>
          </Card>
        </View>
      </Section>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <Btn kind="primary" title="Save weight" icon="progress" onPress={persistWeight} />
        <Btn kind="plain" title="Export" onPress={() => {}} />
      </View>
    </Screen>
  );
}
