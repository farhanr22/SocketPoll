import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import defaultTheme from "./themes/defaultTheme";

import HomePage from "./pages/HomePage";
import VotingPage from "./pages/VotingPage";
import ResultsPage from "./pages/ResultsPage";

function App() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/p/:pollId" element={<VotingPage />} />
          <Route path="/r/:pollId" element={<ResultsPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;