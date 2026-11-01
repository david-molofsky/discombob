import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, LinearProgress, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { NovelChapter, NovelChapterStage, NovelQuest, NovelSkill, NovelSession } from '../db/novelQuestSchemas';
import { COLORS } from '../theme/theme';

const stages: { value: NovelChapterStage; label: string }[] = [
  { value: 'not_started', label: 'Not started' }, { value: 'in_progress', label: 'In progress' },
  { value: 'first_edit_complete', label: 'First edit complete' }, { value: 'review_complete', label: 'Review complete' }, { value: 'finalised', label: 'Finalised' },
];
const skills: { value: NovelSkill; label: string }[] = [
  { value: 'storyteller', label: 'Storyteller' }, { value: 'wordsmith', label: 'Wordsmith' },
  { value: 'character_builder', label: 'Character Builder' }, { value: 'worldbuilder', label: 'Worldbuilder' }, { value: 'editor', label: 'Editor' },
];
const templates: { title: string; description: string; skill: NovelSkill; xp: number }[] = [
  { title: 'Review a chapter', description: 'Review the chapter and identify the main changes needed.', skill: 'editor', xp: 50 },
  { title: 'Revise a scene', description: 'Make a substantive revision to one scene.', skill: 'wordsmith', xp: 30 },
  { title: 'Resolve a plot issue', description: 'Resolve an inconsistency or structural problem.', skill: 'storyteller', xp: 75 },
  { title: 'Review a character arc', description: 'Check a character’s motivation, development and relationships.', skill: 'character_builder', xp: 75 },
  { title: 'Research the setting', description: 'Research and record details needed for the story world.', skill: 'worldbuilder', xp: 30 },
  { title: 'Proofread a section', description: 'Check continuity, grammar and presentation.', skill: 'editor', xp: 20 },
];
const thresholds = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];
const levelTitles = ['Novice', 'Apprentice', 'Storyteller', 'Wordsmith', 'Scribe', 'Author', 'Master Storyteller', 'Wordsmith Elite', 'Literary Architect', 'Novelist'];
const skillLabel = (skill?: NovelSkill) => skills.find((s) => s.value === skill)?.label ?? 'General';
const durationOf = (s: NovelSession, now: number) => s.status === 'paused' ? s.durationMs : s.durationMs + Math.max(0, now - new Date(s.startedAt).getTime());
const formatTime = (ms: number) => [Math.floor(ms / 3600000), Math.floor((ms % 3600000) / 60000), Math.floor((ms % 60000) / 1000)].map((n) => String(n).padStart(2, '0')).join(':');

