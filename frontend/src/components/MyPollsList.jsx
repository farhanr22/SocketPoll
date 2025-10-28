import { Card, CardContent, Typography } from '@mui/material';

function MyPollsList() {
  return (
    <Card sx={{ width: '100%', height: '100%' }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Your Polls
        </Typography>
      </CardContent>
    </Card>
  );
}

export default MyPollsList;