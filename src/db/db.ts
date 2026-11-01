import Dexie, { type Table } from 'dexie';
import type { Task, MoodEntry, CustomTrigger, CustomTag } from './schemas';
import type { NovelChapter, NovelQuest, NovelSession, NovelXpTransaction } from './novelQuestSchemas';

export class DiscombobDatabase extends Dexie {
  tasks!: Table<Task, number>;
  moodEntries!: Table<MoodEntry, number>;
  customTriggers!: Table<CustomTrigger, number>;
  customTags!: Table<CustomTag, number>;
  novelChapters!: Table<NovelChapter, number>;
  novelQuests!: Table<NovelQuest, number>;
  novelSessions!: Table<NovelSession, number>;
  novelXpTransactions!: Table<NovelXpTransaction, number>;

  constructor() {
    super('DiscombobDatabase');
    this.version(1).stores({ tasks: '++id, location, origin, capturedAt', moodEntries: '++id, dateISO, timestamp' });
    this.version(2).stores({ tasks: '++id, location, origin, capturedAt, order', moodEntries: '++id, dateISO, timestamp' }).upgrade(async (tx) => {
      await tx.table('tasks').toCollection().modify((task) => { task.order = Date.parse(task.capturedAt) || Date.now(); });
    });
    this.version(3).stores({ tasks: '++id, location, origin, capturedAt, order', moodEntries: '++id, dateISO, timestamp', customTriggers: '++id, name' });
    this.version(4).stores({ tasks: '++id, location, origin, capturedAt, order', moodEntries: '++id, dateISO, timestamp', customTriggers: '++id, name', customTags: '++id, name' });
    // v5 adds Novel Quest tables without changing existing Discombob records.
    this.version(5).stores({
      tasks: '++id, location, origin, capturedAt, order',
      moodEntries: '++id, dateISO, timestamp',
      customTriggers: '++id, name',
      customTags: '++id, name',
      novelChapters: '++id, order, stage',
      novelQuests: '++id, status, createdAt, chapterId',
      novelSessions: '++id, status, startedAt, endedAt, chapterId',
      novelXpTransactions: '++id, sourceKey, sourceType, sourceId, createdAt',
    });
  }
}
export const db = new DiscombobDatabase();
