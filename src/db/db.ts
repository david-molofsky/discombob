import Dexie, { type Table } from 'dexie';
import type { Task, MoodEntry } from './schemas';

export class DiscombobDatabase extends Dexie {
  tasks!: Table<Task, number>;
  moodEntries!: Table<MoodEntry, number>;

  constructor() {
    super('DiscombobDatabase');
    // No multiEntry indexes anywhere — iOS Safari compatibility.
    // Schema changes require bumping this version() and adding an upgrade path.
    this.version(1).stores({
      tasks: '++id, location, origin, capturedAt',
      moodEntries: '++id, dateISO, timestamp',
    });
  }
}

export const db = new DiscombobDatabase();
