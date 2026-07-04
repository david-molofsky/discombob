import { useRef, useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { COLORS } from '../theme/theme';
import { arrayMove } from '../utils/arrayMove';

const GAP_PX = 10;

export function GripHandle(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Box
      {...props}
      sx={{
        color: COLORS.textFaint,
        fontSize: 16,
        letterSpacing: '2px',
        lineHeight: '8px',
        px: 0.5,
        py: 0.5,
        flexShrink: 0,
        cursor: 'grab',
        touchAction: 'none',
      }}
    >
      ⣿
    </Box>
  );
}

export default function ReorderableList<T extends { id?: number; order: number }>({
  items,
  onReorder,
  renderItem,
}: {
  items: T[];
  onReorder: (draggedId: number, newOrder: number) => void;
  renderItem: (item: T, dragHandleProps: { onPointerDown: (e: React.PointerEvent) => void }, isDragging: boolean) => React.ReactNode;
}) {
  const [order, setOrder] = useState<T[]>(items);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const dragInfo = useRef<{ startIndex: number; startY: number; rowHeight: number; base: T[] } | null>(null);
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Resync from upstream data when not actively dragging.
  useEffect(() => {
    if (draggingId == null) setOrder(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const startDrag = (item: T) => (e: React.PointerEvent) => {
    e.stopPropagation();
    if (item.id == null) return;
    const draggedId = item.id;
    const startIndex = order.findIndex((i) => i.id === draggedId);
    const rowEl = rowRefs.current.get(draggedId);
    const rowHeight = rowEl?.getBoundingClientRect().height ?? 60;
    dragInfo.current = { startIndex, startY: e.clientY, rowHeight, base: order };
    setDraggingId(draggedId);

    const handleMove = (ev: PointerEvent) => {
      if (!dragInfo.current) return;
      const { startIndex, startY, rowHeight, base } = dragInfo.current;
      const deltaY = ev.clientY - startY;
      const deltaIndex = Math.round(deltaY / (rowHeight + GAP_PX));
      const newIndex = Math.max(0, Math.min(base.length - 1, startIndex + deltaIndex));
      setOrder(arrayMove(base, startIndex, newIndex));
    };

    const handleUp = () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
      setDraggingId(null);
      dragInfo.current = null;
      setOrder((current) => {
        const finalIndex = current.findIndex((i) => i.id === draggedId);
        const before = current[finalIndex - 1];
        const after = current[finalIndex + 1];
        let newOrder: number;
        if (before && after) {
          newOrder = (before.order + after.order) / 2;
        } else if (before) {
          newOrder = before.order + 1000;
        } else if (after) {
          newOrder = after.order - 1000;
        } else {
          newOrder = current[finalIndex]?.order ?? Date.now();
        }
        onReorder(draggedId, newOrder);
        return current;
      });
    };

    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${GAP_PX}px` }}>
      {order.map((item) => (
        <Box
          key={item.id}
          ref={(el: HTMLDivElement | null) => {
            if (item.id != null) {
              if (el) rowRefs.current.set(item.id, el);
              else rowRefs.current.delete(item.id);
            }
          }}
          sx={{
            transition: draggingId === item.id ? 'none' : 'transform 0.15s ease',
            ...(draggingId === item.id && {
              boxShadow: '0 10px 24px rgba(0,0,0,0.45)',
              borderRadius: '14px',
              transform: 'scale(1.02)',
              position: 'relative',
              zIndex: 2,
            }),
          }}
        >
          {renderItem(item, { onPointerDown: startDrag(item) }, draggingId === item.id)}
        </Box>
      ))}
    </Box>
  );
}
