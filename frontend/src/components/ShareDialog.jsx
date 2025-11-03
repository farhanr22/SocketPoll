import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  Box,
  Typography,
  Stack,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

import Notification from './Notification';

// This component receives three props:
// `open`: a boolean to control if the dialog is visible
// `onClose`: a function to call when the dialog should be closed
// `pollData`: an object with the poll data { poll_id, creator_key }
function ShareDialog({ open, onClose, pollData }) {
  // If there's no data, render nothing to avoid errors
  if (!pollData) {
    return null;
  }

  const [showCopied, setShowCopied] = useState(false);

  // Construct the full shareable URL for the voting page
  const voteUrl = `${window.location.origin}/p/${pollData.poll_id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(voteUrl);
    setShowCopied(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Share Poll</DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        <Stack spacing={2} alignItems="center">

          <Box sx={{ p: 1.5, pb: 0.8, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <QRCodeSVG value={voteUrl} />
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

      <Notification
        open={showCopied}
        onClose={() => setShowCopied(false)}
        message="Link copied to clipboard!"
        severity="success"
      />

    </Dialog>
  );
}

export default ShareDialog;