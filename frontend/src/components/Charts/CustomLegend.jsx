import React from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

const CustomLegend = ({ payload }) => {
  return (
    <Stack
      direction="row"
      flexWrap="wrap"
      justifyContent="center"
      spacing={2}
      sx={{ mt: 2, gap: 2 }}
    >
      {payload.map((entry, index) => (
        <Stack key={`legend-${index}`} direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: entry.color,
            }}
          />
          <Typography variant="body2">{entry.value}</Typography>
        </Stack>
      ))}
    </Stack>
  );
};

export default CustomLegend;
