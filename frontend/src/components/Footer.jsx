import { Box, Typography, Link } from '@mui/material';

function Footer() {
    return (
        <Box component="footer" sx={{ mt: 8, py: 2, textAlign: 'center' }}>
            {/* Update text later */}
            <Typography variant="body2" color="text.secondary">
                Poll App description text
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Check out the project on{' '}
                <Link
                    href="https://github.com/your-repo/quickpoll" // Update later
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    GitHub
                </Link>
            </Typography>
        </Box>
    );
}

export default Footer;