import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import moment from "moment";
import TransactionInfoCard from "../Card/TransactionInfoCard";
import { incomeLabel, incomeIcon } from "../../utils/helper";

const IncomeList = ({ income, onSeeMore }) => {
  return (
    <Card sx={{ height: 1 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Income
          </Typography>
          <Button variant="text" size="small" endIcon={<ArrowForwardIcon />} onClick={onSeeMore}>
            See all
          </Button>
        </Stack>
        <Stack spacing={0.5}>
          {income?.slice(0, 5)?.map((row) => (
            <TransactionInfoCard
              key={row._id}
              title={incomeLabel(row)}
              icon={incomeIcon(row)}
              date={moment(row.date).format("Do MMM YYYY")}
              amount={row.amount}
              type="income"
              hideDeleteBtn
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default IncomeList;
