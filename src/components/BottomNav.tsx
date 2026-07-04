import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import InboxIcon from '@mui/icons-material/AllInbox';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { paths } from '../routes/paths';
import { COLORS } from '../theme/theme';

export default function BottomNav() {
  const location = useNavigate();
  const { pathname } = useLocation();

  const value = pathname === paths.someday ? paths.someday : pathname === paths.trends ? paths.trends : paths.home;

  return (
    <Paper
      elevation={0}
      sx={{
        borderTop: `1px solid ${COLORS.border}`,
        bgcolor: COLORS.surface,
        flexShrink: 0,
      }}
    >
      <BottomNavigation
        value={value}
        onChange={(_, newValue) => location(newValue)}
        sx={{ bgcolor: 'transparent' }}
      >
        <BottomNavigationAction label="Home" value={paths.home} icon={<HomeIcon />} />
        <BottomNavigationAction label="Someday" value={paths.someday} icon={<InboxIcon />} />
        <BottomNavigationAction label="Trends" value={paths.trends} icon={<ShowChartIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
