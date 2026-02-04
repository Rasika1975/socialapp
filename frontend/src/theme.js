import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6C63FF', // TaskPlanet Soft Indigo
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#E53935', // Soft Red (Like Active)
    },
    background: {
      default: '#F5F6FA', // TaskPlanet Light Grey
      paper: '#ffffff',
    },
    text: {
      primary: '#2E2E2E',
      secondary: '#7A7A7A',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Helvetica, Arial, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700 },
    h2: { fontSize: '1.5rem', fontWeight: 700 },
    h6: { fontSize: '1.1rem', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0,0,0,0.04)',
          borderRadius: '20px',
          marginBottom: '24px',
          border: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px', /* Pill Shape */
          padding: '10px 24px',
          textTransform: 'none',
          fontWeight: 700,
          boxShadow: '0 4px 14px 0 rgba(108, 99, 255, 0.39)', /* Glow Shadow */
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(108, 99, 255, 0.23)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#F9FAFC',
          },
        },
      },
    },
  },
});

export default theme;