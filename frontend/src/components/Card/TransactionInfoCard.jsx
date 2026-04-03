import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import { LuUtensils, LuTrendingUp, LuTrendingDown, LuTrash2 } from "react-icons/lu";
import { alpha } from "@mui/material/styles";

const TransactionInfoCard = ({ title, icon, date, amount, type, hideDeleteBtn, onDelete }) => {
  const isIncome = type === "income";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        py: 1.5,
        px: 1,
        borderRadius: 2,
        "&:hover": { bgcolor: (t) => alpha(t.palette.action.hover, 0.06) },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "action.hover",
          fontSize: "1.25rem",
          flexShrink: 0,
        }}
      >
        {icon ? (
          <Box component="img" src={icon} alt="" sx={{ width: 28, height: 28 }} />
        ) : (
          <LuUtensils />
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {date}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {!hideDeleteBtn && (
          <IconButton size="small" onClick={onDelete} sx={{ opacity: 0.65, "&:hover": { opacity: 1, color: "error.main" } }}>
            <LuTrash2 size={18} />
          </IconButton>
        )}
        <Chip
          size="small"
          icon={isIncome ? <LuTrendingUp size={14} /> : <LuTrendingDown size={14} />}
          label={`${isIncome ? "+" : "-"} $${amount}`}
          sx={{
            fontWeight: 600,
            bgcolor: (t) => alpha(isIncome ? t.palette.success.main : t.palette.error.main, 0.12),
            color: isIncome ? "success.dark" : "error.dark",
            "& .MuiChip-icon": { color: "inherit" },
          }}
        />
      </Box>
    </Box>
  );
};

export default TransactionInfoCard;
