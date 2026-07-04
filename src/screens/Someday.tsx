import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useLiveQuery } from 'dexie-react-hooks';
import dayjs from 'dayjs';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';
import { db } from '../db/db';
import { COLORS } from '../theme/theme';
import QuickAddBar from '../components/QuickAddBar';
import SwipeableItem from '../components/SwipeableItem';
import StateMarker from '../components/StateMarker';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import type { Task } from '../db/schemas';

type Tab = 'todo' | 'today' | 'completed';

export default function Someday() {
  const [tab, setTab] = useState<Tab>('todo');
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const todoItems = useLiveQuery(async () => {
    const items = await db.tasks.where('location').equals('someday_todo').toArray();
    items.sort((a, b) => (a.capturedAt < b.capturedAt ? 1 : -1));
    return items;
  }, []);

  const todayFromSomeday = useLiveQuery(async () => {
    const items = await db.tasks.where('location').equals('today').toArray();
    items.sort((a, b) => (a.capturedAt < b.capturedAt ? 1 : -1));
    return items.filter((t) => t.origin === 'someday');
  }, []);

  const completedItems = useLiveQuery(async () => {
    const items = await db.tasks.where('location').equals('someday_completed').toArray();
    items.sort((a, b) => ((a.completedAt ?? '') < (b.completedAt ?? '') ? 1 : -1));
    return items;
  }, []);

  const addItem = async (text: string) => {
    await db.tasks.add({
      text,
      location: 'someday_todo',
      state: 'not_started',
      origin: 'someday',
      capturedAt: new Date().toISOString(),
      movedToTodayAt: null,
      completedAt: null,
    });
  };

  const moveToToday = async (task: Task) => {
    if (task.id == null) return;
    await db.tasks.update(task.id, {
      location: 'today',
      movedToTodayAt: new Date().toISOString(),
    });
  };

  const markCompleted = async (task: Task) => {
    if (task.id == null) return;
    await db.tasks.update(task.id, {
      location: 'someday_completed',
      completedAt: new Date().toISOString(),
    });
  };

  const sendBackToTodo = async (task: Task) => {
    if (task.id == null) return;
    await db.tasks.update(task.id, {
      location: 'someday_todo',
      movedToTodayAt: null,
      state: 'not_started',
    });
  };

  const confirmDelete = async () => {
    if (deleteTarget?.id != null) {
      await db.tasks.delete(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2.5, pt: 3, pb: 0 }}>
        <Typography variant="h4" sx={{ fontSize: 22 }}>
          Someday
        </Typography>
        <Typography sx={{ fontSize: 13, color: COLORS.textFaint, mt: 0.25, mb: 2 }}>
          Capture it now, sort it later
        </Typography>

        {tab === 'todo' && (
          <Box sx={{ mb: 1.75 }}>
            <QuickAddBar placeholder="Type anything and hit +..." onAdd={addItem} />
          </Box>
        )}

        <Box
          sx={{
            display: 'flex',
            bgcolor: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: '100px',
            p: 0.5,
            mb: 1.5,
          }}
        >
          {(['todo', 'today', 'completed'] as Tab[]).map((t) => (
            <Box
              key={t}
              onClick={() => setTab(t)}
              sx={{
                flex: 1,
                textAlign: 'center',
                py: 1,
                fontSize: 13,
                borderRadius: '100px',
                cursor: 'pointer',
                color: tab === t ? '#0D2320' : COLORS.textFaint,
                bgcolor: tab === t ? COLORS.accent : 'transparent',
                fontWeight: tab === t ? 600 : 400,
              }}
            >
              {t === 'todo' ? 'To Do' : t === 'today' ? 'Today' : 'Completed'}
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, pb: 2.5, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {tab === 'todo' &&
          (!todoItems || todoItems.length === 0 ? (
            <EmptyState text="Nothing captured yet. Use the box above to add anything." />
          ) : (
            todoItems.map((item) => (
              <SwipeableItem
                key={item.id}
                leftAction={{
                  label: 'Today',
                  icon: <ArrowForwardIcon sx={{ fontSize: 18 }} />,
                  color: COLORS.accent,
                  textColor: '#0D2320',
                  onCommit: () => moveToToday(item),
                }}
                rightAction={{
                  label: 'Complete',
                  icon: <CheckIcon sx={{ fontSize: 18 }} />,
                  color: COLORS.amber,
                  textColor: '#2B1B04',
                  onCommit: () => markCompleted(item),
                }}
                onLongPress={() => setDeleteTarget(item)}
              >
                <ItemCard text={item.text} meta={`Captured ${dayjs(item.capturedAt).format('MMM D, h:mm A')}`} />
              </SwipeableItem>
            ))
          ))}

        {tab === 'today' &&
          (!todayFromSomeday || todayFromSomeday.length === 0 ? (
            <EmptyState text="Nothing from Someday is in Today right now." />
          ) : (
            todayFromSomeday.map((item) => (
              <SwipeableItem
                key={item.id}
                leftAction={{
                  label: 'To Do',
                  icon: <ArrowBackIcon sx={{ fontSize: 18 }} />,
                  color: COLORS.textDim,
                  textColor: '#14161A',
                  onCommit: () => sendBackToTodo(item),
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: COLORS.surface,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '14px',
                    p: 1.75,
                  }}
                >
                  <StateMarker state={item.state} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 14 }}>{item.text}</Typography>
                    <Typography sx={{ fontSize: 11, color: COLORS.textFaint, mt: 0.5 }}>
                      Moved to Today {dayjs(item.movedToTodayAt ?? item.capturedAt).format('h:mm A')}
                    </Typography>
                  </Box>
                </Box>
              </SwipeableItem>
            ))
          ))}

        {tab === 'completed' &&
          (!completedItems || completedItems.length === 0 ? (
            <EmptyState text="Nothing completed yet." />
          ) : (
            completedItems.map((item) => (
              <SwipeableItem key={item.id} onLongPress={() => setDeleteTarget(item)}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: COLORS.surface,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '14px',
                    p: 1.75,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 14, textDecoration: 'line-through', color: COLORS.textFaint }}>
                      {item.text}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: COLORS.textFaint, mt: 0.5 }}>
                      Completed {dayjs(item.completedAt).format('MMM D')}
                    </Typography>
                  </Box>
                  <CheckIcon sx={{ color: COLORS.accent, fontSize: 18 }} />
                </Box>
              </SwipeableItem>
            ))
          ))}
      </Box>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        itemText={deleteTarget?.text ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
}

function ItemCard({ text, meta }: { text: string; meta: string }) {
  return (
    <Box
      sx={{
        bgcolor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '14px',
        p: 1.75,
      }}
    >
      <Typography sx={{ fontSize: 14, lineHeight: 1.4 }}>{text}</Typography>
      <Typography sx={{ fontSize: 11, color: COLORS.textFaint, mt: 0.5 }}>{meta}</Typography>
    </Box>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 4,
        px: 1.5,
        color: COLORS.textFaint,
        fontSize: 13,
        border: `1px dashed ${COLORS.border}`,
        borderRadius: '14px',
      }}
    >
      {text}
    </Box>
  );
}
