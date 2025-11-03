import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

function ConfirmDeleteDialog({ open, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle sx={{ pb: 1.5, pt: 2.5 }}>Confirm Deletion</DialogTitle>
      <DialogContent sx={{ px: 3, pb: 2 }}>
        <DialogContentText>
          Are you sure you want to delete this poll? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="primary" variant="contained">
          Delete
        </Button>
      </DialogActions>

    </Dialog>
  );
}

export default ConfirmDeleteDialog;