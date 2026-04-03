import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import moment from "moment";
import TransactionInfoCard from "../Card/TransactionInfoCard";
import { incomeLabel, incomeIcon, expenseLabel, expenseIcon } from "../../utils/helper";

const RecentTransactions = ({ transactions, onSeeMore }) => {
  return (
    <Card sx={{ height: 1 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Recent transactions
          </Typography>
          <Button variant="text" size="small" endIcon={<ArrowForwardIcon />} onClick={onSeeMore}>
            See all
          </Button>
        </Stack>
        <Stack spacing={0.5}>
          {transactions?.slice(0, 5)?.map((item) => (
            <TransactionInfoCard
              key={item._id}
              title={item.type === "expense" ? expenseLabel(item) : incomeLabel(item)}
              icon={item.type === "expense" ? expenseIcon(item) : incomeIcon(item)}
              amount={item.amount}
              date={moment(item.date).format("DD MMM, YYYY")}
              type={item.type}
              hideDeleteBtn
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
