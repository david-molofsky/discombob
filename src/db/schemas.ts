import { z } from 'zod';

// A task can live in the Someday "To Do" tab, be moved to Today, or be
// completed from Someday. Today-list tasks track a separate 3-state marker.
export const TaskLocation = z.enum(['someday_todo', 'today', 'someday_completed']);
export type TaskLocation = z.infer<typeof TaskLocation>;

export const TaskState = z.enum(['not_started', 'started', 'done']);
export type TaskState = z.infer<typeof TaskState>;

export const TaskOrigin = z.enum(['someday', 'direct']);
export type TaskOrigin = z.infer<typeof TaskOrigin>;

export const TaskSchema = z.object({
  id: z.number().optional(),
  text: z.string().min(1),
  location: TaskLocation,
  state: TaskState,
  origin: TaskOrigin,
  capturedAt: z.string(), // ISO timestamp
  movedToTodayAt: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  order: z.number(), // manual sort position within its current location
});
export type Task = z.infer<typeof TaskSchema>;

export const MOOD_SCALE = [
  { value: 1, emoji: '😡', label: 'Awful' },
  { value: 2, emoji: '😞', label: 'Rough' },
  { value: 3, emoji: '😕', label: 'Off' },
  { value: 4, emoji: '😐', label: 'Okay, hanging in there' },
  { value: 5, emoji: '🙂', label: 'Good' },
  { value: 6, emoji: '😄', label: 'Great' },
  { value: 7, emoji: '🤩', label: 'Amazing' },
] as const;

export const DEFAULT_TRIGGERS = [
  'Work stress',
  'Poor sleep',
  'Overstimulation',
  'Social',
  'Skipped meal',
];

export const CustomTriggerSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1),
});
export type CustomTrigger = z.infer<typeof CustomTriggerSchema>;

export const MoodEntrySchema = z.object({
  id: z.number().optional(),
  dateISO: z.string(), // YYYY-MM-DD, for grouping/backdating
  timestamp: z.string(), // full ISO timestamp of the check-in
  moodValue: z.number().min(1).max(7),
  energy: z.number().min(0).max(100),
  triggers: z.string(), // JSON-stringified string[] — no multiEntry index (iOS Safari)
  note: z.string().optional().default(''),
});
export type MoodEntry = z.infer<typeof MoodEntrySchema>;
