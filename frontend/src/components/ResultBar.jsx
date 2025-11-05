import { Box, Typography, alpha, Radio, Checkbox, Stack, LinearProgress } from '@mui/material';

function ResultBar({ option, voteCount, totalVotes, isMultiChoice, isWinning }) {
  const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

  return (
    <Box
      sx={{
        p: { xs: 1.2, sm: 1.4 }, pb: { xs: 1.4, sm: 1.7 },
        borderRadius: 1, border: '2px solid',
        // Highlight border and background if this option is a winner
        borderColor: isWinning
          ? (theme) => alpha(theme.palette.primary.main, 0.65)
          : (theme) => alpha(theme.palette.primary.main, 0.25),
        backgroundColor: isWinning
          ? (theme) => alpha(theme.palette.primary.main, 0.05)
          : 'transparent',
        transition: 'border-color 0.2s, background-color 0.2s',
        display: 'flex', alignItems: 'center', gap: 1.3,
      }}
    >
      {/* Non-interactive, checked Radio or Checkbox */}
      {isMultiChoice ? (
        <Checkbox checked={isWinning} readOnly
          sx={{ p: 0, color: isWinning ? 'primary.main' : undefined }} />
      ) : (
        <Radio checked={isWinning} readOnly
          sx={{ p: 0, color: isWinning ? 'primary.main' : undefined }} />
      )}

      <Stack spacing={1} sx={{ flexGrow: 1 }}>

        <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap="5px">
          <Typography sx={{ color: isWinning ? 'primary.main' : 'text.primary' }}          >
            {option.text}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: isWinning ? 'primary.dark' : 'text.secondary' }}>
            {voteCount} ({percentage.toFixed(0)}%)
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate" value={percentage}
          sx={{
            height: '8px',
            borderRadius: 0.2,
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
            '& .MuiLinearProgress-bar': {
              borderRadius: 'inherit',
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.8),
            },
          }}
        />
      </Stack>
    </Box>
  );
}

export default ResultBar;