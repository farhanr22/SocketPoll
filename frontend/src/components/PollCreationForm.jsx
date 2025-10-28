import { Card, CardContent, Typography } from '@mui/material';

function PollCreationForm() {
  return (
    <Card sx={{ width: '100%', height: '100%' }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Create a New Poll
        </Typography>
      </CardContent>
    </Card>
  );
}

export default PollCreationForm;