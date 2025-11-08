import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, ThemeProvider, Fade } from '@mui/material';

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
      return <PollSkeleton />;
    }

    // STATE: Error
    if (error) {
      return <PollStatusView status="error" errorMessage={error} />;
    }

    // STATE: Voting is over (either user has voted or poll has closed)
    const isVotingClosed = new Date() > new Date(poll.active_until);

    if (hasVoted) {
      return <PollStatusView status="voted" poll={poll} />;
    }

    if (isVotingClosed) {
      return <PollStatusView status="closed" poll={poll} />;
    }

    // STATE: Active Voting Form
    return <ActiveVotingForm poll={poll} onVoteSuccess={() => setHasVoted(true)} />;
  };

  return (
    <Container maxWidth="sm">
      <Header />
      <ThemeProvider theme={pollTheme}>
        <Fade in={true} timeout={300}>
          <div>{renderContent()}</div>
        </Fade>
      </ThemeProvider>
      <Footer />
    </Container>
  );
}

export default VotingPage;