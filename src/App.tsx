import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { Provider } from "react-redux";
import CssBaseline from "@mui/material/CssBaseline";


// Components

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Species from "./pages/Species";
import Community from "./pages/Community";
import Observe from "./pages/Observe";

// Store
import { store } from "./store";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2196f3",
    },
    secondary: {
      main: "#4caf50",
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Observation" element={<Observe />} />
            <Route path="/species" element={<Species />} />
            <Route path="/community" element={<Community />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
