export type NovelChapterStage = 'not_started' | 'in_progress' | 'first_edit_complete' | 'review_complete' | 'finalised';
export type NovelSkill = 'storyteller' | 'wordsmith' | 'character_builder' | 'worldbuilder' | 'editor';
export type NovelQuestStatus = 'active' | 'completed';
export interface NovelChapter { id?: number; title: string; order: number; stage: NovelChapterStage; createdAt: string; updatedAt: string; }
export interface NovelQuest { id?: number; title: string; description: string; skill: NovelSkill; xp: number; chapterId?: number; status: NovelQuestStatus; createdAt: string; completedAt?: string; }
export interface NovelSession { id?: number; startedAt: string; endedAt?: string; durationMs: number; pausedAt?: string; status: 'active' | 'paused' | 'completed'; chapterId?: number; chapterLabel?: string; skill?: NovelSkill; notes?: string; }
export interface NovelXpTransaction { id?: number; sourceKey: string; sourceType: 'session' | 'quest'; sourceId: number; amount: number; skill?: NovelSkill; createdAt: string; }
