import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline, Container } from "@mui/material";
import defaultTheme from "./themes/defaultTheme";

import HomePage from "./pages/HomePage";
import VotingPage from "./pages/VotingPage";
import ResultsPage from "./pages/ResultsPage";
import ResultsErrorCard from "./components/ResultsErrorCard";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/p/:pollId" element={<VotingPage />} />
          <Route path="/r/:pollId" element={<ResultsPage />} />
          <Route path="*" element={
            <>
              <Header />
              <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
                <ResultsErrorCard message="Page not found. The link may be incorrect." />
              </Container>
              <Footer />
            </>
          } />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
