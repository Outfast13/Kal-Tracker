import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useDb } from '../../src/db/provider';
import { addDays, today } from '../../src/dates';
import { entriesForDay, type Entry } from '../../src/diary/entries';
import { logEntry, unlogEntry } from '../../src/diary/log';
import { DEFAULT_MEALS, getJson, getSetting, goals, setSetting } from '../../src/diary/settings';
import { checkDue, fetchManifest, pickFile, SUPPORTED_SCHEMA } from '../../src/foods/update';
import { readActiveCalories } from '../../src/health';
import { MAIN, PANEL, sum, type Nutrients } from '../../src/nutrients';
import { Banner, Btn, Card, IconBtn, Line, Ring, row, Screen, Txt } from '../../src/ui/kit';
import { fmt, NutrientBar } from '../../src/ui/NutrientBar';
import { color, radius, shadow } from '../../src/ui/theme';

const ENERGY = '1008';
const pretty = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

export default function Today() {
  const { diary } = useDb();
  const router = useRouter();
  const { fontScale } = useWindowDimensions();
  const [day, setDay] = useState(today());
  const [entries, setEntries] = useState<Entry[]>([]);
  const [targets, setTargets] = useState<Nutrients>({});
  const [meals, setMeals] = useState(DEFAULT_MEALS);
  const [more, setMore] = useState(false);
  const [deleted, setDeleted] = useState<Entry | null>(null);
  const [md5, setMd5] = useState<string | null>(null);
  const [latest, setLatest] = useState<string | null>(null);
  const [backupPending, setBackupPending] = useState(false);
  const [burned, setBurned] = useState<number | null>(null);
  const [water, setWater] = useState(0);
  const [steps, setSteps] = useState(0);

  const load = useCallback(async () => {
    setEntries(await entriesForDay(diary, day));
    setTargets(await goals(diary));
    setMeals(await getJson<string[]>(diary, 'meals', DEFAULT_MEALS));
    setWater(Number(await getSetting(diary, `water_${day}`)) || 0);
    setSteps(Number(await getSetting(diary, `steps_${day}`)) || 0);
    setMd5(await getSetting(diary, 'foods_md5'));
    setBackupPending((await getSetting(diary, 'backup_pending')) === '1');
    setBurned((await getSetting(diary, 'health_enabled')) === '1' ? await readActiveCalories(day) : null);
  }, [diary, day]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    const check = async () => {
      const last = await getSetting(diary, 'foods_checked_at');
      if (!checkDue(last ? Number(last) : null, Date.now(), Math.random())) return;
      try {
        const f = pickFile(await fetchManifest(), (await getSetting(diary, 'foods_country')) ?? 'US', SUPPORTED_SCHEMA);
        await setSetting(diary, 'foods_checked_at', String(Date.now()), false);
        if (f) setLatest(f.md5);
      } catch { /* offline: try again next foreground */ }
    };
    check();
    const sub = AppState.addEventListener('change', s => { if (s === 'active') check(); });
    return () => sub.remove();
  }, [diary]);

  const starter = !md5, newer = !!md5 && !!latest && latest !== md5;
  const totals = sum(entries.map(e => e.nutrients));

  const changeWater = async (delta: number) => {
    const next = Math.max(0, water + delta);
    setWater(next);
    await setSetting(diary, `water_${day}`, String(next));
  };
  const changeSteps = async (delta: number) => {
    const next = Math.max(0, steps + delta);
    setSteps(next);
    await setSetting(diary, `steps_${day}`, String(next));
  };

  const remove = async (e: Entry) => {
    await unlogEntry(diary, e.id);
    await load();
    setDeleted(e);
    setTimeout(() => setDeleted(d => (d === e ? null : d)), 5000);
  };
  const undo = async () => {
    if (!deleted) return;
    await logEntry(diary, { ...deleted, health_id: null });
    setDeleted(null);
    await load();
  };

  const sections = [...meals, 'Other']
    .map(m => [m, entries.filter(e => (m === 'Other' ? !meals.includes(e.meal) : e.meal === m))] as const)
    .filter(([m, es]) => m !== 'Other' || es.length);

  const eaten = totals[ENERGY] ?? 0, energyGoal = targets[ENERGY];

  return (
    <Screen tab title={day === today() ? 'Home' : pretty(day)}
      right={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <IconBtn icon="prev" label="Previous day" onPress={() => setDay(addDays(day, -1))} />
          <IconBtn icon="next" label="Next day" onPress={() => setDay(addDays(day, 1))} />
          <IconBtn icon="weight" label="Weight log" onPress={() => router.push('/weight')} />
        </View>
      }
      overlay={deleted && (
        <View style={{ ...row, paddingLeft: 20, paddingRight: 8, minHeight: 52, borderRadius: radius.pill, backgroundColor: color.charcoal, boxShadow: shadow.chrome }}>
          <Txt style={{ color: color.white }}>Deleted.</Txt>
          <Pressable onPress={undo} accessibilityRole="button" style={{ minHeight: 44, paddingHorizontal: 14, justifyContent: 'center' }}>
            <Text style={{ color: color.green, fontSize: 16, fontWeight: '700' }}>Undo</Text>
          </Pressable>
        </View>
      )}>
      {(starter || newer) && <Banner text={starter ? 'Download the full food database' : 'New food database available'} onPress={() => router.push('/settings')} />}
      {backupPending && <Banner kind="error" text="Backup failed. Retry from Settings." onPress={() => router.push('/settings')} />}

      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <Ring size={132 * Math.min(Math.max(fontScale, 1), 2)} width={13} frac={energyGoal ? eaten / energyGoal : 0}>
            <Txt v="title" style={{ fontSize: 28, fontVariant: ['tabular-nums'] }}>{fmt(eaten)}</Txt>
            <Txt v="muted">{energyGoal ? `of ${fmt(energyGoal)} kcal` : 'kcal'}</Txt>
          </Ring>
          <View style={{ flexGrow: 1, flexBasis: 150 * fontScale, gap: 10 }}>
            {MAIN.filter(id => id !== ENERGY).map(id => <NutrientBar key={id} id={id} value={totals[id] ?? 0} goal={targets[id]} />)}
          </View>
        </View>
        {burned != null && <Line label="Burned" value={`${fmt(burned)} kcal`} />}
        {burned != null && energyGoal != null && <Line label="Remaining" value={`${fmt(energyGoal - eaten + burned)} kcal`} />}
        <Btn kind="plain" small title={more ? 'Show less' : 'All nutrients'} onPress={() => setMore(!more)} />
        {more && PANEL.filter(n => !MAIN.includes(n.id)).map(n => {
          const v = totals[n.id] ?? 0, t = targets[n.id];
          return <Line key={n.id} label={n.name} value={`${fmt(v)}${t ? ` / ${fmt(t)}` : ''} ${n.unit}${t ? `  ${Math.round((v / t) * 100)}%` : ''}`} />;
        })}
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <Card style={{ flex: 1, minWidth: 145, gap: 12 }}>
          <Txt v="headline">💧 Water</Txt>
          <Txt style={{ fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{(water / 1000).toFixed(2)} L</Txt>
          <Txt v="muted">{water.toLocaleString()} ml logged</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Btn title="+250 ml" icon="add" onPress={() => changeWater(250)} />
            <Btn title="+500 ml" icon="add" onPress={() => changeWater(500)} />
            <Btn title="Undo 250" kind="plain" small onPress={() => changeWater(-250)} disabled={water === 0} />
          </View>
        </Card>
        <Card style={{ flex: 1, minWidth: 145, gap: 12 }}>
          <Txt v="headline">👟 Steps</Txt>
          <Txt style={{ fontSize: 28, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{steps.toLocaleString()}</Txt>
          <Txt v="muted">steps logged today</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Btn title="+500" icon="add" onPress={() => changeSteps(500)} />
            <Btn title="+1,000" icon="add" onPress={() => changeSteps(1000)} />
            <Btn title="Reset" kind="plain" small onPress={() => changeSteps(-steps)} disabled={steps === 0} />
          </View>
        </Card>
      </View>

      <Card style={{ gap: 12 }}>
        <Txt v="headline">Quick actions</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Btn kind="primary" title="Add food" icon="add" onPress={() => router.push('/search')} />
          <Btn title="Scan barcode" icon="scan" onPress={() => router.push('/scan')} />
          <Btn title="Log weight" icon="weight" onPress={() => router.push('/weight')} />
        </View>
      </Card>

      {sections.map(([meal, es]) => (
        <Card key={meal} style={{ gap: 0 }}>
          <View style={{ ...row, flexWrap: 'wrap' }}>
            <View style={{ flexGrow: 1 }}>
              <Txt v="headline">{meal}</Txt>
              {es.length > 0 && <Txt v="muted">{fmt(sum(es.map(e => e.nutrients))[ENERGY] ?? 0)} kcal</Txt>}
            </View>
            {meal !== 'Other' && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Btn small icon="add" title="Add" onPress={() => router.push({ pathname: '/search', params: { day, meal } })} />
                <Btn small kind="plain" icon="scan" title="Scan" onPress={() => router.push({ pathname: '/scan', params: { day, meal } })} />
              </View>
            )}
          </View>
          {es.map((e, i) => (
            <Pressable key={e.id} style={{ ...row, minHeight: 52, paddingVertical: 8, marginTop: i ? 0 : 12, borderTopWidth: 1, borderTopColor: color.track }}
              onPress={() => router.push({ pathname: '/food/[ref]', params: { ref: e.food_ref ?? 'entry', entry: e.id } })}
              onLongPress={() => remove(e)}>
              <View style={{ flex: 1 }}>
                <Txt numberOfLines={2}>{e.name}</Txt>
                <Txt v="muted">{e.amount_desc ?? `${e.amount} g`}</Txt>
              </View>
              <Txt style={{ fontVariant: ['tabular-nums'] }}>{fmt(e.nutrients[ENERGY] ?? 0)} kcal</Txt>
            </Pressable>
          ))}
        </Card>
      ))}
      {entries.length > 0 && <Txt v="muted" style={{ textAlign: 'center' }}>Long-press an entry to delete it.</Txt>}
    </Screen>
  );
}
