import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";

function BarTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={2} sx={{ p: 1.5, border: 1, borderColor: "divider" }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {new Date(payload[0].payload.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Typography>
        <Typography variant="body2" fontWeight={700}>
          ${payload[0].value}
        </Typography>
      </Paper>
    );
  }
  return null;
}

const Custombarchart = ({ data }) => {
  const theme = useTheme();
  const primary = theme.palette.primary.main;
  const secondary = theme.palette.secondary.light;

  const getBarColor = (index) => (index % 2 === 0 ? primary : secondary);

  return (
    <Stack sx={{ mt: 2 }}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
            stroke="none"
            tickFormatter={(str) => {
              const date = new Date(str);
              return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
            }}
          />
          <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary }} stroke="none" />
          <Tooltip content={<BarTooltip />} cursor={{ fill: "transparent" }} />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Stack>
  );
};

export default Custombarchart;
