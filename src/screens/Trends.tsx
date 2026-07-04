import { useState, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useLiveQuery } from 'dexie-react-hooks';
import dayjs from 'dayjs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { db } from '../db/db';
import { COLORS } from '../theme/theme';
import { MOOD_SCALE } from '../db/schemas';

type RangeDays = 7 | 30 | 90;

export default function Trends() {
  const [range, setRange] = useState<RangeDays>(30);

  const entries = useLiveQuery(async () => {
    const cutoff = dayjs().subtract(range, 'day').format('YYYY-MM-DD');
    const all = await db.moodEntries.toArray();
    return all.filter((e) => e.dateISO >= cutoff);
  }, [range]);

  const { moodByDay, energyByDay, avgMood, avgEnergy, checkInsPerDay, triggerCounts } = useMemo(() => {
    if (!entries) {
      return { moodByDay: [], energyByDay: [], avgMood: 0, avgEnergy: 0, checkInsPerDay: 0, triggerCounts: [] as [string, number][] };
    }
    const byDay = new Map<string, { mood: number[]; energy: number[] }>();
    const triggerMap = new Map<string, number>();

    entries.forEach((e) => {
      if (!byDay.has(e.dateISO)) byDay.set(e.dateISO, { mood: [], energy: [] });
      byDay.get(e.dateISO)!.mood.push(e.moodValue);
      byDay.get(e.dateISO)!.energy.push(e.energy);
      try {
        const trig: string[] = JSON.parse(e.triggers || '[]');
        trig.forEach((t) => triggerMap.set(t, (triggerMap.get(t) ?? 0) + 1));
      } catch {
        /* ignore malformed trigger data */
      }
    });

    const days = Array.from(byDay.keys()).sort();
    const moodByDay = days.map((d) => ({
      date: dayjs(d).format('MMM D'),
      value: byDay.get(d)!.mood.reduce((a, b) => a + b, 0) / byDay.get(d)!.mood.length,
    }));
    const energyByDay = days.map((d) => ({
      date: dayjs(d).format('MMM D'),
      value: byDay.get(d)!.energy.reduce((a, b) => a + b, 0) / byDay.get(d)!.energy.length,
    }));

    const avgMood = entries.length ? entries.reduce((a, e) => a + e.moodValue, 0) / entries.length : 0;
    const avgEnergy = entries.length ? entries.reduce((a, e) => a + e.energy, 0) / entries.length : 0;
    const checkInsPerDay = days.length ? entries.length / days.length : 0;

    const triggerCounts = Array.from(triggerMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);

    return { moodByDay, energyByDay, avgMood, avgEnergy, checkInsPerDay, triggerCounts };
  }, [entries]);

  const avgMoodEmoji = MOOD_SCALE.find((m) => m.value === Math.round(avgMood))?.emoji ?? '🙂';
  const maxTriggerCount = triggerCounts[0]?.[1] ?? 1;

  return (
    <Box sx={{ flex: 1, overflowY: 'auto' }}>
      <Box sx={{ px: 2.5, pt: 3 }}>
        <Typography variant="h4" sx={{ fontSize: 22 }}>
          Trends
        </Typography>

        <Box
          sx={{
            display: 'flex',
            bgcolor: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '100px',
            p: 0.5,
            mt: 1.75,
          }}
        >
          {([7, 30, 90] as RangeDays[]).map((r) => (
            <Box
              key={r}
              onClick={() => setRange(r)}
              sx={{
                flex: 1,
                textAlign: 'center',
                py: 1,
                fontSize: 13,
                borderRadius: '100px',
                cursor: 'pointer',
                color: range === r ? '#0D2320' : COLORS.textFaint,
                bgcolor: range === r ? COLORS.accent : 'transparent',
                fontWeight: range === r ? 600 : 400,
              }}
            >
              {r}d
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2.75 }}>
        <Box>
          <SectionLabel>Mood — daily average</SectionLabel>
          <Card>
            <Typography sx={{ fontSize: 20, fontFamily: "'Fraunces', serif", fontWeight: 600 }}>
              {avgMoodEmoji} {avgMood.toFixed(1)}
              <Box component="span" sx={{ fontSize: 11, color: COLORS.textFaint, fontFamily: "'IBM Plex Sans', sans-serif", ml: 1 }}>
                avg this period
              </Box>
            </Typography>
            <Box sx={{ height: 150, mt: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodByDay}>
                  <CartesianGrid stroke={COLORS.border} vertical={false} />
                  <YAxis domain={[1, 7]} hide />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: COLORS.textFaint }} axisLine={false} tickLine={false} />
                  <Line type="monotone" dataKey="value" stroke={COLORS.accent} strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Box>

        <Box>
          <SectionLabel>This period</SectionLabel>
          <Box sx={{ display: 'flex', gap: 1.25 }}>
            <Stat value={entries?.length ?? 0} label="check-ins logged" />
            <Stat value={avgEnergy.toFixed(0)} label="avg energy" />
            <Stat value={checkInsPerDay.toFixed(1)} label="check-ins / day" />
          </Box>
        </Box>

        <Box>
          <SectionLabel>Energy — daily average</SectionLabel>
          <Card>
            <Box sx={{ height: 90 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={energyByDay}>
                  <Bar dataKey="value" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Box>

        <Box>
          <SectionLabel>Top triggers this period</SectionLabel>
          <Card>
            {triggerCounts.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: COLORS.textFaint, textAlign: 'center', py: 2 }}>
                No triggers logged yet.
              </Typography>
            ) : (
              triggerCounts.map(([name, count]) => (
                <Box key={name} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25, '&:last-of-type': { mb: 0 } }}>
                  <Typography sx={{ width: 110, fontSize: 13, color: COLORS.textDim, flexShrink: 0 }}>{name}</Typography>
                  <Box sx={{ flex: 1, height: 8, borderRadius: '100px', bgcolor: COLORS.surfaceRaised, overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${(count / maxTriggerCount) * 100}%`, bgcolor: COLORS.accent, borderRadius: '100px' }} />
                  </Box>
                  <Typography sx={{ fontSize: 12, color: COLORS.textFaint, width: 18, textAlign: 'right', flexShrink: 0 }}>
                    {count}
                  </Typography>
                </Box>
              ))
            )}
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: 12, letterSpacing: '0.09em', textTransform: 'uppercase', color: COLORS.textFaint, mb: 1.5 }}>
      {children}
    </Typography>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '16px', p: 2 }}>
      {children}
    </Box>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <Box sx={{ flex: 1, bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '14px', p: 1.5 }}>
      <Typography sx={{ fontSize: 18, fontFamily: "'Fraunces', serif", fontWeight: 600 }}>{value}</Typography>
      <Typography sx={{ fontSize: 11, color: COLORS.textFaint, mt: 0.375 }}>{label}</Typography>
    </Box>
  );
}
