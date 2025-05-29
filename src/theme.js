import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#111111", // near-black
      light: "#333333",
      dark: "#000000",
    },
    secondary: {
      main: "#555555", // muted gray (optional)
      light: "#777777",
      dark: "#333333",
    },
    background: {
      default: "#ffffff", // white background
      paper: "#ffffff",
    },
    text: {
      primary: "#111111", // black text
      secondary: "#555555", // muted gray text
    },
  },
  typography: {
    fontFamily: '"Geist", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
          backgroundColor: "#ffffff",
        },
      },
    },
  },
});

export default theme;
