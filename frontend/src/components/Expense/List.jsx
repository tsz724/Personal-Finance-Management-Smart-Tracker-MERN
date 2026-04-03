import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import DownloadIcon from "@mui/icons-material/Download";
import moment from "moment";
import TransactionInfoCard from "../Card/TransactionInfoCard";
import { expenseLabel, expenseIcon } from "../../utils/helper";

const List = ({ transactions, onDelete, onDownload }) => {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Expense details
          </Typography>
          <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={onDownload}>
            Download
          </Button>
        </Box>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          {transactions?.map((expense) => (
            <Grid key={expense._id} size={{ xs: 12, md: 6 }}>
              <TransactionInfoCard
                title={expenseLabel(expense)}
                icon={expenseIcon(expense)}
                date={moment(expense.date).format("Do MMM YYYY")}
                amount={expense.amount}
                type="expense"
                onDelete={() => onDelete(expense._id)}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default List;
