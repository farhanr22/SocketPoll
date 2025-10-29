import { Snackbar, Alert } from '@mui/material';

// Props:
// `open`: boolean, controls visibility
// `onClose`: function to call when the snackbar should close
// `message`: the text to display
// `severity`: 'error', 'warning', 'info', or 'success'
function Notification({ open, onClose, message, severity = 'info' }) {
  return (
    <Snackbar open={open} autoHideDuration={5000} onClose={onClose}>
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}

export default Notification;