import { createTheme } from '@mui/material/styles';

// Variables de couleurs MDMC centralisées
const MDMC_COLORS = {
  primary: '#cc271a',      // ✅ COULEUR ROUGE MDMC CORRECTE
  primaryLight: '#cc271a', // ✅ Même couleur pour éviter les dérives
  primaryDark: '#a91f15',  // ✅ Version plus foncée
  white: '#ffffff',
  black: '#0a0a0a',
  darkPaper: '#1a1a1a',
  textSecondary: '#cccccc',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: MDMC_COLORS.primary,     // #cc271a
      light: MDMC_COLORS.primaryLight, // #cc271a
      dark: MDMC_COLORS.primaryDark,   // #a91f15
      contrastText: MDMC_COLORS.white,
    },
    secondary: {
      main: MDMC_COLORS.white,
      light: '#f5f5f5',
      dark: '#cccccc',
      contrastText: MDMC_COLORS.black,
    },
    background: {
      default: MDMC_COLORS.black,
      paper: MDMC_COLORS.darkPaper,
    },
    text: {
      primary: MDMC_COLORS.white,
      secondary: MDMC_COLORS.textSecondary,
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    grey: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
      fontFamily: '"Poppins", sans-serif',
      color: MDMC_COLORS.white, // ✅ Titres principaux en blanc
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
      fontFamily: '"Poppins", sans-serif',
      color: MDMC_COLORS.white, // ✅ Titres de sections en blanc
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      fontFamily: '"Poppins", sans-serif',
      color: MDMC_COLORS.white,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      fontFamily: '"Poppins", sans-serif',
      color: MDMC_COLORS.white,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      fontFamily: '"Poppins", sans-serif',
      color: MDMC_COLORS.white,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
      fontFamily: '"Poppins", sans-serif',
      color: MDMC_COLORS.white,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: MDMC_COLORS.white,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: MDMC_COLORS.textSecondary,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          backgroundColor: MDMC_COLORS.black,
          color: MDMC_COLORS.white,
          minHeight: '100vh',
          paddingTop: '80px',
        },
        html: {
          backgroundColor: MDMC_COLORS.black,
        },
        '#root': {
          backgroundColor: MDMC_COLORS.black,
          color: MDMC_COLORS.white,
        },
        // Variables CSS pour cohérence
        ':root': {
          '--color-primary': MDMC_COLORS.primary,
          '--color-primary-light': MDMC_COLORS.primaryLight,
          '--color-primary-dark': MDMC_COLORS.primaryDark,
        }
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '1rem',
          padding: '12px 24px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: `0 10px 30px rgba(204, 39, 26, 0.3)`,
          },
        },
        contained: {
          backgroundColor: MDMC_COLORS.primary,
          color: MDMC_COLORS.white,
          '&:hover': {
            backgroundColor: MDMC_COLORS.primaryDark,
          },
        },
        outlined: {
          borderColor: MDMC_COLORS.white,
          color: MDMC_COLORS.white,
          '&:hover': {
            backgroundColor: MDMC_COLORS.white,
            color: MDMC_COLORS.black,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: MDMC_COLORS.darkPaper,
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: MDMC_COLORS.black,
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: MDMC_COLORS.darkPaper,
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          color: MDMC_COLORS.white,
          '&:hover': {
            backgroundColor: 'rgba(204, 39, 26, 0.1)',
            transform: 'translateX(4px)',
            transition: 'all 0.2s ease-in-out',
          },
          '&.active': {
            backgroundColor: MDMC_COLORS.primary,
            color: MDMC_COLORS.white,
            '&:hover': {
              backgroundColor: MDMC_COLORS.primaryDark,
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: MDMC_COLORS.darkPaper,
            borderRadius: 8,
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: MDMC_COLORS.primary,
            },
          },
          '& .MuiInputLabel-root': {
            color: MDMC_COLORS.textSecondary,
          },
          '& .MuiOutlinedInput-input': {
            color: MDMC_COLORS.white,
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          color: MDMC_COLORS.white,
        },
        h2: {
          color: MDMC_COLORS.white,
        },
        h3: {
          color: MDMC_COLORS.white,
        },
        h4: {
          color: MDMC_COLORS.white,
        },
        h5: {
          color: MDMC_COLORS.white,
        },
        h6: {
          color: MDMC_COLORS.white,
        },
      },
    },
  },
});

export default theme;
