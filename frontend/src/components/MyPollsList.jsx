import {
  Box, Typography, Card, CardContent, Collapse, Fade,
  Button, Stack, Grid, IconButton, Menu, MenuItem, ThemeProvider
} from '@mui/material';
import { TransitionGroup } from 'react-transition-group';
import { useTheme } from '@mui/material/styles';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import ShareDialog from './ShareDialog';
import { deletePoll } from '../services/api';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import Notification from './Notification';
import { getPollThemes } from '../themes/pollThemes';


function PollListItem({ poll, onRemovePoll, showNotification }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const mainTheme = useTheme();
  const pollThemes = getPollThemes(mainTheme);
  const thisTheme = pollThemes[poll.theme ?? "default"];
  
  const now = new Date();
  const isVotingActive = now < new Date(poll.active_until);
  const isPollExpired = now > new Date(poll.expire_at);

  const handleDeleteConfirm = async () => {
    setIsConfirmOpen(false);
    try {
      await deletePoll(poll.poll_id, poll.creator_key);
      onRemovePoll(poll.poll_id);
      // Show success notification
      showNotification('Poll successfully deleted.', 'success');
    } catch (error) {
      console.error("Failed to delete poll", error);
      const errorMessage = error.response?.data?.detail || "Failed to delete poll. The server may be down.";
      // Show error notification
      showNotification(errorMessage, 'error');
    }
  };

  if (isPollExpired) {
    return (
      <Card sx={{ width: '100%' }}>
        <CardContent
          sx={{
            px: 1.5, py: 0.9, pb: 1.2,
            '&:last-child': {
              paddingBottom: 1.5,
            },
          }}
        >
          <Typography
            component="span"
            variant="body2"
            sx={{
              mb: 0.7,
              fontSize: "0.75rem", fontFamily: 'monospace', fontWeight: 500,
              color: "primary", opacity: 0.7,
              display: "inline-block",
            }}
          >
            This poll has expired.
          </Typography>
          <Typography sx={{ textDecoration: 'line-through', opacity: 0.85 }} nowrap>
            {poll.question} example test
          </Typography>
          <Button
            size='small' variant='outlined'
            startIcon={<DeleteForeverRoundedIcon />}
            onClick={() => onRemovePoll(poll.poll_id)}
            sx={{ mt: 1.5 }}
          >
            Remove from List
          </Button>
        </CardContent>
      </Card >
    );
  }

  return (
    <ThemeProvider theme={thisTheme}>
      <Card sx={{ width: '100%' }}>
        <CardContent
          sx={{
            px: 1.5, py: 0.9, pb: 1.2,
            '&:last-child': {
              paddingBottom: 1.5,
            },
          }}
        >
          <Typography
            component="span"
            variant="body2"
            sx={{
              mb: 0.7, display: "inline-block",
              fontSize: "0.75rem", fontFamily: 'monospace', fontWeight: 500,
              color: "primary.main", opacity: 0.8,
            }}
          >
            Poll ID: {poll.poll_id}
          </Typography>
          <Typography
            component="p" gutterBottom
            sx={{
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}
          >
            {poll.question}
          </Typography>
          <Grid container
            spacing={{ xs: 1, sm: 1.3 }} mt={1.5}
            alignItems="center"
          >

            <Grid item>
              <Button
                variant='contained' size='small'
                onClick={() => navigate(`/r/${poll.poll_id}`)}
                startIcon={<BarChartIcon />}
              >
                View Results
              </Button>
            </Grid>

            <Grid item>
              <Button
                size='small' variant='outlined'
                onClick={() => navigate(`/p/${poll.poll_id}`)}
                disabled={!isVotingActive}
                startIcon={<HowToVoteIcon />}
              >
                {isVotingActive ? "Vote" : "Voting Closed"}
              </Button>
            </Grid>

            {/* Mobile menu for Share and Delete */}
            <Grid item sx={{ display: { xs: 'block', sm: 'none' }, ml: -0.8 }}>
              <IconButton onClick={handleMenuOpen} >
                <MoreVertIcon sx={{ color: "primary" }} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    setIsShareDialogOpen(true);
                  }}
                  disabled={!isVotingActive}
                  sx={{ fontSize: '0.85rem', minHeight: 32 }}
                >
                  <ShareIcon sx={{ mr: 1, fontSize: '1.1rem' }} /> Share
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    setIsConfirmOpen(true);
                  }}
                  sx={{ fontSize: '0.85rem', minHeight: 32 }}
                >
                  <DeleteForeverRoundedIcon sx={{ mr: 1, fontSize: '1.1rem' }} /> Delete
                </MenuItem>
              </Menu>
            </Grid>

            {/* Desktop buttons */}
            <Grid item sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Button
                size='small' variant='outlined'
                startIcon={<ShareIcon />}
                onClick={() => setIsShareDialogOpen(true)}
                disabled={!isVotingActive}
              >
                Share
              </Button>
            </Grid>
            <Grid item sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Button
                size='small' variant='outlined'
                startIcon={<DeleteForeverRoundedIcon />}
                onClick={() => setIsConfirmOpen(true)}
              >
                Delete
              </Button>
            </Grid>

          </Grid>
        </CardContent>
        <ShareDialog
          open={isShareDialogOpen}
          onClose={() => setIsShareDialogOpen(false)}
          pollData={poll}
        />
        <ConfirmDeleteDialog
          open={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      </Card >
    </ThemeProvider>

  );
}


function MyPollsList({ polls, onRemovePoll }) {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };
  return (
    <Box>
      {polls.length === 0 ? (
        <TransitionGroup>
          <Fade>
            <Typography color="text.secondary" sx={{ ps: 5 }}>
              You haven't created any polls yet. Create one to see it here!
            </Typography>
          </Fade>
        </TransitionGroup>
      ) : (
        <TransitionGroup component={Stack} spacing={2}>
          {polls.slice().reverse().map((poll) => (
            <Collapse key={poll.poll_id}>
              <PollListItem
                key={poll.poll_id}
                poll={poll}
                onRemovePoll={onRemovePoll}
                showNotification={showNotification}
              />
            </Collapse>
          ))}
        </TransitionGroup>
      )}


      <Notification
        open={notification.open}
        onClose={() => setNotification({ open: false, message: '' })}
        message={notification.message}
        severity={notification.severity}
      />
    </Box>
  );
}

export default MyPollsList;
