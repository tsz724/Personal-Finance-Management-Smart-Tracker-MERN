import React, { useContext, useState } from "react";
import { UserContext } from "../../context/UserContext";
import Box from "@mui/material/Box";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const SIDEBAR_WIDTH = 260;

const Homelayout = ({ activeMenu, children }) => {
  const { user } = useContext(UserContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <Navbar onMenuOpen={() => setMobileOpen(true)} />
      {user && (
        <Box sx={{ display: "flex", flex: 1 }}>
          <Sidebar
            activeMenu={activeMenu}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
            drawerWidth={SIDEBAR_WIDTH}
          />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 3 },
              width: {
                md: `calc(100% - ${SIDEBAR_WIDTH}px)`,
              },
              maxWidth: { md: 1280 },
              mx: "auto",
            }}
          >
            {children}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Homelayout;
