import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import EmojiPickerPopup from "../EmojiPickerPopup";

const AddExpenseform = ({ categories = [], onaddexpense }) => {
  const [expense, setExpense] = useState({
    category: "",
    amount: "",
    date: "",
    icon: "",
  });

  const handleChange = (key, value) => setExpense({ ...expense, [key]: value });

  const hasCategories = categories.length > 0;
  const canSubmit = hasCategories && expense.category;

  return (
    <Box sx={{ px: 1, py: 1 }}>
      <EmojiPickerPopup icon={expense.icon} onSelect={(selectedIcon) => handleChange("icon", selectedIcon)} />

      <FormControl margin="normal" fullWidth disabled={!hasCategories}>
        <InputLabel id="expense-category-label">Category</InputLabel>
        <Select
          labelId="expense-category-label"
          label="Category"
          value={expense.category}
          onChange={(e) => handleChange("category", e.target.value)}
        >
          <MenuItem value="">
            <em>{hasCategories ? "Select a category" : "Create a category first"}</em>
          </MenuItem>
          {categories.map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
        {!hasCategories && (
          <FormHelperText>Use &quot;Categories&quot; to add at least one category before recording expenses.</FormHelperText>
        )}
      </FormControl>

      <TextField
        label="Amount"
        type="number"
        value={expense.amount}
        onChange={(e) => handleChange("amount", e.target.value)}
        margin="normal"
        fullWidth
        inputProps={{ min: 0, step: "any" }}
      />
      <TextField
        label="Date"
        type="date"
        value={expense.date}
        onChange={(e) => handleChange("date", e.target.value)}
        margin="normal"
        fullWidth
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button variant="contained" disabled={!canSubmit} onClick={() => onaddexpense(expense)}>
          Add expense
        </Button>
      </Stack>
    </Box>
  );
};

export default AddExpenseform;
