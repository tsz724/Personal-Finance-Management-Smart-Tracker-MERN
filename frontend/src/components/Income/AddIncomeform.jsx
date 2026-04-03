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

const AddIncomeform = ({ categories = [], onaddincome }) => {
  const [income, setIncome] = useState({
    category: "",
    amount: "",
    date: "",
    icon: "",
  });

  const handleChange = (key, value) => setIncome({ ...income, [key]: value });

  const hasCategories = categories.length > 0;
  const canSubmit = hasCategories && income.category;

  return (
    <Box sx={{ px: 1, py: 1 }}>
      <EmojiPickerPopup icon={income.icon} onSelect={(selectedIcon) => handleChange("icon", selectedIcon)} />

      <FormControl margin="normal" fullWidth disabled={!hasCategories}>
        <InputLabel id="income-category-label">Category</InputLabel>
        <Select
          labelId="income-category-label"
          label="Category"
          value={income.category}
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
        {!hasCategories && <FormHelperText>Use &quot;Manage categories&quot; before adding income.</FormHelperText>}
      </FormControl>

      <TextField
        label="Amount"
        type="number"
        value={income.amount}
        onChange={(e) => handleChange("amount", e.target.value)}
        margin="normal"
        fullWidth
        inputProps={{ min: 0, step: "any" }}
      />
      <TextField
        label="Date"
        type="date"
        value={income.date}
        onChange={(e) => handleChange("date", e.target.value)}
        margin="normal"
        fullWidth
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button variant="contained" disabled={!canSubmit} onClick={() => onaddincome(income)}>
          Add income
        </Button>
      </Stack>
    </Box>
  );
};

export default AddIncomeform;
