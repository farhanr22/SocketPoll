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
import CloseIcon from '@mui/icons-material/Close';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { useTheme, alpha } from '@mui/material/styles';

import Notification from './Notification';

function ShareDialog({ open, onClose, pollData }) {
  if (!pollData) {
    return null;
  }

  const [showCopied, setShowCopied] = useState(false);
  const theme = useTheme();
  const voteUrl = `${window.location.origin}/p/${pollData.poll_id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(voteUrl);
    setShowCopied(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          m: 0, p: 2, pt: 1.2, pr: 1.5, pl: 2.6, color: "primary.main",
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}
      >
        Share this Poll
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: (theme) => theme.palette.grey[500], }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
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