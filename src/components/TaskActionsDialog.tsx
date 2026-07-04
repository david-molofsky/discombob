import { useEffect, useState } from 'react';
import { Dialog, Box, Typography, Button, InputBase, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { COLORS } from '../theme/theme';
import { DEFAULT_TAGS } from '../db/schemas';
import type { Task } from '../db/schemas';

export default function TaskActionsDialog({
  open,
  task,
  onClose,
  onSaveTags,
  onRequestDelete,
}: {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSaveTags: (tags: string[]) => void;
  onRequestDelete: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [newTagText, setNewTagText] = useState('');

  const customTags = useLiveQuery(() => db.customTags.toArray(), []);
  const allTags = [...DEFAULT_TAGS, ...(customTags?.map((t) => t.name) ?? [])];

  // Reset local selection whenever a new task is opened.
  useEffect(() => {
    if (open) setSelected(task?.tags ?? []);
  }, [open, task]);

  const toggleTag = (t: string) => {
    setSelected((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const confirmNewTag = async () => {
    const trimmed = newTagText.trim();
    setAdding(false);
    setNewTagText('');
    if (!trimmed) return;
    const alreadyExists = allTags.some((t) => t.toLowerCase() === trimmed.toLowerCase());
    if (!alreadyExists) {
      await db.customTags.add({ name: trimmed });
    }
    setSelected((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  };

  const save = () => {
    onSaveTags(selected);
    onClose();
  };

  const requestDelete = () => {
    onClose();
    onRequestDelete();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            bgcolor: COLORS.surfaceRaised,
            borderRadius: '18px',
            border: `1px solid ${COLORS.border}`,
            width: '100%',
            maxWidth: 340,
            m: 2,
          },
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16, mb: 0.25 }}>
          {task?.text}
        </Typography>
        <Typography sx={{ fontSize: 12, color: COLORS.textFaint, mb: 2 }}>
          Manage this task
        </Typography>

        <Typography sx={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: COLORS.textFaint, mb: 1 }}>
          Tags
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2.5 }}>
          {allTags.map((t) => (
            <Box
              key={t}
              onClick={() => toggleTag(t)}
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: '100px',
                fontSize: 12,
                fontWeight: selected.includes(t) ? 600 : 400,
                cursor: 'pointer',
                bgcolor: selected.includes(t) ? COLORS.accent : 'transparent',
                border: `1px solid ${selected.includes(t) ? COLORS.accent : COLORS.border}`,
                color: selected.includes(t) ? '#0D2320' : COLORS.textDim,
              }}
            >
              {t}
            </Box>
          ))}
          {adding ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                bgcolor: COLORS.surface,
                border: `1px solid ${COLORS.accent}`,
                borderRadius: '100px',
                pl: 1.5,
                pr: 0.5,
                py: 0.375,
              }}
            >
              <InputBase
                autoFocus
                placeholder="Type a tag..."
                value={newTagText}
                onChange={(e) => setNewTagText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmNewTag();
                  if (e.key === 'Escape') {
                    setAdding(false);
                    setNewTagText('');
                  }
                }}
                sx={{ fontSize: 12, color: COLORS.text, width: 90 }}
              />
              <IconButton
                size="small"
                onClick={confirmNewTag}
                sx={{ bgcolor: COLORS.accent, color: '#0D2320', '&:hover': { bgcolor: COLORS.accent }, width: 22, height: 22 }}
              >
                <CheckIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Box>
          ) : (
            <Box
              onClick={() => setAdding(true)}
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: '100px',
                fontSize: 12,
                cursor: 'pointer',
                bgcolor: 'transparent',
                border: `1px dashed ${COLORS.textFaint}`,
                color: COLORS.textFaint,
              }}
            >
              + Add
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1.25 }}>
          <Button
            fullWidth
            onClick={onClose}
            sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textDim }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            onClick={save}
            sx={{ bgcolor: COLORS.accent, color: '#0D2320', fontWeight: 600, '&:hover': { bgcolor: COLORS.accent } }}
          >
            Save tags
          </Button>
        </Box>
        <Button
          fullWidth
          onClick={requestDelete}
          sx={{ color: COLORS.danger, fontSize: 12, fontWeight: 600, mt: 1, '&:hover': { bgcolor: 'transparent' } }}
        >
          Delete task…
        </Button>
      </Box>
    </Dialog>
  );
}