export default function NovelQuest() {
  const chapters = useLiveQuery(() => db.novelChapters.orderBy('order').toArray(), []) ?? [];
  const quests = useLiveQuery(() => db.novelQuests.orderBy('createdAt').reverse().toArray(), []) ?? [];
  const sessions = useLiveQuery(() => db.novelSessions.toArray(), []) ?? [];
  const transactions = useLiveQuery(() => db.novelXpTransactions.toArray(), []) ?? [];
  const activeSession = sessions.find((s) => s.status === 'active' || s.status === 'paused');
  const [now, setNow] = useState(Date.now());
  const [chapterOpen, setChapterOpen] = useState(false);
  const [questOpen, setQuestOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [chapterTitle, setChapterTitle] = useState('');
  const [questTitle, setQuestTitle] = useState('');
  const [questDescription, setQuestDescription] = useState('');
  const [questSkill, setQuestSkill] = useState<NovelSkill>('editor');
  const [questXp, setQuestXp] = useState(30);
  const [questChapter, setQuestChapter] = useState<number | ''>('');
  const [minutes, setMinutes] = useState(30);
  const [sessionChapter, setSessionChapter] = useState<number | ''>('');
  const [sessionSkill, setSessionSkill] = useState<NovelSkill>('editor');

  useEffect(() => {
    if (!activeSession || activeSession.status !== 'active') return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [activeSession?.id, activeSession?.status]);

  const totalXp = transactions.reduce((sum, t) => sum + t.amount, 0);
  const level = thresholds.reduce((current, threshold, i) => totalXp >= threshold ? i : current, 0);
  const currentThreshold = thresholds[level] ?? 0;
  const nextThreshold = thresholds[level + 1] ?? currentThreshold + 1000;
  const progress = Math.min(100, ((totalXp - currentThreshold) / Math.max(1, nextThreshold - currentThreshold)) * 100);
  const totalMinutes = Math.floor(sessions.filter((s) => s.status === 'completed').reduce((sum, s) => sum + s.durationMs, 0) / 60000);
  const completedQuests = quests.filter((q) => q.status === 'completed').length;
  const finalised = chapters.filter((c) => c.stage === 'finalised').length;
  const openQuests = quests.filter((q) => q.status === 'active').slice(0, 4);
  const timerValue = activeSession ? durationOf(activeSession, now) : 0;

  const addChapter = async () => {
    const title = chapterTitle.trim();
    if (!title) return;
    const timestamp = new Date().toISOString();
    await db.novelChapters.add({ title, order: chapters.length ? Math.max(...chapters.map((c) => c.order)) + 1 : 0, stage: 'not_started', createdAt: timestamp, updatedAt: timestamp });
    setChapterTitle(''); setChapterOpen(false);
  };
  const addQuest = async (template?: typeof templates[number]) => {
    const title = template?.title ?? questTitle.trim();
    if (!title) return;
    await db.novelQuests.add({ title, description: template?.description ?? questDescription.trim(), skill: template?.skill ?? questSkill, xp: template?.xp ?? Math.max(0, Math.min(500, questXp)), chapterId: template ? undefined : (questChapter === '' ? undefined : questChapter), status: 'active', createdAt: new Date().toISOString() });
    setQuestTitle(''); setQuestDescription(''); setQuestOpen(false);
  };
  const start = async () => {
    if (!activeSession) await db.novelSessions.add({ startedAt: new Date().toISOString(), durationMs: 0, status: 'active', chapterId: sessionChapter === '' ? undefined : sessionChapter, skill: sessionSkill });
  };
  const pause = async () => {
    if (activeSession?.id && activeSession.status === 'active') await db.novelSessions.update(activeSession.id, { status: 'paused', durationMs: durationOf(activeSession, Date.now()), pausedAt: new Date().toISOString() });
  };
  const resume = async () => {
    if (activeSession?.id && activeSession.status === 'paused') await db.novelSessions.update(activeSession.id, { status: 'active', startedAt: new Date().toISOString(), pausedAt: undefined });
  };
  const awardSession = async (id: number, durationMs: number, skill?: NovelSkill) => {
    const xp = Math.floor(durationMs / 900000) * 10;
    if (xp > 0 && !(await db.novelXpTransactions.where('sourceKey').equals('session:' + id).first())) {
      await db.novelXpTransactions.add({ sourceKey: 'session:' + id, sourceType: 'session', sourceId: id, amount: xp, skill, createdAt: new Date().toISOString() });
    }
  };
  const finish = async () => {
    if (!activeSession?.id) return;
    const durationMs = durationOf(activeSession, Date.now());
    await db.transaction('rw', db.novelSessions, db.novelXpTransactions, async () => {
      await db.novelSessions.update(activeSession.id!, { status: 'completed', durationMs, endedAt: new Date().toISOString(), pausedAt: undefined });
      await awardSession(activeSession.id!, durationMs, activeSession.skill);
    });
  };
  const addManualSession = async () => {
    const durationMs = Math.max(0, minutes) * 60000;
    const timestamp = new Date().toISOString();
    const id = await db.novelSessions.add({ startedAt: new Date(Date.now() - durationMs).toISOString(), endedAt: timestamp, durationMs, status: 'completed', chapterId: sessionChapter === '' ? undefined : sessionChapter, skill: sessionSkill });
    await awardSession(id, durationMs, sessionSkill);
    setSessionOpen(false);
  };
  const completeQuest = async (quest: NovelQuest) => {
    if (quest.id == null || quest.status === 'completed') return;
    const timestamp = new Date().toISOString();
    await db.transaction('rw', db.novelQuests, db.novelXpTransactions, async () => {
      await db.novelQuests.update(quest.id!, { status: 'completed', completedAt: timestamp });
      const key = 'quest:' + quest.id;
      if (!(await db.novelXpTransactions.where('sourceKey').equals(key).first())) await db.novelXpTransactions.add({ sourceKey: key, sourceType: 'quest', sourceId: quest.id!, amount: quest.xp, skill: quest.skill, createdAt: timestamp });
    });
  };
  const updateStage = async (chapter: NovelChapter, stage: NovelChapterStage) => {
    if (chapter.id != null) await db.novelChapters.update(chapter.id, { stage, updatedAt: new Date().toISOString() });
  };

  return <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, pt: 3, pb: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
    <Box><Typography variant="h4" sx={{ fontSize: 24 }}>Novel Quest</Typography><Typography sx={{ color: COLORS.textDim, fontSize: 13 }}>Your writing adventure</Typography></Box>
    <Box sx={{ p: 2, border: '1px solid ' + COLORS.border, borderRadius: 3, bgcolor: COLORS.surface }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography fontWeight={700}>{levelTitles[level] ?? 'Novelist'}</Typography><Typography variant="caption" color="text.secondary">Level {level + 1} · {totalXp.toLocaleString()} total XP</Typography></Box><Chip label={'Level ' + (level + 1)} color="primary" size="small" /></Stack>
      <LinearProgress variant="determinate" value={progress} sx={{ mt: 1.5, height: 8, borderRadius: 5 }} /><Typography variant="caption" color="text.secondary">{Math.max(0, nextThreshold - totalXp)} XP to next level</Typography>
    </Box>
    <Stack direction="row" spacing={1}><Stat label="Writing time" value={Math.floor(totalMinutes / 60) + 'h ' + (totalMinutes % 60) + 'm'} /><Stat label="Tasks done" value={String(completedQuests)} /><Stat label="Chapters" value={finalised + '/' + chapters.length} /></Stack>
    <Box sx={{ p: 2, border: '1px solid ' + COLORS.border, borderRadius: 3, bgcolor: COLORS.surface }}>
      <Typography fontWeight={700}>Writing session</Typography><Typography variant="h3" textAlign="center" sx={{ fontVariantNumeric: 'tabular-nums', my: 1.5 }}>{formatTime(timerValue)}</Typography>
      <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mb: 1.5 }}>{activeSession?.status === 'paused' ? 'Session paused' : activeSession ? 'Session in progress' : 'Ready when you are'}</Typography>
      {!activeSession ? <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => void start()} fullWidth>Start writing</Button> : activeSession.status === 'paused' ? <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => void resume()} fullWidth>Resume session</Button> : <Stack direction="row" spacing={1}><Button variant="outlined" startIcon={<PauseIcon />} onClick={() => void pause()} fullWidth>Pause</Button><Button variant="contained" color="success" startIcon={<StopIcon />} onClick={() => void finish()} fullWidth>Finish</Button></Stack>}
      {!activeSession && <Button size="small" onClick={() => setSessionOpen(true)} sx={{ mt: 1 }} fullWidth>Log a past session</Button>}
    </Box>
    <Box><Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}><Typography fontWeight={700}>Active quests</Typography><Button size="small" startIcon={<AddIcon />} onClick={() => setQuestOpen(true)}>Add quest</Button></Stack>
      {openQuests.length === 0 ? <Empty>No active quests yet. Add a suggested quest to get started.</Empty> : <Stack spacing={1}>{openQuests.map((q) => <Box key={q.id} sx={{ p: 1.5, border: '1px solid ' + COLORS.border, borderRadius: 2, bgcolor: COLORS.surface }}><Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}><Box sx={{ minWidth: 0, flex: 1 }}><Typography fontWeight={600}>{q.title}</Typography><Typography variant="caption" color="text.secondary">{skillLabel(q.skill)} · {q.xp} XP</Typography>{q.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{q.description}</Typography>}</Box><Button size="small" variant="outlined" onClick={() => void completeQuest(q)}>Complete</Button></Stack></Box>)}</Stack>}
    </Box>
    <Box><Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}><Typography fontWeight={700}>Campaign</Typography><Button size="small" startIcon={<AddIcon />} onClick={() => setChapterOpen(true)}>Add chapter</Button></Stack>
      {chapters.length === 0 ? <Empty>Add your novel's chapters to begin tracking manuscript progress.</Empty> : <Stack spacing={1}>{chapters.map((c) => <Box key={c.id} sx={{ p: 1.5, border: '1px solid ' + COLORS.border, borderRadius: 2, bgcolor: COLORS.surface }}><Stack direction="row" spacing={1} alignItems="center"><MenuBookIcon color="action" fontSize="small" /><Typography fontWeight={600} sx={{ flex: 1 }}>{c.title}</Typography>{c.stage === 'finalised' && <CheckCircleIcon color="success" fontSize="small" />}</Stack><FormControl size="small" fullWidth sx={{ mt: 1 }}><InputLabel>Editing stage</InputLabel><Select value={c.stage} label="Editing stage" onChange={(e) => void updateStage(c, e.target.value as NovelChapterStage)}>{stages.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}</Select></FormControl></Box>)}</Stack>}
    </Box>
    <Box><Stack direction="row" justifyContent="space-between"><Typography fontWeight={700}>Recent sessions</Typography><Button size="small" onClick={() => setSessionOpen(true)}>Log session</Button></Stack>{sessions.filter((s) => s.status === 'completed').sort((a, b) => (b.endedAt ?? '').localeCompare(a.endedAt ?? '')).slice(0, 3).map((s) => <Typography key={s.id} variant="body2" color="text.secondary" sx={{ py: 0.5 }}>{new Date(s.endedAt!).toLocaleDateString()} · {Math.round(s.durationMs / 60000)} min · {skillLabel(s.skill)} · {Math.floor(s.durationMs / 900000) * 10} XP</Typography>)}</Box>
    <Dialog open={chapterOpen} onClose={() => setChapterOpen(false)} fullWidth><DialogTitle>Add chapter</DialogTitle><DialogContent><TextField autoFocus fullWidth label="Chapter title" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} sx={{ mt: 1 }} onKeyDown={(e) => { if (e.key === 'Enter') void addChapter(); }} /></DialogContent><DialogActions><Button onClick={() => setChapterOpen(false)}>Cancel</Button><Button onClick={() => void addChapter()} disabled={!chapterTitle.trim()}>Add chapter</Button></DialogActions></Dialog>
    <Dialog open={questOpen} onClose={() => setQuestOpen(false)} fullWidth><DialogTitle>Add a quest</DialogTitle><DialogContent><Typography variant="subtitle2" sx={{ mb: 1 }}>Suggested quests</Typography><Stack spacing={1} sx={{ mb: 2 }}>{templates.map((t) => <Button key={t.title} variant="outlined" sx={{ justifyContent: 'space-between', textAlign: 'left' }} onClick={() => void addQuest(t)}><Box><Typography variant="body2">{t.title}</Typography><Typography variant="caption" color="text.secondary">{skillLabel(t.skill)} · {t.xp} XP</Typography></Box><AddIcon fontSize="small" /></Button>)}</Stack><Typography variant="subtitle2" sx={{ mb: 1 }}>Custom quest</Typography><Stack spacing={1.5}><TextField label="Task" value={questTitle} onChange={(e) => setQuestTitle(e.target.value)} fullWidth /><TextField label="Description (optional)" value={questDescription} onChange={(e) => setQuestDescription(e.target.value)} fullWidth multiline /><FormControl fullWidth><InputLabel>Skill</InputLabel><Select value={questSkill} label="Skill" onChange={(e) => setQuestSkill(e.target.value as NovelSkill)}>{skills.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}</Select></FormControl><TextField label="XP reward" type="number" value={questXp} onChange={(e) => setQuestXp(Number(e.target.value))} inputProps={{ min: 0, max: 500 }} /><FormControl fullWidth><InputLabel>Chapter (optional)</InputLabel><Select value={questChapter} label="Chapter (optional)" onChange={(e) => setQuestChapter(e.target.value === '' ? '' : Number(e.target.value))}><MenuItem value="">No chapter</MenuItem>{chapters.map((c) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}</Select></FormControl></Stack></DialogContent><DialogActions><Button onClick={() => setQuestOpen(false)}>Close</Button><Button onClick={() => void addQuest()} disabled={!questTitle.trim()}>Create quest</Button></DialogActions></Dialog>
    <Dialog open={sessionOpen} onClose={() => setSessionOpen(false)} fullWidth><DialogTitle>Log a writing session</DialogTitle><DialogContent><Stack spacing={1.5} sx={{ mt: 1 }}><TextField label="Minutes spent" type="number" value={minutes} onChange={(e) => setMinutes(Math.max(0, Number(e.target.value)))} inputProps={{ min: 0, max: 1440 }} /><FormControl fullWidth><InputLabel>Skill</InputLabel><Select value={sessionSkill} label="Skill" onChange={(e) => setSessionSkill(e.target.value as NovelSkill)}>{skills.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}</Select></FormControl><FormControl fullWidth><InputLabel>Chapter (optional)</InputLabel><Select value={sessionChapter} label="Chapter (optional)" onChange={(e) => setSessionChapter(e.target.value === '' ? '' : Number(e.target.value))}><MenuItem value="">No chapter</MenuItem>{chapters.map((c) => <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>)}</Select></FormControl><Alert severity="info">Every complete 15 minutes earns 10 XP. Partial 15-minute blocks do not earn XP.</Alert></Stack></DialogContent><DialogActions><Button onClick={() => setSessionOpen(false)}>Cancel</Button><Button onClick={() => void addManualSession()}>Save session</Button></DialogActions></Dialog>
  </Box>;
}

function Stat({ label, value }: { label: string; value: string }) { return <Box sx={{ flex: 1, minWidth: 0, p: 1.25, borderRadius: 2, bgcolor: COLORS.surface, border: '1px solid ' + COLORS.border }}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography fontWeight={700} sx={{ fontSize: 18 }}>{value}</Typography></Box>; }
function Empty({ children }: { children: React.ReactNode }) { return <Box sx={{ p: 2, border: '1px dashed ' + COLORS.border, borderRadius: 2, color: COLORS.textDim, fontSize: 13 }}>{children}</Box>; }
