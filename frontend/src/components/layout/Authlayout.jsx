import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { alpha } from "@mui/material/styles";

const Authlayout = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        component="header"
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: (t) => t.zIndex.drawer + 2,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: (t) => alpha(t.palette.background.paper, 0.92),
          backdropFilter: "blur(8px)",
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: "auto",
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{
                width: 44,
                height: 44,
                background: (t) =>
                  `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.secondary.main} 100%)`,
              }}
            >
              <ShowChartIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Expensa
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Smart expense tracker
              </Typography>
            </Box>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
            Secure · Fast · Insightful
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, pt: 10, pb: 4, px: 2, display: "flex", alignItems: "center" }}>
        <Paper
          elevation={0}
          sx={{
            maxWidth: 1100,
            width: 1,
            mx: "auto",
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
          }}
        >
          <Grid container>
            <Grid size={{ xs: 12, md: 6 }} sx={{ p: { xs: 3, md: 6 } }}>
              <Box sx={{ minHeight: { xs: "auto", md: 420 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {children}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 4 }}>
                  © {new Date().getFullYear()} Expensa
                </Typography>
              </Box>
            </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "stretch",
                  background: (t) =>
                    `linear-gradient(160deg, ${t.palette.primary.dark} 0%, ${t.palette.secondary.dark} 100%)`,
                  color: "common.white",
                  p: 4,
                }}
              >
                <Stack spacing={3} justifyContent="center" sx={{ width: 1 }}>
                  <Paper
                    sx={{
                      p: 3,
                      bgcolor: (t) => alpha(t.palette.common.white, 0.12),
                      color: "inherit",
                      border: "none",
                    }}
                  >
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Track your income &amp; expenses
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                      $430,000
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      Example aggregate balance
                    </Typography>
                  </Paper>
                  <Paper
                    sx={{
                      p: 2.5,
                      bgcolor: (t) => alpha(t.palette.common.white, 0.1),
                      color: "inherit",
                      border: "none",
                    }}
                  >
                    <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                      Spending rhythm
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="flex-end" sx={{ height: 120 }}>
                      {[0.35, 0.55, 0.75, 0.45, 0.6].map((h, i) => (
                        <Box
                          key={i}
                          sx={{
                            flex: 1,
                            height: `${h * 100}%`,
                            borderRadius: 1,
                            bgcolor: (t) => alpha(t.palette.common.white, 0.75 - i * 0.08),
                          }}
                        />
                      ))}
                    </Stack>
                  </Paper>
                </Stack>
              </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default Authlayout;
