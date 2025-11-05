import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, ThemeProvider, Fade, Card, CardContent, Typography, Stack, Box, Button, Divider } from '@mui/material'
  ;
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import ShareIcon from '@mui/icons-material/Share';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import { getPollResults } from '../services/api';
import { getMyPolls } from '../utils/storage';
import { getPollThemes } from '../themes/pollThemes';
import defaultTheme from '../themes/defaultTheme';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PollIdBadge from '../components/PollIdBadge';
import PollSkeleton from '../components/PollSkeleton';
import ResultsErrorCard from '../components/ResultsErrorCard';
import ResultBar from '../components/ResultBar';
import ShareDialog from '../components/ShareDialog';
import LiveIndicator from '../components/LiveIndicator';


function ResultsPage() {
  const { pollId } = useParams();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [votes, setVotes] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const ws = useRef(null); // For keeping a single instance of WebSocket across renders

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use creator key from localstorage to allow admin to view (private) results
        const myPolls = getMyPolls();
        const pollInfo = myPolls.find(p => p.poll_id === pollId);
        const creatorKey = pollInfo ? pollInfo.creator_key : null;

        // Fetch initial results
        const data = await getPollResults(pollId, creatorKey);

        setPoll(data);
        setVotes(data.votes);
      } catch (err) {
        setError(err.response?.data?.detail || 'Could not load poll results.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [pollId]);

  useEffect(() => {
    if (!poll || error) {
      return;
    }

    // Set up and create websocket only if there is no open connection
    if (!ws.current || ws.current.readyState === WebSocket.CLOSED) {
      const myPolls = getMyPolls();
      const pollInfo = myPolls.find(p => p.poll_id === pollId);
      const creatorKey = pollInfo ? pollInfo.creator_key : null;
      let wsUrl = `ws://localhost:8000/api/ws/polls/${pollId}/results`;
      if (!poll.public_results && creatorKey) {
        wsUrl += `?creator_key=${creatorKey}`;
      }

      const socket = new WebSocket(wsUrl);
      ws.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connected");
        setIsLive(true);
      };

      // Update vote data when new data is recieved over WebSocket
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setVotes(message.votes);
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected");
        setIsLive(false);
      };

      socket.onerror = (err) => console.error("WebSocket error:", err);
    }

    // Cleanup
    return () => {
      // Don't try to tear down a connection that isn't open yet
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        console.log("Cleanup: Closing WebSocket connection.");
        socket.close();
      }
    };

  }, [pollId, poll, error]);

  const pollTheme = poll ? getPollThemes(defaultTheme)[poll.theme] : defaultTheme;

  const renderContent = () => {
    if (isLoading) {
      return <PollSkeleton />;
    }

    if (error) {
      return <ResultsErrorCard message={error} />;
    }

    const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
    const now = new Date();
    const isVotingActive = now < new Date(poll.active_until);

    // Calculate the maximum vote count (to determine the winner(s))
    const maxVotes = totalVotes > 0 ? Math.max(...Object.values(votes)) : 0;

    return (
      <>
        <Fade in={true} timeout={600}>
          <div>
            <Card sx={{ width: '100%' }}>
              <CardContent sx={{ py: 2, px: { xs: 2, sm: 2.5 } }}>
                <Stack spacing={0.7}>

                  {/* Header section */}

                  <Box>
                    <PollIdBadge poll={poll} fontSize='0.825rem' />

                    <Typography
                      variant="h5" component="h2"
                      sx={{ fontSize: { xs: '1.2rem', sm: '1.3rem' } }}
                    >
                      <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main', mr: 1 }}>
                        Q:
                      </Box>
                      {poll.question}
                    </Typography>
                  </Box>

                  {/* Results section  */}

                  <Box sx={{ textAlign: 'center', pt: 0.5 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                      {isLive && "Live"} Results <LiveIndicator live={isLive} size={7} />
                    </Typography>
                  </Box>

                  <Stack spacing={1.5}>
                    {poll.options.map(option => {
                      const voteCount = votes[option.id] || 0;
                      return (
                        <ResultBar
                          key={option.id}
                          option={option}
                          voteCount={voteCount}
                          totalVotes={totalVotes}
                          isMultiChoice={poll.allow_multiple_choices}
                          // Don't set any option as winning if there are no votes yet
                          isWinning={totalVotes > 0 && voteCount === maxVotes}
                        />
                      );
                    })}
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', pt: 1 }}>
                    <strong>{totalVotes}</strong> Votes  cast.
                  </Typography>

                  {/* Action Buttons */}
                  <Box sx={{ pt: 1.5 }}>
                    <Divider sx={{ mb: 2.5 }} />
                    <Stack spacing={1.5}>
                      {isVotingActive && (
                        <>
                          <Button
                            variant="outlined" size="large" fullWidth
                            onClick={() => navigate(`/p/${poll.poll_id}`)}
                            startIcon={<HowToVoteIcon />}
                          >
                            Go to Voting Page
                          </Button>
                          <Button
                            variant="outlined" size="large" fullWidth
                            onClick={() => setIsShareDialogOpen(true)}
                            startIcon={<ShareIcon />}
                          >
                            Share This Poll
                          </Button>
                        </>
                      )}
                      <Button
                        variant="contained" size="large" fullWidth
                        onClick={() => navigate('/')}
                        startIcon={<AddCircleOutlineIcon />}
                      >
                        Create Your Own Poll
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </div>
        </Fade>
        <ShareDialog
          open={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          pollData={poll}
        />
      </>
    );
  };

  return (
    <Container maxWidth="sm">
      <Header />
      <ThemeProvider theme={pollTheme}>
        {renderContent()}
      </ThemeProvider>
      <Footer />
    </Container>
  );
}

export default ResultsPage;