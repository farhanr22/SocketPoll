import { Stack, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        my: 4,
        display: 'flex', justifyContent: 'center',
        cursor: 'pointer',
      }}
      onClick={() => navigate('/')}
    >
      <Stack direction="row" spacing={1.3} alignItems="center">
        <Box
          component="img"
          src="/icon.svg"
          alt="Poll icon"
          sx={{
            width: { xs: 32, sm: 40 },
            height: { xs: 32, sm: 40 },
          }}
        />
        <Typography
          variant="h1"
          fontWeight="bold"
          sx={{
            color: 'primary.main',
            fontSize: { xs: '1.8rem', sm: '2.1rem' },
            fontWeight: 600, fontStyle: "italic",
            userSelect: 'none',
          }}
        >
          SocketPoll
        </Typography>
      </Stack>
    </Box>
  );
}

export default Header;
