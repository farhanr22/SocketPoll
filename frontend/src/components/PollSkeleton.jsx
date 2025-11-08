import { Card, CardContent, Skeleton, Stack, Box } from '@mui/material';

function PollSkeleton() {
  return (
    <Card sx={{ width: '100%', maxWidth: 600, mx: 'auto', pb: 2 }}>
      <CardContent>
        <Stack spacing={1.75}>
          <Box sx={{ pb: 2 }}>
            <Skeleton variant="text" sx={{ fontSize: '2rem', borderRadius: 0 }} />
          </Box>

          {[...Array(4)].map((_, i) => (
            <Stack key={i} direction="row" alignItems="center" spacing={1.5}>
              <Skeleton variant="circular" width={22} height={22} />
              <Skeleton variant="rectangular" height={45} sx={{ flexGrow: 1, borderRadius: 1 }} />
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default PollSkeleton;
