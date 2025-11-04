import { Card, CardContent, Typography, Button, Stack, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LockClockIcon from '@mui/icons-material/LockClock';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ShareIcon from '@mui/icons-material/Share';
import BarChartIcon from '@mui/icons-material/BarChart';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import ShareDialog from './ShareDialog';

function PollStatusView({ status, poll, errorMessage }) {
  const navigate = useNavigate();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Mapping of Title, Message, and Icon based on status
  const statusConfig = {
    voted: {
      title: "You have voted!",
      message: "Thank you for participating in this poll.",
      Icon: TaskAltIcon,
    },
    closed: {
      title: "Voting has closed",
      message: "This poll is no longer accepting new votes.",
      Icon: LockClockIcon,
    },
    error: {
      title: "Error",
      message: errorMessage || "An unexpected error occurred :(",
      Icon: ErrorOutlineIcon,
    }
  };

  const { title, message, Icon } = statusConfig[status];

  // Check which actions are available
  const canViewResults = poll?.public_results;
  const canShare = !!poll && status !== 'closed';

  return (
    <Card sx={{ width: '100%' }}>
      <CardContent>
        <Stack spacing={2.5} alignItems="stretch">

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon sx={{ color: 'primary.main', fontSize: '1.8rem' }} />
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: '600', color: 'primary.main' }}
            >
              {title}
            </Typography>
          </Box>

          <Typography color="text.primary">{message}</Typography>

          {/* Buttons */}
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            {canViewResults && (
              <Button
                variant="outlined" size="large" fullWidth
                onClick={() => navigate(`/r/${poll.poll_id}`)}
                startIcon={<BarChartIcon />}
              >
                View Poll Results
              </Button>
            )}
            {canShare && (
              <Button
                variant="outlined" size="large" fullWidth
                onClick={() => setIsShareDialogOpen(true)}
                startIcon={<ShareIcon />}
              >
                Share This Poll
              </Button>
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
      <ShareDialog
        open={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        pollData={poll}
      />
    </Card>
  );
}

export default PollStatusView;