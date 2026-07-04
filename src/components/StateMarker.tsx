import { Box } from '@mui/material';
import { COLORS } from '../theme/theme';
import type { TaskState } from '../db/schemas';

export function nextState(state: TaskState): TaskState {
  if (state === 'not_started') return 'started';
  if (state === 'started') return 'done';
  return 'not_started';
}

export default function StateMarker({
  state,
  onClick,
  size = 22,
}: {
  state: TaskState;
  onClick?: () => void;
  size?: number;
}) {
  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
    cursor: onClick ? 'pointer' : 'default',
    border: `2px solid ${
      state === 'started' ? COLORS.amber : state === 'done' ? COLORS.accent : COLORS.textFaint
    }`,
    background:
      state === 'done'
        ? COLORS.accent
        : state === 'started'
        ? `linear-gradient(90deg, ${COLORS.amber} 50%, transparent 50%)`
        : 'transparent',
  };

  return <Box sx={style} onClick={onClick} />;
}
