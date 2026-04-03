import React from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { addThousandSeparators } from "../../utils/helper";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 1.5, border: 1, borderColor: "divider" }}>
        <Typography variant="body2" fontWeight={600}>
          {payload[0].name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Amount:{" "}
          <Typography component="span" variant="body2" fontWeight={700} color="text.primary">
            ${addThousandSeparators(payload[0].value)}
          </Typography>
        </Typography>
      </Paper>
    );
  }
  return null;
};

export default CustomTooltip;
