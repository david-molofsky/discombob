import { Box } from '@mui/material';
import { COLORS } from '../theme/theme';

export default function TagChips({ tags }: { tags?: string[] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
      {tags.map((t) => (
        <Box
          key={t}
          sx={{
            fontSize: 10,
            fontWeight: 600,
            color: COLORS.accent,
            bgcolor: 'rgba(94,184,166,0.15)',
            borderRadius: '100px',
            px: 1,
            py: 0.25,
          }}
        >
          {t}
        </Box>
      ))}
    </Box>
  );
}
