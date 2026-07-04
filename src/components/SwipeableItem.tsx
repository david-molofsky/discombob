import { useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useLongPress } from './useLongPress';

const THRESHOLD = 70;
const MAX_DRAG = 110;

type ActionConfig = {
  label: string;
  icon: React.ReactNode;
  color: string;
  textColor: string;
  onCommit: () => void;
};

export default function SwipeableItem({
  children,
  leftAction,
  rightAction,
  onLongPress,
}: {
  children: React.ReactNode;
  leftAction?: ActionConfig; // revealed on swipe RIGHT (item slides right)
  rightAction?: ActionConfig; // revealed on swipe LEFT (item slides left)
  onLongPress?: () => void;
}) {
  const [dragX, setDragX] = useState(0);
  const dragging = useRef(false);
  const startX = useRef(0);

  const longPress = useLongPress(() => {
    onLongPress?.();
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    longPress.onPointerDown();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    let delta = e.clientX - startX.current;
    if (delta > 0 && !leftAction) delta = 0;
    if (delta < 0 && !rightAction) delta = 0;
    delta = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, delta));
    setDragX(delta);
    if (Math.abs(delta) > 8) longPress.onPointerUp(); // real drag cancels long-press
  };

  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    longPress.onPointerUp();

    if (longPress.didFire()) {
      setDragX(0);
      return;
    }

    if (dragX > THRESHOLD && leftAction) {
      leftAction.onCommit();
    } else if (dragX < -THRESHOLD && rightAction) {
      rightAction.onCommit();
    }
    setDragX(0);
  };

  const progress = Math.min(1, Math.abs(dragX) / THRESHOLD);

  return (
    <Box sx={{ position: 'relative', borderRadius: '14px', overflow: 'hidden' }}>
      {leftAction && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: 90,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            fontSize: 11,
            fontWeight: 600,
            bgcolor: leftAction.color,
            color: leftAction.textColor,
            opacity: dragX > 0 ? progress : 0,
          }}
        >
          {leftAction.icon}
          {leftAction.label}
        </Box>
      )}
      {rightAction && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: 90,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            fontSize: 11,
            fontWeight: 600,
            bgcolor: rightAction.color,
            color: rightAction.textColor,
            opacity: dragX < 0 ? progress : 0,
          }}
        >
          {rightAction.icon}
          {rightAction.label}
        </Box>
      )}
      <Box
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        sx={{
          position: 'relative',
          transform: `translateX(${dragX}px)`,
          transition: dragging.current ? 'none' : 'transform 0.2s ease',
          touchAction: 'pan-y',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
