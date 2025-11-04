import { Card, CardContent, Skeleton, Stack } from '@mui/material';

function PollSkeleton() {
  return (
    <Card sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
      <CardContent>
        <Stack spacing={1.75}>
          <Skeleton variant="text" sx={{ fontSize: '2rem', borderRadius:0 }} />
          <Skeleton variant="rectangular" height={45} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={45} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={45} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={45} sx={{ borderRadius: 1 }} />
        </Stack>
      </CardContent>
    </Card>
  );
}
export default PollSkeleton;