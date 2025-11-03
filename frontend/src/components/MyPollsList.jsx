import {
  Box, Typography, Card, CardContent,
  CardActions, Button, Stack, Chip, Grid, IconButton, Menu, MenuItem
} from '@mui/material';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import ShareDialog from './ShareDialog';
import { deletePoll } from '../services/api';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import Notification from './Notification';

function PollListItem({ poll, onRemovePoll, showNotification }) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

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
      <Card sx={{ width: '100%', opacity: 0.7 }}>
        <CardContent>
          <Typography sx={{ textDecoration: 'line-through' }} nowrap>
            {poll.question}
          </Typography>
          <Chip label="Expired & Deleted" size="small" sx={{ mt: 1 }} />
        </CardContent>
        <CardActions>
          <Button size="small" onClick={() => onRemovePoll(poll.poll_id)}>
            Remove From List
          </Button>
        </CardActions>
      </Card>
    );
  }

  return (
    <Card sx={{ width: '100%' }}>
      <CardContent
        sx={{
          px: 1.5,
          py: 0.9,
          pb: 1.2,
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
            fontSize: "0.75rem",
            fontFamily: 'monospace',
            fontWeight: 500,
            color: "primary",
            opacity: 0.7,
            display: "inline-block"
          }}
        >
          Poll ID: {poll.poll_id}
        </Typography>
        <Typography
          component="p"
          gutterBottom
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {poll.question}
        </Typography>
        <Grid container
          spacing={{ xs: 1, sm: 1.3 }}
          mt={1.5}
          alignItems="center">

          <Grid item>
            <Button
              variant='contained'
              size='small'
              onClick={() => navigate(`/r/${poll.poll_id}`)}
              startIcon={<BarChartIcon />}
            >
              View Results
            </Button>
          </Grid>

          <Grid item>
            <Button
              size='small'
              variant='outlined'
              onClick={() => navigate(`/p/${poll.poll_id}`)}
              disabled={!isVotingActive}
              startIcon={<CheckCircleOutlineRoundedIcon />}
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
              size='small'
              variant='outlined'
              startIcon={<ShareIcon />}
              onClick={() => setIsShareDialogOpen(true)}
            >
              Share
            </Button>
          </Grid>
          <Grid item sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Button
              size='small'
              variant='outlined'
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
        <Typography color="text.secondary" sx={{ ps: 5 }}>
          You haven't created any polls yet. Create one to see it here!
        </Typography>
      ) : (
        <Stack spacing={2}>
          {polls.slice().reverse().map((poll) => (
            <PollListItem
              key={poll.poll_id}
              poll={poll}
              onRemovePoll={onRemovePoll}
              showNotification={showNotification}
            />
          ))}
        </Stack>
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
