import { useRef } from 'react';

export function useLongPress(onLongPress: () => void, delay = 500) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  const start = () => {
    firedRef.current = false;
    timer.current = setTimeout(() => {
      firedRef.current = true;
      onLongPress();
    }, delay);
  };

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
  };

  return {
    onPointerDown: start,
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    // exposes whether the long press just fired, so a swipe handler
    // can ignore the trailing click/tap that follows
    didFire: () => firedRef.current,
  };
}
