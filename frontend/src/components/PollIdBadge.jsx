import Typography from '@mui/material/Typography';

const PollIdBadge = ({ poll, fontSize = '0.75rem' }) => {
  return (
    <Typography
      component="span"
      variant="mono" 
      sx={{
        fontSize,
        fontWeight: 500,
        color: 'primary.main',
        opacity: 0.7,
        display: 'inline-block',
        mb: 0.7,
      }}
    >
      Poll ID: {poll.poll_id}
    </Typography>
  );
};

export default PollIdBadge;
