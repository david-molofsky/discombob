import { useState } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import dayjs from 'dayjs';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { db } from '../db/db';
import { COLORS } from '../theme/theme';
import { paths } from '../routes/paths';
import { MOOD_SCALE } from '../db/schemas';
import { FullEnergyGauge } from '../components/EnergyGauge';
import TagChips from '../components/TagChips';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import { safeParseTriggers } from './MoodHistory';

export default function MoodDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const entryId = Number(id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const entry = useLiveQuery(() => db.moodEntries.get(entryId), [entryId]);

  if (entry === undefined) return null; // still loading
  if (entry === null) {
    // Deleted from elsewhere, or bad id — bounce back to the list.
    navigate(paths.mood, { replace: true });
    return null;
  }

  const mood = MOOD_SCALE.find((m) => m.value === entry.moodValue) ?? MOOD_SCALE[3];
  const triggers = safeParseTriggers(entry.triggers);

  const handleDelete = async () => {
    if (entry.id != null) await db.moodEntries.delete(entry.id);
    navigate(paths.mood, { replace: true });
  };

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, px: 2.5, pt: 2.75, pb: 1.5 }}>
        <IconButton
          onClick={() => navigate(-1)}
          size="small"
          sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '10px', color: COLORS.textDim }}
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            bgcolor: COLORS.surface,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            flexShrink: 0,
          }}
        >
          {mood.emoji}
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontSize: 19 }}>
            {mood.label}
          </Typography>
          <Typography sx={{ fontSize: 12, color: COLORS.textFaint }}>
            {dayjs(entry.timestamp).format('dddd, MMM D, YYYY')} · {dayjs(entry.timestamp).format('h:mm A')}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2.5, pb: 3.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <FullEnergyGauge energy={entry.energy} />

        {triggers.length > 0 && (
          <Box>
            <SectionLabel>Triggers</SectionLabel>
            <TagChips tags={triggers} />
          </Box>
        )}

        {entry.note && (
          <Box>
            <SectionLabel>Note</SectionLabel>
            <Box sx={{ bgcolor: COLORS.surface, borderRadius: '10px', p: 1.5, fontSize: 13, lineHeight: 1.5 }}>{entry.note}</Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1.25, mt: 1 }}>
          <Button
            fullWidth
            onClick={() => navigate(paths.moodEdit(entryId))}
            sx={{ bgcolor: 'rgba(94,184,166,0.15)', color: COLORS.accent, '&:hover': { bgcolor: 'rgba(94,184,166,0.15)' } }}
          >
            Edit
          </Button>
          <Button
            fullWidth
            onClick={() => setConfirmDelete(true)}
            sx={{ bgcolor: 'rgba(217,108,108,0.15)', color: COLORS.danger, '&:hover': { bgcolor: 'rgba(217,108,108,0.15)' } }}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <DeleteConfirmDialog
        open={confirmDelete}
        itemText={mood.label}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: 12, letterSpacing: '0.09em', textTransform: 'uppercase', color: COLORS.textFaint, mb: 1 }}>
      {children}
    </Typography>
  );
}
