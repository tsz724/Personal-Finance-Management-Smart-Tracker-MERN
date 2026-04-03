import React, { useMemo } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CustomPieChart from "../Charts/CustomPieChart";
import { aggregateIncomeByCategory } from "../../utils/helper";

const colors = ["#10B981", "#059669", "#047857", "#065F46", "#064E3B", "#022C22", "#14532D", "#166534", "#15803D", "#1E3A1F"];

const IncomeLast60Days = ({ income, totalincome }) => {
  const chartData = useMemo(
    () => aggregateIncomeByCategory(income || []).filter((d) => d.value > 0),
    [income]
  );

  return (
    <Card sx={{ height: 1 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Last 60 days · income
        </Typography>
        {chartData.length > 0 ? (
          <CustomPieChart
            data={chartData}
            label="Total income"
            totalAmount={`$${totalincome}`}
            showTextAnchor
            colors={colors}
          />
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: "center" }}>
            No income in the last 60 days.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeLast60Days;
