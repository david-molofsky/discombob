import { useState } from 'react';
import { Box, Typography, Slider, TextField, Button, IconButton, InputBase } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import dayjs, { Dayjs } from 'dayjs';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import { db } from '../db/db';
import { COLORS } from '../theme/theme';
import { MOOD_SCALE, DEFAULT_TRIGGERS } from '../db/schemas';

export default function MoodEntry() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [moodValue, setMoodValue] = useState<number>(4);
  const [energy, setEnergy] = useState<number>(50);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [addingTrigger, setAddingTrigger] = useState(false);
  const [newTriggerText, setNewTriggerText] = useState('');

  const customTriggers = useLiveQuery(() => db.customTriggers.toArray(), []);
  const allTriggers = [...DEFAULT_TRIGGERS, ...(customTriggers?.map((t) => t.name) ?? [])];

  const confirmNewTrigger = async () => {
    const trimmed = newTriggerText.trim();
    setAddingTrigger(false);
    setNewTriggerText('');
    if (!trimmed) return;
    const alreadyExists = allTriggers.some((t) => t.toLowerCase() === trimmed.toLowerCase());
    if (!alreadyExists) {
      await db.customTriggers.add({ name: trimmed });
    }
    setTriggers((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  };

  const isToday = date.isSame(dayjs(), 'day');
  const selectedMood = MOOD_SCALE.find((m) => m.value === moodValue)!;

  const toggleTrigger = (t: string) => {
    setTriggers((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const save = async () => {
    const timestamp = isToday ? new Date().toISOString() : date.hour(12).minute(0).toISOString();
    await db.moodEntries.add({
      dateISO: date.format('YYYY-MM-DD'),
      timestamp,
      moodValue,
      energy,
      triggers: JSON.stringify(triggers),
      note,
    });
    navigate(-1);
  };

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, px: 2.5, pt: 2.75, pb: 0.75 }}>
        <IconButton
          onClick={() => navigate(-1)}
          size="small"
          sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '10px', color: COLORS.textDim }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <Typography variant="h5" sx={{ fontSize: 19 }}>
          How's your head feeling?
        </Typography>
      </Box>

      <Box sx={{ px: 2.5, pt: 1.5 }}>
        <Box
          onClick={() => setDate(dayjs())}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: isToday ? 'rgba(94,184,166,0.1)' : COLORS.surface,
            border: `1px solid ${isToday ? COLORS.accent : COLORS.border}`,
            color: isToday ? COLORS.accent : COLORS.textDim,
            borderRadius: '100px',
            px: 1.75,
            py: 0.875,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          📅 {isToday ? 'Today, ' : ''}
          {date.format('MMM D')}
        </Box>
        {/* Simple backdate controls: previous / next day */}
        <Box sx={{ display: 'inline-flex', gap: 1, ml: 1 }}>
          <Button size="small" onClick={() => setDate((d) => d.subtract(1, 'day'))} sx={{ color: COLORS.textFaint, minWidth: 0, px: 1 }}>
            ‹
          </Button>
          <Button
            size="small"
            disabled={isToday}
            onClick={() => setDate((d) => d.add(1, 'day'))}
            sx={{ color: COLORS.textFaint, minWidth: 0, px: 1 }}
          >
            ›
          </Button>
        </Box>
      </Box>

      <Box sx={{ px: 2.5, pt: 2.5, pb: 3.5, display: 'flex', flexDirection: 'column', gap: 3.25 }}>
        <Box>
          <SectionLabel>Mood</SectionLabel>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.625 }}>
            {MOOD_SCALE.map((m) => (
              <Box
                key={m.value}
                onClick={() => setMoodValue(m.value)}
                sx={{
                  flex: 1,
                  aspectRatio: '1',
                  borderRadius: '14px',
                  bgcolor: moodValue === m.value ? 'rgba(94,184,166,0.14)' : COLORS.surface,
                  border: `1px solid ${moodValue === m.value ? COLORS.accent : COLORS.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 17,
                  cursor: 'pointer',
                }}
              >
                {m.emoji}
              </Box>
            ))}
          </Box>
          <Typography sx={{ textAlign: 'center', fontSize: 12, color: COLORS.accent, fontWeight: 600, mt: 1 }}>
            {selectedMood.label}
          </Typography>
        </Box>

        <Box>
          <SectionLabel>Energy level</SectionLabel>
          <Slider
            value={energy}
            onChange={(_, v) => setEnergy(v as number)}
            sx={{
              color: COLORS.accent,
              '& .MuiSlider-track': { background: `linear-gradient(90deg, ${COLORS.amber}, ${COLORS.accent})`, border: 'none' },
              '& .MuiSlider-rail': { bgcolor: COLORS.surface },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: COLORS.textFaint, mt: -1 }}>
            <span>Wiped out</span>
            <span>Wired</span>
          </Box>
        </Box>

        <Box>
          <SectionLabel>
            Possible triggers{' '}
            <Box component="span" sx={{ textTransform: 'none', letterSpacing: 0, fontSize: 11, color: COLORS.textFaint }}>
              — tap any that fit
            </Box>
          </SectionLabel>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {allTriggers.map((t) => (
              <Chip key={t} label={t} selected={triggers.includes(t)} onClick={() => toggleTrigger(t)} />
            ))}
            {addingTrigger ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  bgcolor: COLORS.surface,
                  border: `1px solid ${COLORS.accent}`,
                  borderRadius: '100px',
                  pl: 1.75,
                  pr: 0.75,
                  py: 0.5,
                }}
              >
                <InputBase
                  autoFocus
                  placeholder="Type a trigger..."
                  value={newTriggerText}
                  onChange={(e) => setNewTriggerText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmNewTrigger();
                    if (e.key === 'Escape') {
                      setAddingTrigger(false);
                      setNewTriggerText('');
                    }
                  }}
                  sx={{ fontSize: 13, color: COLORS.text, width: 110 }}
                />
                <IconButton
                  size="small"
                  onClick={confirmNewTrigger}
                  sx={{ bgcolor: COLORS.accent, color: '#0D2320', '&:hover': { bgcolor: COLORS.accent }, width: 24, height: 24 }}
                >
                  <CheckIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            ) : (
              <Box
                onClick={() => setAddingTrigger(true)}
                sx={{
                  px: 1.75,
                  py: 1.125,
                  borderRadius: '100px',
                  fontSize: 13,
                  cursor: 'pointer',
                  bgcolor: COLORS.surface,
                  border: `1px dashed ${COLORS.textFaint}`,
                  color: COLORS.textFaint,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                + Add
              </Box>
            )}
          </Box>
        </Box>

        <Box>
          <SectionLabel>
            Note{' '}
            <Box component="span" sx={{ textTransform: 'none', letterSpacing: 0, fontSize: 11, color: COLORS.textFaint }}>
              — optional
            </Box>
          </SectionLabel>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Anything else going on..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: COLORS.surface,
                borderRadius: '14px',
                fontSize: 14,
                '& fieldset': { borderColor: COLORS.border },
              },
            }}
          />
        </Box>

        <Button
          fullWidth
          onClick={save}
          sx={{ bgcolor: COLORS.accent, color: '#0D2320', fontWeight: 600, fontSize: 15, py: 1.5, '&:hover': { bgcolor: COLORS.accent } }}
        >
          Save check-in
        </Button>
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

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        px: 1.75,
        py: 1.125,
        borderRadius: '100px',
        fontSize: 13,
        cursor: 'pointer',
        bgcolor: selected ? 'rgba(94,184,166,0.14)' : COLORS.surface,
        border: `1px solid ${selected ? COLORS.accent : COLORS.border}`,
        color: selected ? COLORS.accent : COLORS.textDim,
      }}
    >
      {label}
    </Box>
  );
}
