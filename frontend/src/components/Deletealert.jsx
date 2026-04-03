import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

const Deletealert = ({ content, onDelete }) => {
  return (
    <Box sx={{ px: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {content}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 1 }}>
        <Button variant="contained" color="error" onClick={onDelete}>
          Delete
        </Button>
      </Box>
    </Box>
  );
};

export default Deletealert;
