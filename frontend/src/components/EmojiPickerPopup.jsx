import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import ImageIcon from "@mui/icons-material/Image";
import CloseIcon from "@mui/icons-material/Close";

const EmojiPickerPopup = ({ icon, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 2, mb: 2 }}>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }}
        onClick={() => setIsOpen(true)}
      >
        <Paper
          elevation={0}
          sx={{
            width: 52,
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: 1,
            borderColor: "divider",
          }}
        >
          {icon ? (
            <Box component="img" src={icon} alt="" sx={{ width: 40, height: 40 }} />
          ) : (
            <ImageIcon color="action" />
          )}
        </Paper>
        <Typography variant="body2" color="text.secondary">
          {icon ? "Change icon" : "Pick icon"}
        </Typography>
      </Box>

      {isOpen && (
        <Box sx={{ position: "relative" }}>
          <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ position: "absolute", right: -8, top: -8, zIndex: 1 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
          <EmojiPicker
            open={isOpen}
            onEmojiClick={(emoji) => {
              onSelect(emoji?.imageUrl || "");
              setIsOpen(false);
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default EmojiPickerPopup;
