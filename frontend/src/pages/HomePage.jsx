import { Button, Container, Typography } from "@mui/material";

function HomePage() {
  return (
    <Container maxWidth="sm" sx={{ mt: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Home Page
      </Typography>
      
      <Button variant="contained" color="primary">
        Test Button
      </Button>
    </Container>
  );
}

export default HomePage;