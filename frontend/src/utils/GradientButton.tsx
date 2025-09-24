import React from "react";
import type { ButtonProps } from "@mui/material";
import {Button} from "@mui/material";

interface GradientButtonProps extends ButtonProps {
  children: React.ReactNode;
}

const GradientButton: React.FC<GradientButtonProps> = ({ children, ...props }) => {
  return (
    <Button
      {...props}
      sx={{       
        borderRadius: 1, // 16px
        fontWeight: 600,
        fontSize: "1rem",
        textTransform: "none",
        color: "var(--button-text)",
        background: "linear-gradient(90deg, var(--button-primary), var(--accent))",
        "&:hover": {
          background: "linear-gradient(90deg, var(--button-secondary), var(--accent))",
        },
        ...props.sx, // allow overrides
      }}
    >
      {children}
    </Button>
  );
};

export default GradientButton;
