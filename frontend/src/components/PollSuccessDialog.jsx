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
  Stack,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { QRCodeSVG } from 'qrcode.react';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';

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

  // Construct the full shareable URL for the voting page
  const voteUrl = `${window.location.origin}/p/${pollData.poll_id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(voteUrl);
    setShowCopied(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Poll Created!</DialogTitle>

      <DialogContent sx={{ pb: 1.5 }}>
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
                readOnly
                variant="outlined"
                size="small"
              />
              <IconButton onClick={handleCopy} aria-label="Copy link"
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
              >
                <ContentCopyIcon />
              </IconButton>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        {/* Add router nagivation to these later */}
        <Button onClick={onClose} variant="outlined">
          Results Page
        </Button>
        <Button onClick={onClose} variant="contained">
          Vote In Poll
        </Button>
      </DialogActions>
      <Notification
        open={showCopied}
        onClose={() => setShowCopied(false)}
        message="Link copied to clipboard!"
        severity="success"
      />

    </Dialog>
  );
}

export default PollSuccessDialog;