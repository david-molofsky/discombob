import { useState } from 'react';
import { Box, InputBase, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { COLORS } from '../theme/theme';

export default function QuickAddBar({
  placeholder,
  onAdd,
}: {
  placeholder: string;
  onAdd: (text: string) => void;
}) {
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        bgcolor: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: '14px',
        px: 1.75,
        py: 0.75,
      }}
    >
      <InputBase
        fullWidth
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
        sx={{ fontSize: 14, color: COLORS.text }}
      />
      <IconButton
        onClick={submit}
        size="small"
        sx={{ bgcolor: COLORS.accent, color: '#0D2320', '&:hover': { bgcolor: COLORS.accent }, width: 26, height: 26 }}
      >
        <AddIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
}
