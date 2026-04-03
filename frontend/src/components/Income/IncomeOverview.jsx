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
import { aggregateIncomeByCategory, addThousandSeparators } from "../../utils/helper";

const pieColors = [
  "#10B981",
  "#059669",
  "#047857",
  "#065F46",
  "#064E3B",
  "#022C22",
  "#14532D",
  "#166534",
  "#15803D",
  "#1E3A1F",
];

const IncomeOverview = ({ transactions, onAddIncome, onManageCategories }) => {
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
    () => aggregateIncomeByCategory(transactions).filter((d) => d.value > 0),
    [transactions]
  );

  const categoryTotal = useMemo(() => categoryPieData.reduce((s, d) => s + d.value, 0), [categoryPieData]);

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Income overview
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Track earnings over time and see composition by category.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {onManageCategories && (
              <Button variant="outlined" startIcon={<CategoryIcon />} onClick={onManageCategories}>
                Categories
              </Button>
            )}
            <Button variant="contained" startIcon={<AddIcon />} onClick={onAddIncome}>
              Add income
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
              Income by category
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Totals across all loaded income entries.
            </Typography>
            <CustomPieChart
              data={categoryPieData}
              label="Total income"
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

export default IncomeOverview;
