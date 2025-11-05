import { createTheme, alpha } from '@mui/material/styles';

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#303030ff',
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
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
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
            paddingBottom: 20,
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
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
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