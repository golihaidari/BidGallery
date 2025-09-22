import { Box, Paper } from "@mui/material";

interface PageTemplateProps {
  children: React.ReactNode;
}

const PageTemplate = ({ children }: PageTemplateProps) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #FFF3E8, #EAE8FF)",
        padding: 2,
      }}
    >
      <Paper
        sx={{
          p: 4,
          maxWidth: 500,
          width: "100%",
          borderRadius: 3,
          backgroundColor: "var(--card-bg)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        {children}
      </Paper>
    </Box>
  );
};

export default PageTemplate;
