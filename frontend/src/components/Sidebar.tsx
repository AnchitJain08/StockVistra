import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import MenuIcon from '@mui/icons-material/Menu';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

export const drawerWidth = 240;

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Option Chain', icon: <ShowChartIcon />, path: '/' },
    { text: 'Analysis', icon: <AnalyticsIcon />, path: '/analysis' },
    { text: 'Compare', icon: <CompareArrowsIcon />, path: '/compare' },
  ];

  const drawer = (
    <>
      <Box sx={{ 
        p: 2, 
        borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.1)',
        bgcolor: '#0A2F57'
      }}>
        <Typography 
          variant="h6" 
          noWrap 
          component="div"
          sx={{ 
            color: '#fff',
            fontWeight: 'bold'
          }}
        >
          StockVista
        </Typography>
      </Box>
      <List sx={{ bgcolor: '#0A2F57', height: '100%' }}>
        {menuItems.map((item) => (
          <ListItem
            button
            component={Link}
            to={item.path}
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: '#fff',
              minWidth: 40
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              sx={{ 
                '& .MuiListItemText-primary': {
                  color: '#fff',
                  fontWeight: 'bold'
                }
              }} 
            />
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: theme.spacing(2),
            left: theme.spacing(2),
            zIndex: theme.zIndex.drawer - 1,
            bgcolor: '#0A2F57',
            color: '#fff',
            width: 40,
            height: 40,
            borderRadius: 2.5,
            '&:hover': {
              bgcolor: 'rgba(16, 69, 123, 0.9)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: '#0A2F57'
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: '#0A2F57',
              borderRight: '0.0625rem solid rgba(255, 255, 255, 0.1)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
};

export default Sidebar;
