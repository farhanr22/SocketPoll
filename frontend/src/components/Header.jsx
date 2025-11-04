import { Stack, Typography, Box } from '@mui/material';
import PollIcon from '@mui/icons-material/Poll';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        my: 4, 
        display: 'flex', 
        justifyContent: 'center', 
        cursor: 'pointer' 
      }} 
      onClick={() => navigate('/')}
    >
      <Stack direction="row" spacing={1 } alignItems="center">
        <PollIcon color="primary" sx={{ fontSize: 38 }} />
        <Typography variant="h4" component="h1" fontWeight="bold">
          QuickPoll
        </Typography>
      </Stack>
    </Box>
  );
}

export default Header;