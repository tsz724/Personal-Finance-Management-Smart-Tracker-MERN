export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isStrongPassword = (value, minLength = 8) => {
	if (!value) return false;
	return value.length >= minLength;
}

/** Display label for an income row (populated category or legacy source). */
export const incomeLabel = (income) =>
  income?.category?.name ?? income?.source ?? "Income";

/** Icon URL for an income row (transaction icon overrides category default). */
export const incomeIcon = (income) =>
  income?.icon || income?.category?.icon || "";

/** Aggregate amounts by category name for charts. */
export const aggregateIncomeByCategory = (items = []) => {
  const map = {};
  for (const item of items) {
    const name = incomeLabel(item);
    map[name] = (map[name] || 0) + (Number(item?.amount) || 0);
  }
  return Object.entries(map).map(([name, value]) => ({ name, value }));
};

/** Display label for an expense row (populated category doc uses expenseCategory; legacy uses category string). */
export const expenseLabel = (expense) =>
  expense?.expenseCategory?.name ?? expense?.category ?? "Expense";

/** Icon URL for an expense row. */
export const expenseIcon = (expense) =>
  expense?.icon || expense?.expenseCategory?.icon || "";

export const aggregateExpenseByCategory = (items = []) => {
  const map = {};
  for (const item of items) {
    const name = expenseLabel(item);
    map[name] = (map[name] || 0) + (Number(item?.amount) || 0);
  }
  return Object.entries(map).map(([name, value]) => ({ name, value }));
};

export const addThousandSeparators = (number) => {
  if (number == null || isNaN(number)) return "";

  const parts = number.toString().split(".");
  const integerPart = parts[0];
  const fractionalPart = parts[1];

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  return fractionalPart ? `${formattedInteger}.${fractionalPart}` : formattedInteger;
};
