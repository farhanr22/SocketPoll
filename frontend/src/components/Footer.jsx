import { Box, Typography, Link } from '@mui/material';

function Footer() {
    return (
        <Box component="footer" sx={{ mt: 6, mb: 3, py: 2, textAlign: 'center' }}>
            <Box sx={{ maxWidth: '430px', mx: 'auto' }}>
                <Typography variant="body2" color="text.secondary" component="div">
                    Create, share, and view real-time results from anonymous polls.
                    
                    {/* Line break that doesn't apply on smaller screens */}
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }} />             
                    {' '} Built with FastAPI, React, and WebSockets.

                    {' '}
                    <Link
                        href="https://github.com/farhanr22/socketpoll"
                        target="_blank" rel="noopener noreferrer"
                    >
                        View on GitHub
                    </Link>
                    .
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    All poll data is automatically deleted after 7 days.
                </Typography>
            </Box>
        </Box>

    );
}

export default Footer;