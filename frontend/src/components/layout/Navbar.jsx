import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import MenuIcon from "@mui/icons-material/Menu";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";

const Navbar = ({ onMenuOpen }) => {
  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Toolbar sx={{ maxWidth: 1440, width: "100%", mx: "auto", px: { xs: 1, sm: 2 } }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuOpen}
          sx={{ mr: 1, display: { md: "none" } }}
          aria-label="open menu"
        >
          <MenuIcon />
        </IconButton>

        <Avatar
          sx={{
            width: 40,
            height: 40,
            mr: 1.5,
            background: (t) =>
              `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.secondary.main} 100%)`,
          }}
        >
          <BusinessCenterIcon fontSize="small" />
        </Avatar>

        <Box sx={{ lineHeight: 1.2 }}>
          <Typography variant="h6" component="div" fontWeight={800}>
            BusinessHub
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Business management platform
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: { xs: "none", sm: "block" } }}
        >
          Finance · Operations · People
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
