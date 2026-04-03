import React, { useMemo } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Custombarchart from "../Charts/Custombarchart";

const ExpensesLast60days = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const groups = data.reduce((acc, item) => {
      const dateKey = item?.date ? new Date(item.date).toISOString().split("T")[0] : "Unknown";
      if (!acc[dateKey]) acc[dateKey] = 0;
      acc[dateKey] += item?.amount || 0;
      return acc;
    }, {});
    return Object.keys(groups)
      .map((date) => ({ date, amount: groups[date] }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [data]);

  return (
    <Card sx={{ minHeight: 360 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Last 60 days · expenses
        </Typography>
        {chartData.length > 0 ? (
          <Custombarchart data={chartData} />
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
            <Typography color="text.secondary">No expense data for this period.</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpensesLast60days;
