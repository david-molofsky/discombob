import { useMemo, useState } from 'react';
import { Box, Typography, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import dayjs from 'dayjs';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { db } from '../db/db';
import { COLORS } from '../theme/theme';
import { paths } from '../routes/paths';
import { MOOD_SCALE, type MoodEntry } from '../db/schemas';
import { moodColor } from '../utils/moodColor';
import { MiniEnergyGauge } from '../components/EnergyGauge';
import TagChips from '../components/TagChips';
import SwipeableItem from '../components/SwipeableItem';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

type RangeFilter = 'all' | 'week' | 'month';

function dateGroupLabel(dateISO: string): string {
  const d = dayjs(dateISO);
  if (d.isSame(dayjs(), 'day')) return 'Today';
  if (d.isSame(dayjs().subtract(1, 'day'), 'day')) return 'Yesterday';
  if (d.isSame(dayjs(), 'year')) return d.format('MMM D');
  return d.format('MMM D, YYYY');
}

export default function MoodHistory() {
  const navigate = useNavigate();
  const [range, setRange] = useState<RangeFilter>('all');
  const [triggerFilter, setTriggerFilter] = useState<string | null>(null);
  const [triggerMenuAnchor, setTriggerMenuAnchor] = useState<null | HTMLElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<MoodEntry | null>(null);

  const entries = useLiveQuery(async () => {
    const all = await db.moodEntries.toArray();
    all.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    return all;
  }, []);

  const allTriggers = useMemo(() => {
    if (!entries) return [];
    const set = new Set<string>();
    for (const e of entries) {
      const parsed: string[] = safeParseTriggers(e.triggers);
      parsed.forEach((t) => set.add(t));
    }
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    if (!entries) return undefined;
    const cutoff = range === 'week' ? dayjs().subtract(7, 'day') : range === 'month' ? dayjs().subtract(30, 'day') : null;
    return entries.filter((e) => {
      if (cutoff && dayjs(e.timestamp).isBefore(cutoff)) return false;
      if (triggerFilter && !safeParseTriggers(e.triggers).includes(triggerFilter)) return false;
      return true;
    });
  }, [entries, range, triggerFilter]);

  const grouped = useMemo(() => {
    if (!filtered) return [];
    const groups = new Map<string, MoodEntry[]>();
    for (const e of filtered) {
      const list = groups.get(e.dateISO) ?? [];
      list.push(e);
      groups.set(e.dateISO, list);
    }
    return Array.from(groups.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const confirmDelete = async () => {
    if (deleteTarget?.id != null) {
      await db.moodEntries.delete(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2.5, pt: 3, pb: 1 }}>
        <Typography variant="h4" sx={{ fontSize: 22 }}>
          Mood History
        </Typography>
        <Typography sx={{ fontSize: 13, color: COLORS.textFaint, mt: 0.25 }}>All check-ins, most recent first</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, px: 2.5, py: 1.25, overflowX: 'auto' }}>
        <FilterChip label="All" active={range === 'all' && !triggerFilter} onClick={() => { setRange('all'); setTriggerFilter(null); }} />
        <FilterChip label="This week" active={range === 'week'} onClick={() => setRange('week')} />
        <FilterChip label="This month" active={range === 'month'} onClick={() => setRange('month')} />
        <FilterChip
          label={triggerFilter ?? 'By trigger'}
          active={!!triggerFilter}
          onClick={(e) => setTriggerMenuAnchor(e.currentTarget)}
        />
      </Box>

      <Menu anchorEl={triggerMenuAnchor} open={!!triggerMenuAnchor} onClose={() => setTriggerMenuAnchor(null)}>
        {allTriggers.length === 0 && <MenuItem disabled>No triggers logged yet</MenuItem>}
        {allTriggers.map((t) => (
          <MenuItem
            key={t}
            onClick={() => {
              setTriggerFilter(t);
              setTriggerMenuAnchor(null);
            }}
          >
            {t}
          </MenuItem>
        ))}
      </Menu>

      <Box sx={{ flex: 1, px: 2.5, pb: 3 }}>
        {!filtered ? null : filtered.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              px: 1.5,
              color: COLORS.textFaint,
              fontSize: 13,
              border: `1px dashed ${COLORS.border}`,
              borderRadius: '14px',
              mt: 1,
            }}
          >
            No check-ins in this range yet.
          </Box>
        ) : (
          grouped.map(([dateISO, dayEntries]) => (
            <Box key={dateISO} sx={{ mt: 2.25 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: COLORS.textFaint, textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>
                {dateGroupLabel(dateISO)}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {dayEntries.map((entry) => (
                  <SwipeableItem
                    key={entry.id}
                    rightAction={{
                      label: 'Delete',
                      icon: <DeleteOutlineIcon sx={{ fontSize: 18 }} />,
                      color: COLORS.danger,
                      textColor: '#2B0D0D',
                      onCommit: () => setDeleteTarget(entry),
                    }}
                  >
                    <MoodHistoryCard entry={entry} onTap={() => navigate(paths.moodDetail(entry.id!))} />
                  </SwipeableItem>
                ))}
              </Box>
            </Box>
          ))
        )}
      </Box>

      <Box
        onClick={() => navigate(paths.moodNew)}
        sx={{
          position: 'fixed',
          bottom: 84,
          right: 24,
          width: 52,
          height: 52,
          borderRadius: '50%',
          bgcolor: COLORS.accent,
          color: '#0D2320',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          cursor: 'pointer',
        }}
      >
        <AddIcon />
      </Box>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        itemText={deleteTarget ? MOOD_SCALE.find((m) => m.value === deleteTarget.moodValue)?.label ?? 'this check-in' : ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
}

function MoodHistoryCard({ entry, onTap }: { entry: MoodEntry; onTap: () => void }) {
  const mood = MOOD_SCALE.find((m) => m.value === entry.moodValue) ?? MOOD_SCALE[3];
  const triggers = safeParseTriggers(entry.triggers);
  const color = moodColor(entry.moodValue);

  return (
    <Box
      onClick={onTap}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        bgcolor: COLORS.surface,
        borderRadius: '14px',
        borderLeft: `4px solid ${color}`,
        p: 1.75,
        cursor: 'pointer',
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {mood.emoji}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{mood.label}</Typography>
        <Typography sx={{ fontSize: 12, color: COLORS.textFaint }}>Energy: {energyLabel(entry.energy)}</Typography>
        {triggers.length > 0 && <TagChips tags={triggers} />}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0 }}>
        <MiniEnergyGauge energy={entry.energy} />
        <Typography sx={{ fontSize: 11, color: COLORS.textFaint }}>{dayjs(entry.timestamp).format('h:mm A')}</Typography>
      </Box>
    </Box>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: (e: React.MouseEvent<HTMLElement>) => void }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        fontSize: 12,
        px: 1.5,
        py: 0.625,
        borderRadius: '14px',
        bgcolor: active ? 'rgba(94,184,166,0.15)' : COLORS.surface,
        border: `1px solid ${active ? COLORS.accent : COLORS.border}`,
        color: active ? COLORS.accent : COLORS.textDim,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {label}
    </Box>
  );
}

function energyLabel(energy: number): string {
  return energy < 33 ? 'Wiped out' : energy < 66 ? 'Steady' : 'Wired';
}

export function safeParseTriggers(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
