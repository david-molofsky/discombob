import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { theme, COLORS } from './theme/theme';
import { paths } from './routes/paths';
import BottomNav from './components/BottomNav';
import UpdateBanner from './components/UpdateBanner';
import Home from './screens/Home';
import Someday from './screens/Someday';
import Trends from './screens/Trends';
import MoodEntry from './screens/MoodEntry';
import MoodHistory from './screens/MoodHistory';
import MoodDetail from './screens/MoodDetail';

function Shell() {
  const { pathname } = useLocation();
  const showNav = pathname !== paths.moodNew && !pathname.startsWith('/mood/');

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
        position: 'relative',
      }}
    >
      <Routes>
        <Route path={paths.home} element={<Home />} />
        <Route path={paths.someday} element={<Someday />} />
        <Route path={paths.trends} element={<Trends />} />
        <Route path={paths.mood} element={<MoodHistory />} />
        <Route path={paths.moodNew} element={<MoodEntry />} />
        <Route path="/mood/:id/edit" element={<MoodEntry />} />
        <Route path="/mood/:id" element={<MoodDetail />} />
      </Routes>
      {showNav && <BottomNav />}
      <UpdateBanner />
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
