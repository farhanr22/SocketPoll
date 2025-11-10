import { Card, CardContent, Typography, Button, Stack, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

function ResultsErrorCard({ message, cat = false }) {
  const navigate = useNavigate();

  return (
    <Card sx={{ width: '100%' }}>
      <CardContent sx={{mb:1}}>
        <Stack spacing={2.5} alignItems="stretch">

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ErrorOutlineIcon sx={{ fontSize: '1.8rem' }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              Error
            </Typography>
          </Box>

          <Typography color="text.primary">
            {message ||
              "Could not load poll results. The link may be incorrect, or you may not have permission to view this page."}
          </Typography>

          <Stack spacing={1.5} sx={{ pt: 1 }}>

            {cat && (
              <Box
                component="img"
                src="/cat.svg"
                alt="Logo"
                sx={{ width: "90%", maxWidth: 450, alignSelf: "center", pb:3 }}
              />
            )}

            <Button
              variant="contained" size="large" fullWidth
              onClick={() => navigate('/')}
              startIcon={<AddCircleOutlineIcon />}
            >
              Create Your Own Poll
            </Button>
            
          </Stack>

        </Stack>
      </CardContent>
    </Card>
  );
}

export default ResultsErrorCard;
