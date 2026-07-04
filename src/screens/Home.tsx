import { Box, Typography } from '@mui/material';
import { useLiveQuery } from 'dexie-react-hooks';
import dayjs from 'dayjs';
import { db } from '../db/db';
import { COLORS } from '../theme/theme';
import MoodCard from '../components/MoodCard';
import QuickAddBar from '../components/QuickAddBar';
import StateMarker, { nextState } from '../components/StateMarker';
import ReorderableList, { GripHandle } from '../components/ReorderableList';
import type { Task } from '../db/schemas';

export default function Home() {
  const todayStr = dayjs().format('YYYY-MM-DD');

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
                <StateMarker state={task.state} onClick={() => cycleState(task)} />
                <Typography
                  sx={{
                    flex: 1,
                    fontSize: 14,
                    textDecoration: task.state === 'done' ? 'line-through' : 'none',
                    color: task.state === 'done' ? COLORS.textFaint : COLORS.text,
                  }}
                >
                  {task.text}
                </Typography>
                {task.origin === 'someday' && (
                  <Box
                    sx={{
                      fontSize: 10,
                      color: COLORS.textFaint,
                      bgcolor: COLORS.surfaceRaised,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '100px',
                      px: 1,
                      py: 0.375,
                      flexShrink: 0,
                    }}
                  >
                    Someday
                  </Box>
                )}
                <GripHandle {...dragHandleProps} />
              </Box>
            )}
          />
        )}
      </Box>
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
