import { useState } from 'react';
import { Card, CardContent, Box, Typography, Button, Stack, Collapse, CircularProgress } from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { Turnstile } from '@marsidev/react-turnstile';

import { castVote } from '../services/api';
import PollOption from './PollOption';
import Notification from './Notification';
import PollIdBadge from './PollIdBadge';
import TimeRemaining from './TimeRemaining';


function ActiveVotingForm({ poll, onVoteSuccess }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const handleOptionChange = (event) => {
    const { value, checked } = event.target;
    if (poll.allow_multiple_choices) {
      setSelectedOptions(prev =>
        checked ? [...prev, value] : prev.filter(opt => opt !== value)
      );
    } else {
      setSelectedOptions([value]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedOptions.length === 0) {
      setNotification({ open: true, message: 'Please select at least one option.', severity: 'warning' });
      return;
    }
    if (!turnstileToken) return;

    setIsSubmitting(true);
    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const payload = {
        option_ids: selectedOptions,
        voter_fingerprint: result.visitorId,
        turnstile_token: turnstileToken,
      };

      await castVote(poll.poll_id, payload);
      localStorage.setItem(`voted_on_${poll.poll_id}`, 'true');
      onVoteSuccess(); // Notify parent that voting is done
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.detail || 'An unexpected error occurred.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card sx={{ width: '100%' }}>
        <CardContent sx={{ py: 2, px: { xs: 2, sm: 2.5 } }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.2}>
              <Box>

                <PollIdBadge poll={poll} fontSize='0.825rem' />

                <Typography
                  variant="h5" component="h2"
                  sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }}
                >
                  <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main', mr: 1 }}>
                    Q:
                  </Box>
                  {poll.question}
                </Typography>
              </Box>

              <TransitionGroup component={Stack} spacing={1.5}>
                {poll.options.map(opt => (
                  <Collapse key={opt.id}>
                    <PollOption
                      option={opt}
                      isSelected={selectedOptions.includes(opt.id)}
                      onChange={handleOptionChange}
                      isMultiChoice={poll.allow_multiple_choices}
                    />
                  </Collapse>
                ))}
              </TransitionGroup>

              <TimeRemaining
                activeUntil={poll.active_until}
                prefixText="Voting closes in"
                closedText="Voting has closed."
                lessThanAMinuteText="Voting closes in less than a minute."
              />

              <Turnstile
                siteKey={import.meta.env.VITE_CLOUDFLARE_SITE_KEY}
                options={{ size: "flexible", theme: "light" }}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting || !turnstileToken}
                startIcon={
                  (isSubmitting || !turnstileToken)
                    ? <CircularProgress size={20} color="inherit" />
                    : <HowToVoteIcon />
                }
              >
                {!turnstileToken ? 'Running Captcha...' :
                  isSubmitting ? 'Submitting...' : 'Submit Vote'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Notification
        open={notification.open}
        onClose={() => setNotification({ ...notification, open: false })}
        message={notification.message}
        severity={notification.severity}
      />
    </>
  );
}

export default ActiveVotingForm;