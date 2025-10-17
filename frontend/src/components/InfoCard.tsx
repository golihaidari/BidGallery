import React from "react";
import { Box, Card, Typography, Button } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import GradientButton from "@utils/GradientButton";

interface InfoCardProps {
  title: string;                
  message: string;              
  type?: "success" | "error" | "info"; 
  firstBtnLabel: string;        
  firstBtnAction: () => void;   
  secondBtnLabel?: string;       
  secondBtnAction?: () => void;  
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  message,
  type = "info",
  firstBtnLabel,
  firstBtnAction,
  secondBtnLabel,
  secondBtnAction,
}) => {
  // -----------------------------
  // Define color and icon based on type
  // -----------------------------
  const color =
    type === "success" ? "var(--button-secondary)"   // Green-ish secondary for success
    : type === "error" ? "var(--button-primary)" // Red-ish primary for error
    : "var(--text-secondary)";  // Info color

  const Icon =
    type === "success" ? CheckCircleOutlineIcon
    : type === "error" ? ErrorOutlineIcon
    : InfoOutlinedIcon;

  const bgColor = "var(--input-bg)";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "70vh",
      }}
    >
      <Card
        sx={{
          width: "100%",
          minWidth: 250,
          maxWidth:450,
          textAlign: "center",
          p: 4,
          borderRadius: "var(--border-radius)",
          boxShadow: "var(--card-shadow)",
          backgroundColor: bgColor,
        }}
      >
        {/* Icon */}
        <Icon sx={{ color, fontSize: 55, mb: 1 }} />

        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            color,
            fontWeight: "bold",
            mb: 2,
          }}
        >
          {title}
        </Typography>

        {/* Message */}
        <Typography variant="body1" sx={{ mb: 3, color: "var(--text-primary)" }}>
          {message}
        </Typography>

        {/* Buttons */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <GradientButton 
           onClick={firstBtnAction}
           fullWidth sx={{ mt: 2 }}
           disabled={false} 
          >
            {firstBtnLabel}
          </GradientButton>

          {secondBtnLabel && secondBtnAction && ( // second button is conditional to be visible
            <Button
              variant="outlined"
              sx={{
                borderColor: "var(--button-secondary)",
                color: "var(--button-secondary)", "&:hover": {
                  backgroundColor: "var(--accent)",
                  borderColor: "var(--button-secondary)",
                },
              }}
              onClick={secondBtnAction}
            >
              {secondBtnLabel}
            </Button>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default InfoCard;
