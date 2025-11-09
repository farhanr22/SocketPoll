import {
  Container,
  Grid,
  Typography,
  Stack
} from '@mui/material';
import { useState, useEffect } from 'react';

import { getMyPolls, savePoll, removePoll } from '../utils/storage';

import Header from '../components/Header';
import Footer from '../components/Footer';
import PollCreationForm from '../components/PollCreationForm';
import MyPollsList from '../components/MyPollsList';

function HomePage() {
  const [myPolls, setMyPolls] = useState([]);

  useEffect(() => {
    setMyPolls(getMyPolls());
  }, []);

  const handlePollCreated = (newPollData) => {
    const updatedPolls = savePoll(newPollData);
    setMyPolls(updatedPolls);
  };

  const handlePollRemoved = (pollId) => {
    const updatedPolls = removePoll(pollId);
    setMyPolls(updatedPolls);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

      <Stack spacing={3.5}>

        <Header />

        <Grid container spacing={4}>

          <Grid item size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h5" component="h2" gutterBottom
              sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem' } }}
            >
              Create a Poll.
            </Typography>
            <PollCreationForm onPollCreated={handlePollCreated} />
          </Grid>

          <Grid item size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h5" component="h2" gutterBottom
              sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem' } }}
            >
              Your Polls.
            </Typography>
            <MyPollsList polls={myPolls} onRemovePoll={handlePollRemoved} />
          </Grid>

        </Grid>

        <Footer />

      </Stack>
    </Container>
  );
}

export default HomePage;