import React, { useMemo } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import Custombarchart from "../Charts/Custombarchart";
import CustomPieChart from "../Charts/CustomPieChart";
import { aggregateExpenseByCategory, addThousandSeparators } from "../../utils/helper";

const pieColors = [
  "#dc2626",
  "#b91c1c",
  "#991b1b",
  "#7f1d1d",
  "#ef4444",
  "#f87171",
  "#fca5a5",
  "#991b1b",
  "#be123c",
  "#9f1239",
];

const ExpenseOverview = ({ transactions, onAddExpense, onManageCategories }) => {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    const groups = transactions.reduce((acc, item) => {
      const dateKey = item?.date ? new Date(item.date).toISOString().split("T")[0] : "Unknown";
      if (!acc[dateKey]) acc[dateKey] = 0;
      acc[dateKey] += item?.amount || 0;
      return acc;
    }, {});
    return Object.keys(groups)
      .map((date) => ({ date, amount: groups[date] }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [transactions]);

  const categoryPieData = useMemo(
    () => aggregateExpenseByCategory(transactions).filter((d) => d.value > 0),
    [transactions]
  );

  const categoryTotal = useMemo(() => categoryPieData.reduce((s, d) => s + d.value, 0), [categoryPieData]);

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Expense overview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Spot trends and see how spending splits across categories.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {onManageCategories && (
              <Button variant="outlined" startIcon={<CategoryIcon />} onClick={onManageCategories}>
                Categories
              </Button>
            )}
            <Button variant="contained" startIcon={<AddIcon />} onClick={onAddExpense}>
              Add expense
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ mt: 3 }}>
          <Custombarchart data={chartData} />
        </Box>

        {categoryPieData.length > 0 && (
          <>
            <Divider sx={{ my: 4 }} />
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Expenses by category
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Totals across all loaded expense entries.
            </Typography>
            <CustomPieChart
              data={categoryPieData}
              label="Total expenses"
              totalAmount={`$${addThousandSeparators(categoryTotal)}`}
              colors={pieColors}
              showTextAnchor
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseOverview;
