import { useId } from 'react';
import { Box } from '@mui/material';
import { COLORS } from '../theme/theme';

// Semicircle traced as a dense polyline rather than a single SVG arc command.
// A true elliptical-arc path whose start/end points sit exactly two radii
// apart (a perfect semicircle) fails to render the connecting curve in some
// engines — only the round line-caps at each end show up. A polyline has no
// such edge case.
const MINI_ARC =
  'M 7 28 L 7.38 24.1 L 8.52 20.35 L 10.37 16.89 L 12.86 13.86 L 15.89 11.37 L 19.35 9.52 L 23.1 8.38 L 27 8 L 30.9 8.38 L 34.65 9.52 L 38.11 11.37 L 41.14 13.86 L 43.63 16.89 L 45.48 20.35 L 46.62 24.1 L 47 28';

const FULL_ARC =
  'M 20 100 L 20.68 89.56 L 22.73 79.29 L 26.09 69.39 L 30.72 60 L 36.53 51.3 L 43.43 43.43 L 51.3 36.53 L 60 30.72 L 69.39 26.09 L 79.29 22.73 L 89.56 20.68 L 100 20 L 110.44 20.68 L 120.71 22.73 L 130.61 26.09 L 140 30.72 L 148.7 36.53 L 156.57 43.43 L 163.47 51.3 L 169.28 60 L 173.91 69.39 L 177.27 79.29 L 179.32 89.56 L 180 100';

// Energy is stored 0-100. Needle sweeps -90deg (Wiped out, left) through
// 0deg (straight up, mid) to +90deg (Wired, right).
function needleAngle(energy: number) {
  return (Math.max(0, Math.min(100, energy)) - 50) * 1.8;
}

export function MiniEnergyGauge({ energy }: { energy: number }) {
  const id = `energy-gauge-${useId().replace(/:/g, '')}`;
  const angle = needleAngle(energy);
  return (
    <svg viewBox="0 0 54 30" width={54} height={30}>
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={COLORS.accent} />
          <stop offset="100%" stopColor={COLORS.amber} />
        </linearGradient>
      </defs>
      <path d={MINI_ARC} fill="none" stroke={`url(#${id})`} strokeWidth={4} strokeLinecap="round" />
      <line
        x1={27}
        y1={28}
        x2={27}
        y2={10}
        stroke={COLORS.text}
        strokeWidth={2}
        strokeLinecap="round"
        transform={`rotate(${angle} 27 28)`}
      />
      <circle cx={27} cy={28} r={3} fill={COLORS.accent} />
    </svg>
  );
}

export function FullEnergyGauge({ energy }: { energy: number }) {
  const id = `energy-gauge-${useId().replace(/:/g, '')}`;
  const angle = needleAngle(energy);
  const label = energy < 33 ? 'Wiped out' : energy < 66 ? 'Steady' : 'Wired';

  return (
    <Box sx={{ bgcolor: COLORS.surface, borderRadius: '14px', p: 2.5, textAlign: 'center' }}>
      <svg viewBox="0 0 200 110" width={200} height={110} style={{ maxWidth: '100%' }}>
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLORS.accent} />
            <stop offset="100%" stopColor={COLORS.amber} />
          </linearGradient>
        </defs>
        <path d={FULL_ARC} fill="none" stroke={`url(#${id})`} strokeWidth={14} strokeLinecap="round" />
        <line
          x1={100}
          y1={100}
          x2={100}
          y2={32}
          stroke={COLORS.text}
          strokeWidth={3}
          strokeLinecap="round"
          transform={`rotate(${angle} 100 100)`}
        />
        <circle cx={100} cy={100} r={7} fill={COLORS.accent} />
      </svg>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: COLORS.textFaint, px: 0.5, mt: -0.75 }}>
        <span>Wiped out</span>
        <span>Wired</span>
      </Box>
      <Box sx={{ fontSize: 16, fontWeight: 600, mt: 1 }}>Energy: {label}</Box>
    </Box>
  );
}
