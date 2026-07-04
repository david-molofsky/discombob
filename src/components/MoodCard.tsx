import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { COLORS } from '../theme/theme';
import { paths } from '../routes/paths';
import { MOOD_SCALE, type MoodEntry } from '../db/schemas';

export default function MoodCard({ latestToday }: { latestToday: MoodEntry | undefined }) {
  const navigate = useNavigate();

  if (!latestToday) {
    return (
      <Box
        onClick={() => navigate(paths.moodNew)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.75,
          bgcolor: COLORS.surface,
          border: `1px dashed ${COLORS.textFaint}`,
          borderRadius: '16px',
          p: 2,
          cursor: 'pointer',
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: COLORS.surfaceRaised,
            border: `1px dashed ${COLORS.textFaint}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            color: COLORS.textFaint,
            flexShrink: 0,
          }}
        >
          ?
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>No check-in yet today</Typography>
          <Typography sx={{ fontSize: 12, color: COLORS.accent, fontWeight: 600, mt: 0.5 }}>
            Tap to log how you're feeling
          </Typography>
        </Box>
        <ChevronRightIcon sx={{ color: COLORS.textFaint }} />
      </Box>
    );
  }

  const mood = MOOD_SCALE.find((m) => m.value === latestToday.moodValue) ?? MOOD_SCALE[3];
  const energyLabel = latestToday.energy < 33 ? 'low' : latestToday.energy < 66 ? 'mid' : 'high';

  return (
    <Box
      onClick={() => navigate(paths.moodNew)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.75,
        bgcolor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '16px',
        p: 2,
        cursor: 'pointer',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          bgcolor: 'rgba(94,184,166,0.14)',
          border: `1px solid ${COLORS.accent}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          flexShrink: 0,
        }}
      >
        {mood.emoji}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{mood.label}</Typography>
        <Typography sx={{ fontSize: 12, color: COLORS.textFaint, mt: 0.5 }}>
          Last check-in: {dayjs(latestToday.timestamp).format('h:mm A')} · Energy: {energyLabel}
        </Typography>
      </Box>
      <ChevronRightIcon sx={{ color: COLORS.textFaint }} />
    </Box>
  );
}
