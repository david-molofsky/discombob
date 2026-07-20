import { Box, Typography, Button } from '@mui/material';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { COLORS } from '../theme/theme';

const UPDATE_CHECK_INTERVAL_MS = 60_000;

export default function UpdateBanner() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      // GitHub Pages can cache sw.js aggressively, so the browser's own
      // 24h update check isn't frequent enough — poll explicitly, and
      // also check whenever the tab regains focus.
      setInterval(() => registration.update(), UPDATE_CHECK_INTERVAL_MS);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update();
      });
    },
  });

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
