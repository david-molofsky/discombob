import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import InboxIcon from '@mui/icons-material/AllInbox';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import MoodIcon from '@mui/icons-material/EmojiEmotions';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { paths } from '../routes/paths';
import { COLORS } from '../theme/theme';

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const value = pathname === paths.someday ? paths.someday
    : pathname === paths.trends ? paths.trends
    : pathname === paths.mood ? paths.mood
    : pathname === paths.novelQuest ? paths.novelQuest : paths.home;

  return <Paper elevation={0} sx={{ borderTop: '1px solid ' + COLORS.border, bgcolor: COLORS.surface, flexShrink: 0 }}>
    <BottomNavigation value={value} onChange={(_, newValue) => navigate(newValue)} showLabels sx={{ bgcolor: 'transparent' }}>
      <BottomNavigationAction label="Home" value={paths.home} icon={<HomeIcon />} />
      <BottomNavigationAction label="Someday" value={paths.someday} icon={<InboxIcon />} />
      <BottomNavigationAction label="Mood" value={paths.mood} icon={<MoodIcon />} />
      <BottomNavigationAction label="Trends" value={paths.trends} icon={<ShowChartIcon />} />
      <BottomNavigationAction label="Novel Quest" value={paths.novelQuest} icon={<AutoStoriesIcon />} />
    </BottomNavigation>
  </Paper>;
}
