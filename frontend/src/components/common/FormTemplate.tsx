import type { ReactNode } from "react"; 
import { Box, Typography } from "@mui/material";
import GradientButton from "./GradientButton";
import CircularProgress from "@mui/material/CircularProgress";

interface FormTemplateProps {
  title: string;
  children: ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void; // accept the form event
  loading?: boolean;
  error?: string;
  retry?: () => void;
  submitLabel?: string;
  disableSubmit?: boolean; // <-- add this
}

const FormTemplate: React.FC<FormTemplateProps> = ({
  title,
  children,
  onSubmit,
  loading = false,
  error,
  submitLabel = "Submit",
  disableSubmit = true
}) => {
  return (
    <div className="global-container">
    <Box 
      sx={{
        width: "100%",
        maxWidth: 450,
        padding: { xs: 2, sm: 3 },
        borderRadius: 3,
        backgroundColor: "#fff",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
        textAlign: "center",
         margin: 0,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <Typography variant="h6" sx={{ mb: 3 }}>
        {title}
      </Typography>

      {error && (
        <>
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        </>
      )}
      
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.(e);
        }}
        style={{
          opacity: loading ? 0.5 : 1, // dim form while loading
          pointerEvents: loading ? "none" : "auto", // prevent interaction
        }}
      >
        {children}
        {onSubmit && (
          <GradientButton 
           type="submit"
           fullWidth sx={{ mt: 2 }}
            disabled={loading || disableSubmit} // disable if loading or disabled is true
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : submitLabel}
          </GradientButton>
        )}
      </form>
    </Box>
    </div>
  );
};

export default FormTemplate;
