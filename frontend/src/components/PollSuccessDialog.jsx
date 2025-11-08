import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  Stack, useMediaQuery
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import BarChartIcon from '@mui/icons-material/BarChart';

import { QRCodeSVG } from 'qrcode.react';
import { useTheme, alpha } from '@mui/material/styles';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Notification from './Notification';

// This component receives three props:
// `open`: a boolean to control if the dialog is visible
// `onClose`: a function to call when the dialog should be closed
// `pollData`: an object with the new poll's { poll_id, creator_key }
function PollSuccessDialog({ open, onClose, pollData }) {
  // If there's no data yet, render nothing to avoid errors
  if (!pollData) {
    return null;
  }

  const [showCopied, setShowCopied] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Construct the full shareable URL for the voting page
  const voteUrl = `${window.location.origin}/p/${pollData.poll_id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(voteUrl);
    setShowCopied(true);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            m: 0, pb: 1.7,
            pt: isMobile ? 0.6 : 0.8,
            px: isMobile ? 1.7 : 2,
            pr: isMobile ? 0.3 : 1,
            color: "primary.main",
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}
        >
          Poll Created !
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ color: (theme) => theme.palette.grey[500], }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pb: 1.5, px: isMobile ? 1.7 : 2 }}>
          <Stack spacing={2} alignItems="center">

            <Box sx={{ p: 1.5, pb: 0.8, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <QRCodeSVG value={voteUrl} fgColor={theme.palette.primary.main} />
            </Box>

            <Box sx={{ width: '100%' }}>
              <Typography variant="overline">Shareable Voting Link</Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  value={voteUrl}
                  fullWidth
                  readOnly:true
                  variant="outlined"
                  size="small"
                />
                <IconButton onClick={handleCopy} aria-label="Copy link"
                  sx={{
                    border: '1px solid', borderColor: 'divider', borderRadius: 1,
                    '& .MuiTouchRipple-child': {
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.55),
                    }
                  }}
                >
                  <ContentCopyIcon sx={{ color: 'primary.main', opacity: 0.9 }} />
                </IconButton>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: 'space-between',
            px: isMobile ? 1.7 : 2,
            pb: 2,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 1 : 0,
            '& > :not(style)': {
              width: isMobile ? '100%' : 'auto',
              m: '0 !important'
            },
          }}
        >
          <Button
            onClick={() => navigate(`/r/${pollData.poll_id}`)}
            variant="outlined"
            startIcon={<BarChartIcon />}
          >
            Results Page
          </Button>
          <Button
            onClick={() => navigate(`/p/${pollData.poll_id}`)}
            variant="contained"
            startIcon={<HowToVoteIcon />}
          >
            Vote In Poll
          </Button>
        </DialogActions>
      </Dialog>

      <Notification
        open={showCopied}
        onClose={() => setShowCopied(false)}
        message="Link copied to clipboard!"
        severity="success"
      />
    </>
  );
}

export default PollSuccessDialog;