import { Snackbar, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Props:
// `open`: boolean, controls visibility
// `onClose`: function to call when the snackbar should close
// `message`: the text to display
// `severity`: 'error', 'warning', 'info', or 'success'
function Notification({ open, onClose, message, severity = 'info' }) {
  const theme = useTheme();
  const severityColor = {
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
    success: theme.palette.success.main,
  }[severity];

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{ width: '100%', border: `1px solid ${severityColor}`, }}>
        {message}
      </Alert>
    </Snackbar>
  );
}

export default Notification;