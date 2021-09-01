import "./App.css";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { Router } from "@reach/router";
import { LocalizationProvider } from "@material-ui/lab";
import AdapterDateFns from "@material-ui/lab/AdapterDateFns";
import Login from "page/Login";
import Dashboard from "page/Dashboard";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <Login path="/" />
          <Dashboard path="/Dashboard" />
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

const theme = createTheme({
  breakpoints: {
    values: {
      mobile: 0,
      tablet: 640,
      laptop: 1024,
      desktop: 1280,
    },
  },
  palette: {
    primary: {
      main: "#fcba03",
      light: "#e8e8e8",
    },
    bg: {
      main: "#FFFFF",
    },
  },
});

export default App;
