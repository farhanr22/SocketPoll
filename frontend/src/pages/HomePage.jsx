import {
  Container,
  Grid,
  Box,
  Typography,
  Link,
  Stack,
} from '@mui/material';
import PollIcon from '@mui/icons-material/Poll';
import { useState, useEffect } from 'react';

import { getMyPolls, savePoll } from '../utils/storage';

import PollCreationForm from '../components/PollCreationForm';
import MyPollsList from '../components/MyPollsList';


function HomePage() {
  const [myPolls, setMyPolls] = useState([]);

  // On initial component load, read polls from localStorage
  useEffect(() => {
    setMyPolls(getMyPolls());
  }, []); // Run once

  const handlePollCreated = (newPollData) => {
    // Save the new poll to localstorage
    // and update the state with the full new list
    const updatedPolls = savePoll(newPollData);
    setMyPolls(updatedPolls);
  };


  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

      {/* Header section */}
      <Stack direction="row" spacing={2} alignItems="center" mb={5}>
        <PollIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h4" component="h1">
          Quick Poll
        </Typography>
      </Stack>

      {/* Body */}
      <Grid container spacing={4}>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography
            variant="h4_5"
            component="h2"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            Create a Poll.
          </Typography>

          <PollCreationForm onPollCreated={handlePollCreated} />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography
            variant="h4_5"
            component="h2"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            Your polls.
          </Typography>

          <MyPollsList polls={myPolls} />
        </Grid>

      </Grid>

      {/* Footer section */}
      <Box component="footer" sx={{ mt: 8, py: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Poll App description text.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Check out the project on{' '}
          <Link
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default HomePage;  