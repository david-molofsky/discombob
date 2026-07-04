import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { theme, COLORS } from './theme/theme';
import { paths } from './routes/paths';
import BottomNav from './components/BottomNav';
import Home from './screens/Home';
import Someday from './screens/Someday';
import Trends from './screens/Trends';
import MoodEntry from './screens/MoodEntry';

function Shell() {
  const { pathname } = useLocation();
  const showNav = pathname !== paths.moodNew;

  return (
    <Box
      sx={{
        height: '100dvh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: COLORS.bg,
        color: COLORS.text,
        maxWidth: 480,
        mx: 'auto',
        overflow: 'hidden',
      }}
    >
      <Routes>
        <Route path={paths.home} element={<Home />} />
        <Route path={paths.someday} element={<Someday />} />
        <Route path={paths.trends} element={<Trends />} />
        <Route path={paths.moodNew} element={<MoodEntry />} />
      </Routes>
      {showNav && <BottomNav />}
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <Shell />
      </HashRouter>
    </ThemeProvider>
  );
}
