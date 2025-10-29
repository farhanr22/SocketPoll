import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack
} from '@mui/material';

// Temporary poll list component
function MyPollsList({ polls }) {
  return (
    <Box>
      {polls.length === 0 ? (
        <Typography color="text.secondary">
          You haven't created any polls yet. Create one to see it here!
        </Typography>
      ) : (
        <Stack spacing={2}>
          {/* Reverse the array to show the newest polls first */}
          {polls.slice().reverse().map((poll) => (
            <Card key={poll.poll_id} sx={{ width: '100%' }}>
              <CardContent>
                <Typography>Poll ID: {poll.poll_id}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Results Page</Button>
                <Button size="small">Voting Page</Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default MyPollsList;