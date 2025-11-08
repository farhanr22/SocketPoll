import { createTheme, alpha } from '@mui/material/styles';

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#313947',
    },
    secondary: {
      main: '#3d3d3dff',
    },
    background: {
      default: '#ffffffff',
    },
    tonalOffset: 0.1,
  },
  typography: {
    fontFamily: '"Inter", "Arial", sans-serif',
    mono: {
      fontFamily: '"IBM Plex Mono", monospace'
    },
    h4_5: {
      fontWeight: 400,
      fontSize: '1.8rem',
      lineHeight: 1.235,
      letterSpacing: '0.00735em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid rgba(0, 0, 0, 0.15)',
          backgroundColor: '#fff',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          '&:last-child': {
            paddingBottom: 10,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderWidth: 1,
        },
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-input': {
            padding: '12px 14px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.primary.main, 0.5),
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1,
            borderColor: theme.palette.primary.main,
          },
          // Add this media query for mobile screens
          [theme.breakpoints.down('sm')]: {
            '& .MuiOutlinedInput-input': {
              padding: '10px 10px', // Reduced padding for mobile
              fontSize: '0.95rem', // Smaller font size for mobile
            },
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          '&.Mui-disabled': {
            boxShadow: 'none',
          },
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: ({ theme }) => ({
            boxShadow: `none`,
            '&:hover': {
              boxShadow: `0px 4px 4px 0px ${alpha(theme.palette.primary.main, 0.25)}`,
            },
            '&:active': {
              boxShadow: `0px 4px 6px 0px ${alpha(theme.palette.primary.main, 0.35)}`,
            },
          }),
        },
      ],
    },
  },
});

export default defaultTheme;