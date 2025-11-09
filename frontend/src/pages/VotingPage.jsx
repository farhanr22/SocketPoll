import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, ThemeProvider, Fade } from '@mui/material';
import { SwitchTransition } from 'react-transition-group';

import { getPoll } from '../services/api';
import { getPollThemes } from '../themes/pollThemes';
import defaultTheme from '../themes/defaultTheme';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PollSkeleton from '../components/PollSkeleton';
import PollStatusView from '../components/PollStatusView';
import ActiveVotingForm from '../components/ActiveVotingForm';

function VotingPage() {
  const { pollId } = useParams();

  const [poll, setPoll] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasVoted, setHasVoted] = useState(
    () => localStorage.getItem(`voted_on_${pollId}`) === 'true'
  );


  useEffect(() => {
    const fetchPollData = async () => {
      setIsLoading(true);
      setError(null);

      const result = await getPoll(pollId);

      if (result.success) {
        setPoll(result.data);
      } else {
        setError(result.error);
      }

      setIsLoading(false);
    };
    fetchPollData();
  }, [pollId]);

  // Determine the correct theme if there is a poll, fallback to default
  let pollTheme;

  if (poll) {
    const themes = getPollThemes(defaultTheme);
    pollTheme = themes?.[poll.theme] ?? defaultTheme;
  } else {
    pollTheme = defaultTheme;
  }

  const renderContent = () => {
    // STATE: Loading
    if (isLoading) {
      return (
        <Fade key="loading" in={true} timeout={100}>
          <div><PollSkeleton /></div>
        </Fade>
      );
    }

    // STATE: Error
    if (error) {
      return (
        <Fade key="error" in={true} timeout={300}>
          <div><PollStatusView status="error" errorMessage={error} /></div>
        </Fade>
      );
    }

    // STATE: Voting is over (either user has voted or poll has closed)
    const isVotingClosed = new Date() > new Date(poll.active_until);

    if (hasVoted) {
      return (
        <Fade key="voted" in={true} timeout={300}>
          <div><PollStatusView status="voted" poll={poll} /></div>
        </Fade>
      );
    }

    if (isVotingClosed) {
      return (
        <Fade key="closed" in={true} timeout={300}>
          <div><PollStatusView status="closed" poll={poll} /></div>
        </Fade>
      );
    }

    // STATE: Active Voting Form
    return (
      <Fade key="active" in={true} timeout={300}>
        <div><ActiveVotingForm poll={poll} onVoteSuccess={() => setHasVoted(true)} /></div>
      </Fade>
    );
  };

  return (
    <Container maxWidth="sm">
      <Header />
      <ThemeProvider theme={pollTheme}>
        <SwitchTransition mode="out-in">
          {renderContent()}
        </SwitchTransition>
      </ThemeProvider>
      <Footer />
    </Container>
  );
}

export default VotingPage;
