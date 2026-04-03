import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CustomPieChart from "../Charts/CustomPieChart";

const colors = ["#10b981", "#ef4444", "#2563EB"];

const FinanceOverview = ({ totalBalance, totalIncome, totalExpense }) => {
  const chartData = [
    { name: "Income", value: totalIncome },
    { name: "Expense", value: totalExpense },
    { name: "Balance", value: Math.max(totalBalance, 0) },
  ];

  const filteredData = chartData.filter((item) => item.value > 0);

  return (
    <Card sx={{ height: 1 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Financial overview
        </Typography>
        <CustomPieChart
          data={filteredData}
          label="Total balance"
          totalAmount={`$${totalBalance}`}
          colors={colors}
          showTextAnchor
        />
      </CardContent>
    </Card>
  );
};

export default FinanceOverview;
