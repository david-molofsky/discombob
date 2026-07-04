import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useLiveQuery } from 'dexie-react-hooks';
import dayjs from 'dayjs';
import { db } from '../db/db';
import { COLORS } from '../theme/theme';
import MoodCard from '../components/MoodCard';
import QuickAddBar from '../components/QuickAddBar';
import StateMarker, { nextState } from '../components/StateMarker';
import ReorderableList, { GripHandle } from '../components/ReorderableList';
import TaskActionsDialog from '../components/TaskActionsDialog';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import TagChips from '../components/TagChips';
import { useLongPress } from '../components/useLongPress';
import type { Task } from '../db/schemas';

export default function Home() {
  const todayStr = dayjs().format('YYYY-MM-DD');
  const [actionsTarget, setActionsTarget] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const latestMoodToday = useLiveQuery(async () => {
    const entries = await db.moodEntries.where('dateISO').equals(todayStr).toArray();
    entries.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    return entries[0];
  }, [todayStr]);

  const todayTasks = useLiveQuery(async () => {
    const tasks = await db.tasks.where('location').equals('today').toArray();
    tasks.sort((a, b) => a.order - b.order);
    return tasks;
  }, []);

  const addTask = async (text: string) => {
    const now = new Date().toISOString();
    await db.tasks.add({
      text,
      location: 'today',
      state: 'not_started',
      origin: 'direct',
      capturedAt: now,
      movedToTodayAt: now,
      completedAt: null,
      order: Date.now(),
      tags: [],
    });
  };

  const reorderToday = async (draggedId: number, newOrder: number) => {
    await db.tasks.update(draggedId, { order: newOrder });
  };

  const cycleState = async (task: Task) => {
    if (task.id == null) return;
    const newState = nextState(task.state);
    if (newState === 'done') {
      // Completion is a one-way trip: leave Today entirely and land in the
      // shared Completed list (Someday's Completed tab), regardless of
      // whether this task originated in Someday or was added directly here.
      await db.tasks.update(task.id, {
        state: 'done',
        location: 'someday_completed',
        completedAt: new Date().toISOString(),
      });
    } else {
      await db.tasks.update(task.id, { state: newState, completedAt: null });
    }
  };

  const saveTags = async (tags: string[]) => {
    if (actionsTarget?.id == null) return;
    await db.tasks.update(actionsTarget.id, { tags });
  };

  const confirmDelete = async () => {
    if (deleteTarget?.id != null) {
      await db.tasks.delete(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, pt: 3, pb: 2.5, display: 'flex', flexDirection: 'column', gap: 2.75 }}>
      <Box>
        <Typography variant="h4" sx={{ fontSize: 22 }}>
          Discombob
        </Typography>
        <Typography sx={{ fontSize: 13, color: COLORS.textFaint, mt: 0.25 }}>
          {dayjs().format('dddd, MMMM D')}
        </Typography>
      </Box>

      <Box>
        <SectionLabel>Mood</SectionLabel>
        <MoodCard latestToday={latestMoodToday} />
      </Box>

      <Box>
        <SectionLabel>Add to Today</SectionLabel>
        <QuickAddBar placeholder="Type a task and hit +..." onAdd={addTask} />
      </Box>

      <Box>
        <SectionLabel>Today</SectionLabel>
        {!todayTasks || todayTasks.length === 0 ? (
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
            Nothing on your plate yet.
            <br />
            Add a task above, or triage from Someday.
          </Box>
        ) : (
          <ReorderableList
            items={todayTasks}
            onReorder={reorderToday}
            renderItem={(task, dragHandleProps) => (
              <TodayRow
                task={task}
                dragHandleProps={dragHandleProps}
                onCycleState={() => cycleState(task)}
                onLongPress={() => setActionsTarget(task)}
              />
            )}
          />
        )}
      </Box>

      <TaskActionsDialog
        open={!!actionsTarget}
        task={actionsTarget}
        onClose={() => setActionsTarget(null)}
        onSaveTags={saveTags}
        onRequestDelete={() => setDeleteTarget(actionsTarget)}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        itemText={deleteTarget?.text ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </Box>
  );
}

function TodayRow({
  task,
  dragHandleProps,
  onCycleState,
  onLongPress,
}: {
  task: Task;
  dragHandleProps: { onPointerDown: (e: React.PointerEvent) => void };
  onCycleState: () => void;
  onLongPress: () => void;
}) {
  const longPress = useLongPress(onLongPress);

  return (
    <Box
      onPointerDown={longPress.onPointerDown}
      onPointerUp={longPress.onPointerUp}
      onPointerLeave={longPress.onPointerLeave}
      onPointerCancel={longPress.onPointerCancel}
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
      <StateMarker state={task.state} onClick={onCycleState} />
      <Box sx={{ flex: 1 }}>
        <Typography
          sx={{
            fontSize: 14,
            textDecoration: task.state === 'done' ? 'line-through' : 'none',
            color: task.state === 'done' ? COLORS.textFaint : COLORS.text,
          }}
        >
          {task.text}
        </Typography>
        <TagChips tags={task.tags} />
      </Box>
      <GripHandle {...dragHandleProps} />
    </Box>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: 12,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        color: COLORS.textFaint,
        mb: 1.25,
      }}
    >
      {children}
    </Typography>
  );
}
