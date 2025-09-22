import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#FF6F61" },      // Coral button
    secondary: { main: "#4ED2C2" },    // Teal accent
    background: { default: "#FFF3E8" },
    text: { primary: "#1A1F36", secondary: "#6B5FA5" },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  shape: {
    borderRadius: 12,
  },
});

export default theme;
