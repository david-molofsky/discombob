import { Dialog, Box, Typography, Button } from '@mui/material';
import { COLORS } from '../theme/theme';

export default function DeleteConfirmDialog({
  open,
  itemText,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  itemText: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
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
        <Typography variant="h6" sx={{ fontSize: 17, mb: 0.75 }}>
          Delete this item?
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textDim, mb: 2.5, lineHeight: 1.5 }}>
          <em>"{itemText}"</em> will be permanently removed. This can't be undone.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.25 }}>
          <Button
            fullWidth
            onClick={onCancel}
            sx={{ bgcolor: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textDim }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            onClick={onConfirm}
            sx={{ bgcolor: COLORS.danger, color: '#2B0D0D', '&:hover': { bgcolor: COLORS.danger } }}
          >
            Delete
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
