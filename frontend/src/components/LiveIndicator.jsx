import { Box, keyframes } from '@mui/material';

// Keyframes for the expanding 'glow' ring
const ripple = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  70% {
    transform: scale(2.5);
    opacity: 0;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
`;

export default function LiveIndicator({ live = false, size = 10 }) {
  const color = live ? '#49b965ff' : '#d32f2f';

  return (
    //  Container
    <Box
      component="span"
      sx={{
        position: 'relative', display: 'inline-block', verticalAlign: 'middle',
        width: size, height: size,
        ml: '5px', mb: '2.5px',
      }}
    >
      <Box
        sx={{
          position: 'absolute', top: 0, left: 0, zIndex: 2,
          width: '100%', height: '100%',
          borderRadius: '50%', backgroundColor: color
        }}
      />

      {/* Outer glowing pulse (only visible when live) */}
      {live && (
        <Box
          sx={{
            position: 'absolute', top: 0, left: 0, zIndex: 1,
            width: '100%', height: '100%',
            borderRadius: '50%', backgroundColor: color,
            animation: `${ripple} 1.5s infinite ease-out`,
          }}
        />
      )}
    </Box>
  );
}
