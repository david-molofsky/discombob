import { createTheme } from '@mui/material/styles';

export const COLORS = {
  bg: '#121316',
  surface: '#1B1D22',
  surfaceRaised: '#22252B',
  border: '#2E3138',
  text: '#EDEEF0',
  textDim: '#9A9DA6',
  textFaint: '#5F626B',
  accent: '#5EB8A6',
  amber: '#E8A855',
  danger: '#D96C6C',
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: COLORS.bg,
      paper: COLORS.surface,
    },
    primary: {
      main: COLORS.accent,
      contrastText: '#0D2320',
    },
    warning: {
      main: COLORS.amber,
      contrastText: '#2B1B04',
    },
    error: {
      main: COLORS.danger,
    },
    text: {
      primary: COLORS.text,
      secondary: COLORS.textDim,
      disabled: COLORS.textFaint,
    },
    divider: COLORS.border,
  },
  typography: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    h1: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
    h2: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
    h3: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
    h4: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
    h5: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
    h6: { fontFamily: "'Fraunces', serif", fontWeight: 600 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 12 },
      },
    },
  },
});
