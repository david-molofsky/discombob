import Dexie, { type Table } from 'dexie';
import type { Task, MoodEntry, CustomTrigger } from './schemas';

export class DiscombobDatabase extends Dexie {
  tasks!: Table<Task, number>;
  moodEntries!: Table<MoodEntry, number>;
  customTriggers!: Table<CustomTrigger, number>;

  constructor() {
    super('DiscombobDatabase');
    // No multiEntry indexes anywhere — iOS Safari compatibility.
    // Schema changes require bumping this version() and adding an upgrade path.
    this.version(1).stores({
      tasks: '++id, location, origin, capturedAt',
      moodEntries: '++id, dateISO, timestamp',
    });

    // v2: added `order` (manual drag-to-reorder position within a location).
    // Existing rows get order = capturedAt timestamp, so original
    // chronological order is preserved until the person reorders manually.
    this.version(2)
      .stores({
        tasks: '++id, location, origin, capturedAt, order',
        moodEntries: '++id, dateISO, timestamp',
      })
      .upgrade(async (tx) => {
        await tx
          .table('tasks')
          .toCollection()
          .modify((task) => {
            task.order = Date.parse(task.capturedAt) || Date.now();
          });
      });

    // v3: added `customTriggers` — triggers the person types in themselves on
    // Mood Entry, persisted so they show up as regular chips on future check-ins.
    // Purely additive (new table), no upgrade path needed.
    this.version(3).stores({
      tasks: '++id, location, origin, capturedAt, order',
      moodEntries: '++id, dateISO, timestamp',
      customTriggers: '++id, name',
    });
  }
}

export const db = new DiscombobDatabase();
