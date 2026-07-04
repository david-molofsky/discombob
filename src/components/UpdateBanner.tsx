import { Box, Typography, Button } from '@mui/material';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { COLORS } from '../theme/theme';

export default function UpdateBanner() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 78,
        bgcolor: COLORS.surface,
        border: `1px solid ${COLORS.accent}`,
        borderRadius: '14px',
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
        zIndex: 10,
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Update available</Typography>
        <Typography sx={{ fontSize: 12, color: COLORS.textFaint }}>A new version is ready.</Typography>
      </Box>
      <Button
        onClick={() => updateServiceWorker(true)}
        sx={{ bgcolor: COLORS.accent, color: '#0D2320', fontWeight: 600, fontSize: 13, px: 1.75, flexShrink: 0, '&:hover': { bgcolor: COLORS.accent } }}
      >
        Refresh
      </Button>
    </Box>
  );
}
